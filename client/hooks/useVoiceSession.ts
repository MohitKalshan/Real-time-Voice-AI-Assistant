'use client';

import { useCallback, useEffect, useReducer, useRef, useState, useSyncExternalStore } from 'react';
import { useSSE } from '@/hooks/useSSE';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { initialSession, sessionReducer } from '@/lib/voice/session';
import { getAudioContext } from '@/lib/voice/audioContext';
import { settingsStore } from '@/lib/settings';
import type { ServerEvent } from '@/lib/voice/events';

export type Phase = 'ready' | 'listening' | 'thinking' | 'speaking' | 'paused';

/** If the user stops talking and no final transcript arrives within this time, drop the empty turn. */
const ABANDON_MS = 5000;

/**
 * Wires SSE events, the recorder and the player to the conversation reducer and
 * derives the single phase the screen renders.
 */
export function useVoiceSession() {
  const [sessionId] = useState(() => crypto.randomUUID());
  const settings = useSyncExternalStore(settingsStore.subscribe, settingsStore.getSnapshot, settingsStore.getServerSnapshot);
  const [state, dispatch] = useReducer(sessionReducer, initialSession);
  const recorder = useAudioRecorder(sessionId, settings.micId);
  const player = useAudioPlayer();

  // Reply bookkeeping. The server sends one reply per final transcript, one at a time,
  // each ending with exactly one 'done' or 'error'. Refs, not state: these must be
  // exact for every event, even when several arrive before React re-renders.
  const pending = useRef(0); // replies the server still owes
  const ignore = useRef(0); // how many of those belong to an interrupted turn
  // The server may start answering a finished sentence while the user is still talking.
  // Hold that audio until the mic stops, so the assistant never talks over the user.
  const held = useRef<{ chunks: string[]; ended: boolean }>({ chunks: [], ended: false });

  const onEvent = (event: ServerEvent) => {
    switch (event.type) {
      case 'transcript':
        if (event.isFinal && event.text.trim()) pending.current += 1;
        dispatch({ type: 'transcript', text: event.text, isFinal: event.isFinal });
        break;
      case 'token':
        dispatch({ type: 'token', text: event.text, ignored: ignore.current > 0 });
        break;
      case 'audio':
        if (ignore.current > 0 || !settings.readAloud) break;
        if (recorder.isRecording) held.current.chunks.push(event.audio);
        else player.push(event.audio);
        break;
      case 'done':
      case 'error': {
        const ignored = ignore.current > 0;
        pending.current = Math.max(0, pending.current - 1);
        if (ignored) ignore.current -= 1;
        else if (event.type === 'error') player.stop();
        else if (recorder.isRecording) held.current.ended = true;
        else player.end();
        dispatch({
          type: 'reply-end',
          ignored,
          remaining: pending.current,
          error: event.type === 'error' ? event.message : undefined,
        });
        break;
      }
    }
  };

  const connection = useSSE(sessionId, {
    onEvent,
    onDrop: () => stopListening(),
  });

  const last = state.turns.at(-1);
  const phase: Phase = recorder.isRecording
    ? 'listening'
    : connection.status !== 'open'
      ? 'paused'
      : player.active
        ? player.playing
          ? 'speaking'
          : 'thinking'
        : last && (last.status === 'waiting' || last.status === 'streaming')
          ? 'thinking'
          : 'ready';

  // Drop a turn where the user said nothing (no final transcript ever arrived).
  useEffect(() => {
    if (last?.status !== 'waiting' || last.user) return;
    const t = window.setTimeout(() => dispatch({ type: 'abandon-empty' }), ABANDON_MS);
    return () => window.clearTimeout(t);
  }, [last?.status, last?.user]);

  const startListening = useCallback(async () => {
    getAudioContext(); // unlock Web Audio inside the user gesture
    if (await recorder.start()) dispatch({ type: 'start-turn' });
  }, [recorder]);

  const stopListening = useCallback(() => {
    recorder.stop();
    dispatch({ type: 'stop-listening' });
    // Release any reply audio that arrived while the user was talking.
    const { chunks, ended } = held.current;
    held.current = { chunks: [], ended: false };
    chunks.forEach((c) => player.push(c));
    if (ended) player.end();
  }, [recorder, player]);

  /** Barge-in (client side): silence playback and skip the rest of every reply still owed. */
  const interrupt = useCallback(() => {
    player.stop();
    held.current = { chunks: [], ended: false };
    ignore.current = pending.current;
    dispatch({ type: 'interrupt' });
  }, [player]);

  /** The one mic control: start, stop, or interrupt the reply and start talking. */
  const toggleMic = useCallback(async () => {
    if (phase === 'paused') return;
    if (phase === 'listening') return stopListening();
    if (phase === 'thinking' || phase === 'speaking') interrupt();
    await startListening();
  }, [phase, interrupt, startListening, stopListening]);

  const endSession = useCallback(() => {
    recorder.stop();
    interrupt();
    dispatch({ type: 'reset' });
  }, [recorder, interrupt]);

  return {
    phase,
    turns: state.turns,
    settings,
    connection,
    micError: recorder.error,
    clearMicError: recorder.clearError,
    inputStream: recorder.stream,
    outputAnalyser: player.analyser,
    playbackTime: player.currentTime,
    playing: player.playing,
    startListening,
    stopListening,
    toggleMic,
    endSession,
  };
}
