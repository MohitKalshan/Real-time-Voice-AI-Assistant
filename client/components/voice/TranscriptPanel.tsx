import type { Turn } from '@/lib/voice/session';

interface Props {
  turns: Turn[];
}

/** The whole session as text. Desktop: non-blocking side panel (no scrim). Phone: fills the conversation area. */
export function TranscriptPanel({ turns }: Props) {
  const items = turns.filter((t) => t.user || t.reply);
  return (
    <aside
      aria-label="Transcript"
      className="m-3 mt-0 flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-auto rounded-[20px] border border-line bg-surface p-5 lg:ml-0 lg:max-h-[calc(100dvh-96px)] lg:w-[380px] lg:flex-none"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold">Transcript</h2>
        <span className="text-[13px] text-ink-3">This session</span>
      </div>
      {items.length === 0 && <p className="text-[15px] text-ink-3">Nothing yet. Start talking.</p>}
      {items.map((t) => (
        <div key={t.id} className="flex flex-col gap-4">
          {t.user && (
            <div className="flex flex-col gap-1.5">
              <p className="meta">You</p>
              <p className="text-[15px] leading-normal text-ink-2">{t.user}</p>
            </div>
          )}
          {(t.reply || t.status === 'error') && (
            <div className="flex flex-col gap-1.5">
              <p className="meta">{t.status === 'interrupted' ? 'Assistant · interrupted' : 'Assistant'}</p>
              <p className={`text-[15px] leading-normal ${t.status === 'error' ? 'text-danger' : 'text-ink'}`}>
                {t.status === 'error' ? t.error : t.reply}
              </p>
            </div>
          )}
        </div>
      ))}
    </aside>
  );
}
