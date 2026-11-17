'use client';

import { useEffect, useEffectEvent } from 'react';
import type { TalkMode } from '@/lib/settings';

interface Options {
  enabled: boolean;
  mode: TalkMode;
  onToggle: () => void; // tap mode
  onPress: () => void; // hold mode: key down
  onRelease: () => void; // hold mode: key up
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName));

/**
 * Space as push-to-talk. Ignored while focus is on a form control or a button
 * (Space already activates a focused button) and while `enabled` is false
 * (e.g. the settings sheet is open).
 */
export function useSpaceToTalk({ enabled, mode, onToggle, onPress, onRelease }: Options) {
  const down = useEffectEvent((e: KeyboardEvent) => {
    if (!enabled || e.code !== 'Space' || e.repeat || isTyping(e.target)) return;
    e.preventDefault();
    if (mode === 'tap') onToggle();
    else onPress();
  });
  const up = useEffectEvent((e: KeyboardEvent) => {
    if (!enabled || e.code !== 'Space' || mode !== 'hold' || isTyping(e.target)) return;
    e.preventDefault();
    onRelease();
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => down(e);
    const onKeyUp = (e: KeyboardEvent) => up(e);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);
}
