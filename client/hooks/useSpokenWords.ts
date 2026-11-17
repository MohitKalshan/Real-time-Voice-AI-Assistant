'use client';

import { useEffect, useState } from 'react';

/**
 * Average ElevenLabs Turbo speaking rate. The server doesn't send word timings,
 * so the highlighted word is an ESTIMATE from playback time. To make it exact,
 * switch to ElevenLabs' "with timestamps" streaming endpoint and forward the
 * character alignment to the client.
 */
const WORDS_PER_SECOND = 2.6;

/** How many words of the reply have been spoken so far (approximate). */
export function useSpokenWords(playing: boolean, currentTime: () => number): number {
  const [spoken, setSpoken] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setSpoken(Math.floor(currentTime() * WORDS_PER_SECOND)), 120);
    return () => {
      window.clearInterval(id);
      setSpoken(0);
    };
  }, [playing, currentTime]);

  return spoken;
}
