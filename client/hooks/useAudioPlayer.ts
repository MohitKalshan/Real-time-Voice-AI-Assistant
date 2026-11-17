'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAudioContext } from '@/lib/voice/audioContext';

const MIME = 'audio/mpeg';

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Plays the streamed MP3 reply.
 *
 * ElevenLabs sends MP3 bytes in arbitrary pieces that can split audio frames, so
 * playing each piece as its own <audio> gives gaps and clicks. Instead all pieces of
 * a reply are appended to ONE MediaSource buffer, which the browser decodes as a
 * single continuous stream. Browsers without MSE support for MP3 fall back to
 * playing the whole reply once it has fully arrived.
 */
export function useAudioPlayer() {
  const el = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const source = useRef<MediaSource | null>(null);
  const buffer = useRef<SourceBuffer | null>(null);
  const queue = useRef<Uint8Array<ArrayBuffer>[]>([]);
  const fallbackChunks = useRef<Uint8Array<ArrayBuffer>[]>([]);
  const endRequested = useRef(false);
  const objectUrl = useRef<string | null>(null);

  /** A reply's audio has started arriving and has not finished playing. */
  const [active, setActive] = useState(false);
  /** Sound is actually coming out. */
  const [playing, setPlaying] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const reset = useCallback(() => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    source.current = null;
    buffer.current = null;
    queue.current = [];
    fallbackChunks.current = [];
    endRequested.current = false;
    setActive(false);
    setPlaying(false);
  }, []);

  const pump = useCallback(() => {
    const sb = buffer.current;
    const ms = source.current;
    if (!sb || !ms || sb.updating) return;
    const next = queue.current.shift();
    if (next) sb.appendBuffer(next);
    else if (endRequested.current && ms.readyState === 'open') ms.endOfStream();
  }, []);

  /** Lazily creates the <audio> element and routes it through an analyser (for the level meter). */
  const element = useCallback((): HTMLAudioElement => {
    if (el.current) return el.current;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.onplaying = () => setPlaying(true);
    audio.onended = () => reset();
    audio.onerror = () => reset();
    try {
      const ctx = getAudioContext();
      const node = ctx.createAnalyser();
      node.fftSize = 256;
      ctx.createMediaElementSource(audio).connect(node);
      node.connect(ctx.destination);
      analyserRef.current = node;
      setAnalyser(node);
    } catch {
      /* no Web Audio: audio still plays, the meter just stays idle */
    }
    el.current = audio;
    return audio;
  }, [reset]);

  const begin = useCallback(() => {
    const audio = element();
    setActive(true);
    if (typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported(MIME)) {
      const ms = new MediaSource();
      source.current = ms;
      objectUrl.current = URL.createObjectURL(ms);
      audio.src = objectUrl.current;
      ms.addEventListener(
        'sourceopen',
        () => {
          const sb = ms.addSourceBuffer(MIME);
          sb.mode = 'sequence';
          sb.addEventListener('updateend', pump);
          buffer.current = sb;
          pump();
        },
        { once: true },
      );
      audio.play().catch((e) => console.error('Playback failed', e));
    }
  }, [element, pump]);

  /** Add one base64 MP3 piece of the current reply. */
  const push = useCallback(
    (b64: string) => {
      const bytes = base64ToBytes(b64);
      if (!source.current && fallbackChunks.current.length === 0 && !endRequested.current) begin();
      if (source.current) {
        queue.current.push(bytes);
        pump();
      } else {
        fallbackChunks.current.push(bytes);
      }
    },
    [begin, pump],
  );

  /** The reply's audio is complete: let the stream end (or play the fallback blob). */
  const end = useCallback(() => {
    if (source.current) {
      endRequested.current = true;
      pump();
    } else if (fallbackChunks.current.length > 0) {
      const audio = element();
      objectUrl.current = URL.createObjectURL(new Blob(fallbackChunks.current, { type: MIME }));
      fallbackChunks.current = [];
      audio.src = objectUrl.current;
      audio.play().catch((e) => {
        console.error('Playback failed', e);
        reset();
      });
    }
  }, [element, pump, reset]);

  /** Interrupt: silence immediately and drop whatever is buffered. */
  const stop = useCallback(() => {
    el.current?.pause();
    el.current?.removeAttribute('src');
    el.current?.load();
    reset();
  }, [reset]);

  const currentTime = useCallback(() => el.current?.currentTime ?? 0, []);

  useEffect(() => () => el.current?.pause(), []);

  return { push, end, stop, active, playing, analyser, currentTime };
}
