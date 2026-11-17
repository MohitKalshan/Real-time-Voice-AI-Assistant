# Relay

Real-time voice chat over SSE (repo: SSE-chat-ai).

A real-time voice assistant. You talk in the browser, and the app replies with streamed text and spoken audio.

- **Speech-to-text:** [Deepgram](https://deepgram.com) (`nova-3`, live streaming)
- **Reply generation:** [Google Gemini](https://ai.google.dev) (`gemini-2.5-flash`, streaming)
- **Text-to-speech:** [ElevenLabs](https://elevenlabs.io) (`eleven_turbo_v2_5`, streaming)
- **Transport:** audio goes up as HTTP `POST` chunks; everything comes back over one [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) stream

| Part | Stack | Port |
|---|---|---|
| [`client/`](client/) | Next.js 16, React 19, Tailwind CSS 4 | 3000 |
| [`server/`](server/) | NestJS 11, RxJS | 3001 |

## How it works

```
Browser                         Server (NestJS)                    Providers
───────                         ───────────────                    ─────────
MediaRecorder ── POST /audio ─▶ ConversationController
 (250 ms WebM/Opus chunks)        │
                                  ▼
                                ConversationService ◀── WebSocket ──▶ Deepgram (STT)
                                  │  per-session state      HTTP stream ─▶ Gemini (LLM)
                                  │  reply queue            HTTP chunked ─▶ ElevenLabs (TTS)
EventSource ◀═══ GET /sse ═════ emit()
 (transcript, token, audio, error events)
```

One turn, in short:

1. The browser creates a session ID (UUID v4) and opens `GET /sse?sessionId=…`.
2. While you hold the mic on, `MediaRecorder` produces a chunk every 250 ms and the browser POSTs each one to `/audio`.
3. The server streams the chunks to Deepgram over a WebSocket. Chunks are held in a queue until the socket opens, because only the first chunk contains the WebM header.
4. Deepgram returns interim transcripts (shown as live captions) and final transcripts.
5. Each final transcript triggers a reply. Replies for a session run one at a time.
6. Gemini streams the reply text, forwarded as `token` events.
7. Once the text is complete, ElevenLabs streams MP3 audio, forwarded as base64 `audio` events. The browser plays them in order.
8. Closing the tab closes the SSE stream, which closes the Deepgram socket and removes the session.

The browser never opens a WebSocket. The only WebSocket is between the server and Deepgram.

## Prerequisites

- Node.js 20.9 or later (tested with 22)
- API keys for Deepgram, Google Gemini (Google AI Studio) and ElevenLabs
- A Chromium-based browser for microphone recording (WebM/Opus)

No database is needed.

## Setup

```bash
# Server
cd server
npm install
cp .env.example .env    # then fill in the three API keys

# Client
cd ../client
npm install
```

### Environment variables (`server/.env`)

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DEEPGRAM_API_KEY` | yes | | |
| `GEMINI_API_KEY` | yes | | |
| `ELEVENLABS_API_KEY` | yes | | |
| `PORT` | no | `3001` | Must be a number |
| `DEEPGRAM_MODEL` | no | `nova-3` | |
| `DEEPGRAM_LANGUAGE` | no | `en-US` | |
| `GEMINI_MODEL` | no | `gemini-2.5-flash` | |
| `ELEVENLABS_VOICE_ID` | no | `EXAVITQu4vr4xnSDxMaL` | A voice ID, not a name. Must be a voice your ElevenLabs account can use. |
| `ELEVENLABS_MODEL_ID` | no | `eleven_turbo_v2_5` | |

The server checks these at startup and exits with a clear message if a key is missing or `PORT` is invalid.

## Running

In two terminals:

```bash
cd server && npm run start:dev   # http://localhost:3001
cd client && npm run dev         # http://localhost:3000
```

Open http://localhost:3000, allow microphone access and tap the mic button.

The client calls `http://localhost:3001` directly (hard-coded in [`client/hooks/useSSE.ts`](client/hooks/useSSE.ts) and [`client/hooks/useAudioRecorder.ts`](client/hooks/useAudioRecorder.ts)). If you change the server port, update those two files as well.

## API

### `GET /sse?sessionId=<uuid-v4>`

Opens the event stream for a session (`Content-Type: text/event-stream`). Each event's `data` is JSON:

```ts
type ServerEvent =
  | { type: 'transcript'; text: string; isFinal: boolean } // live captions; final ones trigger a reply
  | { type: 'token'; text: string }                        // a piece of the AI reply text
  | { type: 'audio'; audio: string }                       // base64 MP3 piece of the spoken reply
  | { type: 'error'; message: string };                    // the reply failed; details are in the server log
```

Reconnecting with the same `sessionId` replaces the previous session.

### `POST /audio?sessionId=<uuid-v4>`

Body: raw audio bytes, `Content-Type: application/octet-stream`, up to 5 MB. Chunks must be sent in recording order.

| Status | Meaning |
|---|---|
| `200` | `{ "status": "ok" }` |
| `400` | Missing or invalid `sessionId`, or an empty body |
| `404` | No open SSE stream for this session. Connect to `/sse` first. |

### `GET /`

Returns `Hello World!`. Placeholder from the Nest starter.

## Project structure

```
client/
  app/page.tsx                  Chat UI, event handling, audio playback queue
  hooks/useAudioRecorder.ts     Mic capture and chunk upload
  hooks/useSSE.ts               EventSource wrapper
server/
  src/main.ts                   Bootstrap: CORS, raw body parser, port
  src/app.module.ts             Config module + ConversationModule
  src/config/configuration.ts   Typed config and env validation
  src/common/errors.ts          Error formatting for logs
  src/conversation/             Controller, session service, SSE event types
  src/integrations/             Deepgram, Gemini and ElevenLabs wrappers
  src/entities/                 Unused for now (planned transcript storage)
```

## Scripts

| Where | Command | What it does |
|---|---|---|
| server | `npm run start:dev` | Run with watch mode |
| server | `npm run build` / `npm run start:prod` | Compile to `dist/` / run the compiled build |
| server | `npm test` | Unit tests |
| server | `npm run test:e2e` | End-to-end tests (needs the API keys in `.env`) |
| server | `npm run lint` | ESLint + Prettier (auto-fixes) |
| client | `npm run dev` | Next.js dev server |
| client | `npm run build` / `npm start` | Production build / serve it |
| client | `npm run lint` | ESLint |

## Known limitations

- **Audio chunks can arrive out of order.** The client doesn't wait for one POST to finish before sending the next. A reordered chunk corrupts the stream sent to Deepgram.
- **No recovery from a dropped Deepgram connection.** A reconnect mid-recording never receives the WebM header. Stopping and restarting the mic within about 10 seconds may have the same problem.
- **Replies can start too early.** A reply is triggered by each final transcript segment, not by the end of what you're saying, so two sentences can produce two replies.
- **Speech starts late.** Text-to-speech waits for the whole Gemini reply instead of starting sentence by sentence.
- **The client can drop events.** The page only handles the latest event per render, so fast bursts of `token` or `audio` events can be skipped.
- **Playback can be choppy.** Each MP3 piece plays as a separate `Audio` element.
- **No conversation memory, no SSE reconnect.** Sessions live in one server process's memory, so the server can't run as multiple instances.
- **Open CORS.** Any origin can call the server.
