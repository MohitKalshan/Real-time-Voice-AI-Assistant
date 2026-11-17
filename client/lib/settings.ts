/**
 * User settings persisted in localStorage, exposed as an external store so
 * React reads them with useSyncExternalStore (no hydration mismatch, no effects).
 */
export type ThemeSetting = 'system' | 'light' | 'dark';
export type TalkMode = 'tap' | 'hold';

export interface Settings {
  theme: ThemeSetting;
  talkMode: TalkMode;
  liveCaptions: boolean;
  readAloud: boolean;
  micId: string; // '' = browser default
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  talkMode: 'tap',
  liveCaptions: true,
  readAloud: true,
  micId: '',
};

const KEY = 'sse-chat-ai:settings';
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: Settings = DEFAULT_SETTINGS;

function read(): Settings {
  const raw = window.localStorage.getItem(KEY);
  // Return the same object while the stored string is unchanged, so React doesn't re-render.
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    cached = raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS;
  } catch {
    cached = DEFAULT_SETTINGS;
  }
  return cached;
}

export const settingsStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => e.key === KEY && listener();
    window.addEventListener('storage', onStorage); // keeps other tabs in sync
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  },
  getSnapshot: read,
  getServerSnapshot: () => DEFAULT_SETTINGS,
  update(patch: Partial<Settings>) {
    window.localStorage.setItem(KEY, JSON.stringify({ ...read(), ...patch }));
    listeners.forEach((l) => l());
  },
};
