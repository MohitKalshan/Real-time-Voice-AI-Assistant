'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { settingsStore, type Settings, type TalkMode, type ThemeSetting } from '@/lib/settings';
import { IconButton } from './IconButton';

interface Props {
  open: boolean;
  onClose: () => void;
  settings: Settings;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="meta pl-1">{title}</h3>
      <div className="divide-y divide-line overflow-hidden rounded-2xl bg-surface">{children}</div>
    </section>
  );
}

function Row({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 py-1.5 pr-2 pl-4 text-[15px]">
      {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : <span>{label}</span>}
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row label={label}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`press mr-2 flex h-[26px] w-11 shrink-0 items-center rounded-full p-0.5 ${
          checked ? 'justify-end bg-accent' : 'justify-start bg-line-strong'
        }`}
      >
        <span className="size-[22px] rounded-full bg-surface shadow-[0_1px_3px_var(--shadow-edge)]" />
      </button>
    </Row>
  );
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <Row label={label}>
      <div role="group" aria-label={label} className="flex gap-0.5 rounded-[10px] bg-sunken p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            className={`press h-8 rounded-lg px-3 text-[13px] font-medium ${
              o.value === value ? 'bg-surface text-ink shadow-[0_1px_3px_var(--shadow-edge)]' : 'text-ink-2'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Row>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Row label={label}>
      <span className="pr-2 font-mono text-[13px] text-ink-2">{value}</span>
    </Row>
  );
}

/**
 * Modal settings sheet built on native <dialog>: focus trap, Escape to close and
 * top-layer stacking come from the browser. Clicking the scrim closes it.
 * Every setting here really changes the app; server-side choices are read-only.
 */
export function SettingsSheet({ open, onClose, settings }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Device labels are only available after mic permission was granted once.
      navigator.mediaDevices
        ?.enumerateDevices()
        .then((d) => setMics(d.filter((x) => x.kind === 'audioinput' && x.deviceId)))
        .catch(() => setMics([]));
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const set = (patch: Partial<Settings>) => settingsStore.update(patch);

  return (
    <dialog
      ref={ref}
      aria-labelledby="settings-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="sheet fixed inset-y-3 right-3 left-auto m-0 h-auto max-h-[calc(100dvh-24px)] w-[420px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-3xl bg-canvas p-0 text-ink shadow-[0_24px_64px_var(--shadow-soft),0_1px_2px_var(--shadow-edge)]"
    >
      <div className="flex flex-col gap-[22px] px-5 pt-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 id="settings-title" className="text-xl font-semibold tracking-[-0.01em]">
            Settings
          </h2>
          <IconButton label="Close settings" onClick={onClose}>
            <X aria-hidden="true" className="size-5" />
          </IconButton>
        </div>

        <Group title="Input">
          <Row label="Microphone" htmlFor="mic-select">
            <select
              id="mic-select"
              value={settings.micId}
              onChange={(e) => set({ micId: e.target.value })}
              className="mr-2 max-w-[190px] truncate rounded-lg bg-transparent py-1 text-right text-ink-3 focus-visible:outline-2 focus-visible:outline-accent"
            >
              <option value="">Default microphone</option>
              {mics.map((m, i) => (
                <option key={m.deviceId} value={m.deviceId}>
                  {m.label || `Microphone ${i + 1}`}
                </option>
              ))}
            </select>
          </Row>
          <Segmented<TalkMode>
            label="Talk mode"
            value={settings.talkMode}
            options={[
              { value: 'tap', label: 'Tap' },
              { value: 'hold', label: 'Hold Space' },
            ]}
            onChange={(talkMode) => set({ talkMode })}
          />
        </Group>

        <Group title="Speech">
          <Toggle label="Live captions" checked={settings.liveCaptions} onChange={(liveCaptions) => set({ liveCaptions })} />
          <Info label="Language" value="en-US" />
        </Group>

        <Group title="Voice">
          <Toggle label="Read replies aloud" checked={settings.readAloud} onChange={(readAloud) => set({ readAloud })} />
        </Group>

        <Group title="Appearance">
          <Segmented<ThemeSetting>
            label="Theme"
            value={settings.theme}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            onChange={(theme) => set({ theme })}
          />
        </Group>

        <Group title="Models · set on the server">
          <Info label="Speech to text" value="nova-3" />
          <Info label="Reply" value="Gemini" />
          <Info label="Voice" value="eleven_turbo_v2_5" />
        </Group>
      </div>
    </dialog>
  );
}
