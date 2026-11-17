'use client';

import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import { API_URL } from '@/lib/config';
import type { ServerEvent } from '@/lib/voice/events';

export type ConnectionStatus = 'connecting' | 'open' | 'reconnecting';

const BACKOFF_MS = [1000, 2000, 4000, 8000, 10000];

interface Options {
  onEvent: (event: ServerEvent) => void;
  /** Called when an open connection drops (e.g. stop the mic). */
  onDrop?: () => void;
}

/**
 * Opens the SSE stream and hands every event to `onEvent`.
 *
 * Why a callback and not a `messages` array: when several events arrive in one
 * tick, React batches the state updates and an effect that reads only the last
 * message skips the others. A callback sees every event, in order.
 */
export function useSSE(sessionId: string, { onEvent, onDrop }: Options) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  /** When the next reconnect attempt happens (ms since epoch), while reconnecting. */
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const failures = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  // Effect Events always see the latest props without re-running the effect.
  const handleEvent = useEffectEvent((event: ServerEvent) => onEvent(event));
  const handleDrop = useEffectEvent(() => onDrop?.());

  useEffect(() => {
    if (!sessionId) return;
    const source = new EventSource(`${API_URL}/sse?sessionId=${sessionId}`);
    let opened = false;

    source.onopen = () => {
      opened = true;
      failures.current = 0;
      setStatus('open');
      setRetryAt(null);
    };

    source.onmessage = (message) => {
      try {
        handleEvent(JSON.parse(message.data) as ServerEvent);
      } catch (error) {
        console.error('Bad SSE message', error);
      }
    };

    source.onerror = () => {
      // Take over from the browser's built-in retry so we control the backoff and the UI.
      source.close();
      if (opened) handleDrop();
      const delay = BACKOFF_MS[Math.min(failures.current, BACKOFF_MS.length - 1)];
      failures.current += 1;
      setStatus('reconnecting');
      setRetryAt(Date.now() + delay);
      timer.current = window.setTimeout(() => setAttempt((a) => a + 1), delay);
    };

    return () => {
      source.close();
      window.clearTimeout(timer.current);
    };
  }, [sessionId, attempt]);

  const retryNow = useCallback(() => {
    window.clearTimeout(timer.current);
    setAttempt((a) => a + 1);
  }, []);

  return { status, retryAt, retryNow };
}
