'use client';

import { useEffect, useRef } from 'react';
import { getAudioContext } from '@/lib/voice/audioContext';

export type MeterTone = 'accent' | 'ink' | 'idle';

interface Props {
  tone: MeterTone;
  /** Mic input while listening. */
  stream?: MediaStream | null;
  /** Playback analyser while speaking. */
  analyser?: AnalyserNode | null;
}

const BARS = 5;
const IDLE = 0.15;
const COLOR: Record<MeterTone, string> = { accent: 'bg-accent', ink: 'bg-ink', idle: 'bg-line-strong' };

/**
 * Five bars driven by a Web Audio AnalyserNode.
 *
 * Performance: the bars are updated in a requestAnimationFrame loop by writing
 * `transform: scaleY()` straight to the DOM. No React state, so no re-render at
 * 60fps, and only a compositor-friendly property changes (never `height`).
 */
export function LevelMeter({ tone, stream, analyser }: Props) {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const setAll = (v: number) => bars.current.forEach((b) => b && (b.style.transform = `scaleY(${v})`));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (tone === 'idle' || reduced) {
      setAll(tone === 'idle' ? IDLE : 0.6);
      return;
    }

    let node = analyser ?? null;
    let micSource: MediaStreamAudioSourceNode | null = null;
    if (!node && stream) {
      const ctx = getAudioContext();
      node = ctx.createAnalyser();
      node.fftSize = 256;
      micSource = ctx.createMediaStreamSource(stream);
      micSource.connect(node);
    }
    if (!node) {
      setAll(IDLE);
      return;
    }

    const data = new Uint8Array(node.frequencyBinCount);
    const band = Math.floor(data.length / (BARS + 2)); // skip the top bins (mostly silence for speech)
    let raf = 0;
    const loop = () => {
      node.getByteFrequencyData(data);
      for (let i = 0; i < BARS; i++) {
        let sum = 0;
        for (let j = 0; j < band; j++) sum += data[i * band + j];
        const level = Math.min(1, sum / band / 180);
        const el = bars.current[i];
        if (el) el.style.transform = `scaleY(${IDLE + (1 - IDLE) * level})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      micSource?.disconnect();
    };
  }, [tone, stream, analyser]);

  return (
    <span aria-hidden="true" className="flex h-5 items-center gap-[3px]">
      {Array.from({ length: BARS }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            bars.current[i] = el;
          }}
          className={`h-5 w-[3px] origin-center rounded-full transition-[background-color] duration-200 ${COLOR[tone]}`}
          style={{ transform: `scaleY(${IDLE})` }}
        />
      ))}
    </span>
  );
}
