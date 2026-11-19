/** Events pushed to the client over SSE. Shape must match `SSEEvent` in client/hooks/useSSE.ts. */
export type ServerEvent =
  | { type: 'transcript'; text: string; isFinal: boolean }
  | { type: 'token'; text: string }
  | { type: 'audio'; audio: string /* base64 */ }
  | { type: 'error'; message: string }
  /** Sent once at the end of every reply that did not fail (an 'error' ends a failed reply instead). */
  | { type: 'done' };
