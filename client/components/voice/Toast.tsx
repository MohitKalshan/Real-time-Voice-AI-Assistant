'use client';

import { useEffect, useState } from 'react';
import { CircleAlert, RotateCw } from 'lucide-react';

interface Props {
  tone: 'warn' | 'error';
  title: string;
  description?: string;
  /** Show a live "in N s" countdown to this timestamp. */
  countdownTo?: number | null;
  action?: { label: string; onClick: () => void };
}

function useSecondsUntil(target: number | null | undefined): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [target]);
  return target ? Math.max(0, Math.ceil((target - now) / 1000)) : null;
}

/** Sonner-style toast, top centre. Non-blocking: the conversation stays usable underneath. */
export function Toast({ tone, title, description, countdownTo, action }: Props) {
  const secs = useSecondsUntil(countdownTo);
  const Icon = tone === 'warn' ? RotateCw : CircleAlert;
  return (
    <div
      role="status"
      className="elevated fixed inset-x-3 top-[72px] z-20 mx-auto flex w-fit max-w-[440px] animate-toast-in items-center gap-3.5 rounded-2xl border border-line bg-surface py-2.5 pr-2.5 pl-4"
    >
      <Icon aria-hidden="true" className={`size-[18px] shrink-0 ${tone === 'warn' ? 'text-warn' : 'text-danger'}`} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[13px] font-medium">{title}</span>
        {(description || secs !== null) && (
          <span className="text-[13px] text-ink-3">
            {description ?? (secs ? `Reconnecting in ${secs} s` : 'Reconnecting…')}
          </span>
        )}
      </span>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="press h-11 shrink-0 rounded-xl bg-sunken px-4 text-sm font-medium text-ink"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
