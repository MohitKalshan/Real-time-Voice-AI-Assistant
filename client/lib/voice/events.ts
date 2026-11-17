/**
 * Events the server pushes over SSE.
 * Must match `ServerEvent` in server/src/conversation/conversation.events.ts.
 */
export type ServerEvent =
  | { type: 'transcript'; text: string; isFinal: boolean }
  | { type: 'token'; text: string }
  | { type: 'audio'; audio: string /* base64 MP3 */ }
  | { type: 'error'; message: string }
  /** Sent once at the end of every reply that did not fail. */
  | { type: 'done' };
