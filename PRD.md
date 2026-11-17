# PRD: SSE-chat-ai (Real-time Voice AI Assistant)

| | |
|---|---|
| Owner | Mohit Kalshan |
| Status | Draft (prototype exists; see "Current status") |
| Last updated | 2026-11-16 |
| Related | [ARCHITECTURE.md](./ARCHITECTURE.md) |

---

## 1. Summary

SSE-chat-ai is a browser-based voice assistant. The user talks into their microphone, sees a live transcript of what they're saying, watches the AI's reply stream in as text, and hears it spoken back. It chains three hosted AI services: Deepgram (speech-to-text), Google Gemini (LLM) and ElevenLabs (text-to-speech). A NestJS backend coordinates them, and a Next.js frontend handles the UI.

## 2. Problem

Typed chatbots are slow for hands-busy or conversational use. Most "voice mode" demos feel laggy because each stage (transcribe → think → speak) waits for the previous one to finish. This project aims to show a **streaming-first** voice loop where every stage starts producing output as early as possible.

## 3. Goals and non-goals

### Goals
1. **G1: Natural voice conversation.** A user can hold a back-and-forth spoken conversation with an AI in the browser, with no install.
2. **G2: Low perceived latency.** The user sees their words as they speak, and hears the reply begin soon after they stop.
3. **G3: Live visual feedback.** Interim transcript, streamed reply tokens and the connection state are all visible.
4. **G4: Learning and portfolio value.** Clean, well-documented code that shows real-time streaming patterns (SSE, RxJS, WebSockets) and AI service orchestration.

### Non-goals (v1)
- Native mobile apps.
- Multi-language support (v1 is `en-US` only).
- Tool use or agentic actions (calling APIs, browsing). See Future scope.
- User accounts, billing, or multi-tenant admin.
- Self-hosted / on-prem models.

## 4. Target users

| Persona | Need |
|---|---|
| Developer / learner (primary) | Understand and extend a working real-time voice-AI pipeline |
| Demo audience / recruiter | Try a smooth voice conversation in under 30 seconds |
| Future end user | Ask quick spoken questions hands-free |

## 5. User stories

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-1 | user | press one button to start talking | I don't have to configure anything |
| US-2 | user | see my words appear while I speak | I know I'm being heard correctly |
| US-3 | user | see the AI's reply appear word by word | I'm not staring at a blank screen |
| US-4 | user | hear the reply spoken aloud | I can listen instead of reading |
| US-5 | user | have the AI remember earlier turns | follow-up questions make sense |
| US-6 | user | interrupt the AI by speaking | the conversation feels natural (barge-in) |
| US-7 | user | see a clear message if something fails | I know whether to retry |
| US-8 | developer | swap STT / LLM / TTS providers via config | I'm not locked into one vendor |

## 6. Functional requirements

| ID | Requirement | Priority | Status today |
|---|---|---|---|
| FR-1 | Capture mic audio in the browser and stream it to the backend in small chunks | P0 | Partial: 250 ms chunks sent via separate HTTP POSTs |
| FR-2 | Backend streams audio to an STT provider and gets interim + final transcripts | P0 | Implemented (Deepgram `nova-3`), but blocked by FR-1 body-parsing bug |
| FR-3 | Push interim and final transcripts to the client in real time | P0 | Implemented (SSE `transcript` event) |
| FR-4 | When the user finishes an utterance, send it to the LLM and stream tokens to the client | P0 | Partial: triggers on segment `is_final`, not end of utterance |
| FR-5 | Convert the LLM reply to speech and stream audio to the client | P0 | Partial: waits for the full reply before TTS |
| FR-6 | Client plays audio chunks in order without gaps | P0 | Partial: plays each chunk as a separate `<audio>` element |
| FR-7 | Maintain conversation history per session | P1 | Not implemented |
| FR-8 | Barge-in: stop playback and cancel the in-flight LLM/TTS call when the user starts speaking | P1 | Not implemented |
| FR-9 | Clean up all per-session resources on disconnect | P0 | Not implemented (`removeSession` never called) |
| FR-10 | Persist session transcripts to Postgres | P2 | Entity exists, never written |
| FR-11 | Surface provider errors to the client as an `error` event | P1 | Not implemented (console only) |
| FR-12 | System prompt / persona configurable via env | P2 | Not implemented |

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Latency | Time from end of speech to first audio byte ≤ **1.5 s** (p50) and ≤ 2.5 s (p95). First transcript text visible ≤ 500 ms after speech starts. |
| Reliability | Session survives a single transient provider error. STT socket kept alive during silence. |
| Scalability | Support ≥ 100 concurrent sessions on one instance. Design must allow horizontal scaling (session state not tied to one process). |
| Security | API keys only on the server. Session IDs issued by the server, not the client. CORS restricted to known origins. Rate limiting on audio upload. |
| Privacy | Audio isn't stored by default. Transcript persistence is opt-in and documented. |
| Observability | Structured logs with `sessionId`; per-stage latency metrics (STT, LLM first token, TTS first byte). |
| Cost | Track per-session provider usage (STT minutes, LLM tokens, TTS characters). |
| Compatibility | Latest Chrome, Edge, Firefox and Safari (MediaRecorder + EventSource). |

## 8. Success metrics

| Metric | Target |
|---|---|
| End-of-speech → first audio (p50) | ≤ 1.5 s |
| Session error rate | < 2% of sessions |
| Turns per session (engagement) | ≥ 3 |
| Leaked sessions after disconnect | 0 |

## 9. Current status (as of 2026-11-16)

The prototype wires the full pipeline but **likely doesn't run end-to-end yet**:

1. `POST /audio` receives an empty body, because Express doesn't parse `application/octet-stream` by default. **Blocker.**
2. Audio sent before the Deepgram socket opens is dropped, which can include the webm header chunk. **Blocker.**
3. Separate HTTP POSTs can deliver chunks out of order.
4. No session cleanup, no conversation memory, and TTS only starts after the full reply.

See ARCHITECTURE.md §8 for the full list and fixes.

## 10. Milestones

| Milestone | Scope | Exit criteria |
|---|---|---|
| **M0: Make it work** | Raw body parser, buffer audio until the STT socket opens, session cleanup on SSE close, Deepgram KeepAlive | One full spoken turn works reliably in Chrome |
| **M1: Make it conversational** | End-of-utterance detection (`speech_final` / `UtteranceEnd`), chat history, per-session turn lock, `error` events | 5-turn conversation with correct follow-ups |
| **M2: Make it fast** | WebSocket audio upload, sentence-level TTS streaming, continuous audio playback (MediaSource / Web Audio) | p50 latency ≤ 1.5 s measured |
| **M3: Make it robust** | Server-issued session IDs, rate limits, CORS allow-list, structured logs + latency metrics, transcript persistence | Load test: 100 concurrent sessions, 0 leaks |
| **M4: Make it an agent** | LLM tool calling (e.g. web search, calendar), barge-in | Agent completes a tool-assisted task by voice |

## 11. Risks and open questions

| Risk / question | Mitigation / owner decision |
|---|---|
| Three external vendors = three points of failure and three bills | Provider interfaces (US-8); per-stage timeouts and fallbacks |
| Hard-coded Gemini model name may be retired | Make the model configurable; verify against the current Google model list |
| SSE is one-way; upload over HTTP adds overhead and ordering issues | Move upload to WebSocket (M2), or move everything to one WebSocket |
| In-memory session map blocks horizontal scaling | Sticky sessions short-term; Redis pub/sub for SSE fan-out long-term |
| Open: should transcripts be stored at all? | Decide before M3 (privacy) |
| Open: which TTS output format suits gapless browser playback? | Evaluate MP3 vs PCM + Web Audio in M2 |

## 12. Future scope

- Tool calling / function calling (turn the pipeline into a true agent).
- Retrieval over user documents (RAG).
- Multi-language STT/TTS.
- Voice selection and speaking-rate controls.
- Speech-to-speech models as an alternative to the three-stage pipeline.
