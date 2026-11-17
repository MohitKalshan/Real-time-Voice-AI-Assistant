/**
 * What the screen shows, as a pure reducer (easy to reason about and to unit-test).
 *
 * Which replies to ignore after an interrupt is decided by the caller (see
 * useVoiceSession) and passed in as `ignored`, because that decision must be made
 * synchronously per SSE event, before React re-renders.
 */
export type TurnStatus = 'listening' | 'waiting' | 'streaming' | 'done' | 'error' | 'interrupted';

export interface Turn {
  id: number;
  user: string; // final transcript text
  interim: string; // draft words Deepgram may still revise
  reply: string;
  status: TurnStatus;
  error?: string;
}

export interface SessionState {
  turns: Turn[];
  nextId: number;
}

export type SessionAction =
  | { type: 'start-turn' }
  | { type: 'stop-listening' }
  | { type: 'transcript'; text: string; isFinal: boolean }
  | { type: 'token'; text: string; ignored: boolean }
  /** `remaining`: replies the server still owes after this one. */
  | { type: 'reply-end'; ignored: boolean; remaining: number; error?: string }
  | { type: 'interrupt' }
  | { type: 'abandon-empty' }
  | { type: 'reset' };

export const initialSession: SessionState = { turns: [], nextId: 1 };

const join = (a: string, b: string) => `${a} ${b}`.replace(/\s+/g, ' ').trim();

function updateLast(state: SessionState, fn: (t: Turn) => Turn): SessionState {
  const last = state.turns.at(-1);
  if (!last) return state;
  return { ...state, turns: [...state.turns.slice(0, -1), fn(last)] };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'start-turn':
      return {
        nextId: state.nextId + 1,
        turns: [...state.turns, { id: state.nextId, user: '', interim: '', reply: '', status: 'listening' }],
      };

    case 'stop-listening':
      return updateLast(state, (t) => (t.status === 'listening' ? { ...t, status: t.reply ? 'streaming' : 'waiting' } : t));

    case 'transcript':
      // Late finals can arrive just after the user stopped: they still belong to the last turn.
      return updateLast(state, (t) =>
        action.isFinal ? { ...t, user: join(t.user, action.text), interim: '' } : { ...t, interim: action.text },
      );

    case 'token':
      if (action.ignored) return state;
      return updateLast(state, (t) => ({
        ...t,
        reply: t.reply + action.text,
        status: t.status === 'waiting' ? 'streaming' : t.status,
      }));

    case 'reply-end':
      if (action.ignored) return state;
      return updateLast(state, (t) => {
        if (action.error) return { ...t, status: 'error', error: action.error };
        // One spoken turn can produce several replies (one per final segment): keep a space between them.
        const reply = t.reply ? `${t.reply.trimEnd()} ` : t.reply;
        if (t.status === 'listening' || action.remaining > 0) return { ...t, reply };
        return { ...t, reply: reply.trim(), status: 'done' };
      });

    case 'interrupt':
      return updateLast(state, (t) => (t.status === 'waiting' || t.status === 'streaming' ? { ...t, status: 'interrupted' } : t));

    case 'abandon-empty': {
      const last = state.turns.at(-1);
      if (!last || last.status !== 'waiting' || last.user) return state;
      return { ...state, turns: state.turns.slice(0, -1) };
    }

    case 'reset':
      return { ...initialSession, nextId: state.nextId };
  }
}
