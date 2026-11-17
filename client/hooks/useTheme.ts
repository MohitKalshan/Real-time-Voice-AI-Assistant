'use client';

import { useEffect } from 'react';
import type { ThemeSetting } from '@/lib/settings';

/** Applies the theme to <html data-theme>, following the OS when set to "system". */
export function useTheme(theme: ThemeSetting) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
      document.documentElement.dataset.theme = resolved;
    };
    apply();
    if (theme !== 'system') return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
}
