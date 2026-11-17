Project walkthrough · SSE-chat-ai

# SSE Voice Chat Internals

You speak, the browser streams your voice to a NestJS server, and three services run in a chain: Deepgram turns speech into text, Gemini writes a reply, and ElevenLabs turns the reply into speech. Everything comes back to the browser over a single Server-Sent Events stream.

**The browser never uses a WebSocket.** Audio goes up as many small HTTP `POST` requests, and results come down over one long-lived SSE connection. The only WebSocket in the system is between the server and Deepgram.

01 · Architecture

## The big picture

Upload (HTTP POST per chunk) Download (Server-Sent Events) WebSocket (server ↔ Deepgram only) Streaming HTTP to providers

| Layer | File | Role |
| --- | --- | --- |
| Recorder | `client/hooks/useAudioRecorder.ts` | Captures the mic and POSTs audio chunks |
| SSE client | `client/hooks/useSSE.ts` | Opens the `EventSource` and collects events |
| UI | `client/app/page.tsx` | Chat bubbles and the audio playback queue |
| HTTP entry | `conversation.controller.ts` | `GET /sse` and `POST /audio`, with validation |
| Coordinator | `conversation.service.ts` | Session registry; connects STT → LLM → TTS |
| Providers | `server/src/integrations/` | Thin wrappers around each provider's SDK |
| Config | `config/configuration.ts` | Typed config; checks env at startup |

02 · Startup

## What happens when the server starts

1. `main.ts` creates the Nest app and sets up CORS, a raw body parser for `application/octet-stream` (5 MB limit, so audio arrives as a Node `Buffer`), shutdown hooks, and the port from config.
2. `ConfigModule` loads `.env` and runs `validateEnv`. If an API key is missing or `PORT` isn't a number, the server refuses to start.
3. `ConversationModule` creates one shared instance each of the Deepgram, Gemini and ElevenLabs services. Each builds its SDK client once, with its key from config.
4. Nothing connects to a provider yet. Connections open only when they're needed.

03 · One turn

## One conversation turn, step by step

1. ### The browser opens the SSE stream SSE

   `page.tsx` creates `sessionId = crypto.randomUUID()` on first load, and `useSSE` opens `new EventSource('…/sse?sessionId=…')`. On the server, `ParseUUIDPipe` checks the ID and `openSession()` returns an RxJS `Observable`. When Nest subscribes, the service stores a session:

   ```
   { id, subscriber, transcriber?: undefined,
     replyQueue: Promise.resolve(), closed: false }
   ```

   Nest's `@Sse` keeps the response open with `Content-Type: text/event-stream`. Each `subscriber.next({ data })` is written as one event:

   ```
   data: {"type":"token","text":"Paris is"}\n\n
   ```

   If the same `sessionId` reconnects, the old session is closed and replaced. A check of `sessions.get(id) === session` stops an old disconnect from removing the newer session.
2. ### The mic audio is cut into chunks POST

   Clicking the mic calls `getUserMedia({audio:true})` and `new MediaRecorder(stream)`. In Chrome this records a WebM container with the Opus codec. `mediaRecorder.start(250)` makes the browser produce a `Blob` every 250 ms.

   **#1**WebM header + audio

   **#2**audio cluster

   **#3**audio cluster

   **#4**audio cluster

   **…**every 250 ms

   These chunks are slices of one continuous file, not separate audio files. Only chunk #1 carries the header that describes the codec and sample rate; a later chunk can't be decoded on its own. So the receiver must get chunk #1 first and every chunk in order. This rule drives most of the server design.

   ```
   POST /audio?sessionId=<uuid>
   Content-Type: application/octet-stream
   <bytes>
   ```
3. ### The server receives a chunk

   The controller checks that the body is a non-empty `Buffer` and the session exists: **400** for a bad body or ID, **404** for an unknown session. `pushAudio()` then connects to Deepgram lazily, on the first chunk or whenever the previous Deepgram connection has closed.
4. ### Deepgram's WebSocket and the buffering queue WebSocket

   `client.listen.live({...})` opens a WebSocket to Deepgram's live transcription endpoint:

   | Option | Meaning |
   | --- | --- |
   | `model: nova-3` | Speech-recognition model |
   | `language: en-US` | Language |
   | `smart_format: true` | Adds punctuation, capitals and number formatting |
   | `interim_results: true` | Sends draft guesses while you're still talking |

   Opening the socket takes a few hundred milliseconds, but audio arrives straight away. Dropping the early chunks would lose the WebM header and break the whole stream, so the service holds them in a queue until the socket opens:

   ```
   send(chunk):
     if closed     → ignore
     else if open  → socket.send(chunk)
     else          → pending.push(chunk)        // still connecting

   on Open:
     open = true
     for chunk in pending (in order) → socket.send(chunk)   // header goes first
     pending = []

   on Close: closed = true, pending = []
   ```

   Each chunk is copied from the Node `Buffer` into a standalone `ArrayBuffer`. Buffers are often views into a larger shared memory pool, so sending `buffer.buffer` directly could send unrelated bytes.
5. ### Transcripts come back: interim, then final

   Deepgram sends JSON results over the same WebSocket. The service reads `channel.alternatives[0].transcript` and `is_final`. From the test run:

   ```
   "What is the capital"              isFinal:false   ← interim (draft)
   "What is the capital of France?"   isFinal:false   ← interim (revised)
   "What is the capital of France?"   isFinal:true    ← final (locked in)
   ```

   Every transcript goes to the browser as a `transcript` event, for live captions. Only a final, non-empty transcript starts an AI reply.
6. ### Replies run one at a time

   Two sentences spoken quickly produce two final transcripts. If both replies ran at once, their text and audio would mix in the stream. The service lines them up with a promise chain:

   ```
   session.replyQueue = session.replyQueue.then(() => this.reply(session, text));
   ```

   Each reply starts only after the previous one finishes. `reply()` catches its own errors, so one failure never blocks the replies after it.
7. ### Gemini streams the reply text HTTP stream

   `model.generateContentStream(prompt)` calls `…:streamGenerateContent?alt=sse`, and Google streams the answer back as its own SSE stream. Each piece (usually a few words, not a single token) is forwarded at once as a `token` event and added to `fullText`.

   There is no conversation memory. The prompt is only the latest final transcript (PRD FR-7, not built yet).
8. ### ElevenLabs streams the speech HTTP chunked

   Only after Gemini finishes, `fullText` goes to `client.generate({ voice, model_id: eleven_turbo_v2_5, stream: true })`. ElevenLabs returns MP3 audio as a chunked HTTP response, in pieces of whatever size the network delivers.

   Each piece is base64-encoded, because SSE only carries text, and sent as `{type:'audio', audio:'…'}`. Base64 makes the data about 33% bigger. Before each step the service checks `session.closed`, so work stops if the user disconnects.
9. ### The browser shows and plays the results

   | Event | What the UI does |
   | --- | --- |
   | `transcript` interim | Shows a faded "you're speaking…" bubble |
   | `transcript` final | Moves the previous AI reply into history, then adds your message |
   | `token` | Appends text to the streaming AI bubble, with a blinking cursor |
   | `audio` | Adds the base64 MP3 to `audioQueue` |
   | `error` | Clears the streaming bubble and shows the error as an AI message |

   Playback is first-in, first-out: if nothing is playing, play `new Audio('data:audio/mp3;base64,' + queue[0])`; when it ends or fails, drop it and play the next.
10. ### Cleanup

    When the browser closes the SSE connection (tab closed, refresh), the Observable's cleanup function runs `closeSession()`. It sets `closed = true`, closes the Deepgram WebSocket, ends the stream and removes the session from the map. On server shutdown, `onModuleDestroy` closes every session.

04 · Chunking

## Chunking at each stage

| Stage | Chunk unit | Size / timing | Format | Transport |
| --- | --- | --- | --- | --- |
| Mic → server | MediaRecorder blob | Every 250 ms | WebM/Opus; only #1 has the header | HTTP POST each |
| Server → Deepgram | Same bytes, held until open | Same as above | WebM/Opus | WebSocket binary |
| Deepgram → server | Transcript result | Several per second | JSON | WebSocket text |
| Gemini → server | Piece of the answer | A few words each | JSON over SSE | HTTP stream |
| Server → browser | `token` event | One per Gemini piece | JSON in `data:` | SSE |
| ElevenLabs → server | MP3 bytes | Whatever the network delivers | MP3 | HTTP chunked |
| Server → browser | `audio` event | One per MP3 piece | base64 in JSON | SSE |

05 · Transport choice

## Why SSE plus POST instead of a browser WebSocket

### Pros

- SSE is plain HTTP and simple in Nest (`@Sse` + Observable).
- `EventSource` is built into browsers.
- Works through most proxies.

### Cons

- SSE is one-way, so audio needs a separate upload path: many POSTs, each with full HTTP overhead.
- The order of those POSTs isn't guaranteed, which is risky given the WebM ordering rule.
- Audio has to travel as base64 text.

The PRD keeps this design for now. A single browser WebSocket would remove the ordering and overhead problems.

06 · Techniques

## Techniques used

There's no custom algorithm. The system is built from these streaming patterns:

- **Time-slice chunking:** `MediaRecorder` cuts audio every 250 ms.
- **Buffer until open:** an in-order queue guarantees the WebM header reaches Deepgram first.
- **Lazy connect and reconnect:** one Deepgram socket per session, opened when audio arrives and reopened if it closed.
- **Interim, then final transcripts:** drafts for live captions, final text to trigger a reply.
- **Promise-chain queue:** one reply at a time per session.
- **Observable streaming:** RxJS turns server events into a client stream, and its cleanup function handles teardown.
- **Client playback queue:** plays audio pieces in order.
- **Closed flags:** stop work once the client disconnects.

07 · Limitations

## Known limitations

Found by reading the code, not by testing.

- Client

  **Audio POSTs can arrive out of order.**The recorder fires every 250 ms without waiting for the previous POST. A slow request can be overtaken, which would corrupt the WebM stream sent to Deepgram.
- Server

  **A fast stop/start may break transcription.**A new recording sends a second WebM header down the same Deepgram socket if it hasn't closed yet (it closes after about 10 s of silence without a KeepAlive). Deepgram probably can't decode a second header mid-stream.
- Server

  **A dropped Deepgram connection mid-recording isn't recoverable.**The reconnect never receives the header chunk.
- Server

  **Replies can trigger too early.**`is_final` locks in a segment of speech, not the end of what you're saying, which is why two sentences produced two replies. Deepgram's `speech_final` / `UtteranceEnd` would detect the end more reliably (PRD M1).
- Server

  **Higher latency than needed.**Speech synthesis waits for the whole Gemini reply. Sending each sentence to ElevenLabs as it completes would cut the delay noticeably.
- Client

  **The client drops events.**The page only processes the last event per render, so quick bursts of `token` or `audio` events are skipped. The message list also grows forever.
- Client

  **Choppy audio.**Each MP3 piece plays as a separate `Audio` element. Pieces can split audio frames, causing gaps or clicks. Web Audio or MediaSource would play it smoothly.
- Both

  **No reconnect, memory or scaling.**`useSSE` closes on error and never reconnects. There's no chat history. Sessions live in one process's memory, so the server can't run as more than one instance.

Snapshot of the code as of 17 November 2026. At the time of testing, Deepgram transcription worked end to end; the Gemini API key was rejected, so the reply and speech steps were verified separately.