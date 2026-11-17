import { AlignLeft, AudioLines, SlidersHorizontal } from 'lucide-react';
import type { ConnectionStatus } from '@/hooks/useSSE';
import { IconButton } from './IconButton';

interface Props {
  connection: ConnectionStatus;
  transcriptOpen: boolean;
  onToggleTranscript: () => void;
  onOpenSettings: () => void;
}

const CONN: Record<ConnectionStatus, { label: string; dot: string; text: string }> = {
  open: { label: 'Connected', dot: 'bg-ok', text: 'text-ink-3' },
  connecting: { label: 'Connecting…', dot: 'bg-ink-3', text: 'text-ink-3' },
  reconnecting: { label: 'Reconnecting…', dot: 'bg-warn', text: 'text-warn' },
};

/** Wordmark left, connection + panel toggles right. No divider: content passes under it. */
export function TopBar({ connection, transcriptOpen, onToggleTranscript, onOpenSettings }: Props) {
  const c = CONN[connection];
  return (
    <header className="flex items-center justify-between gap-3 py-3 pr-3 pl-5 sm:py-[18px] sm:pr-6 sm:pl-8">
      <div className="flex items-center gap-2.5">
        <AudioLines aria-hidden="true" className="size-5" strokeWidth={2.25} />
        <span className="text-sm font-medium tracking-[-0.005em]">Relay</span>
      </div>
      <div className="flex items-center gap-1">
        <span className={`hidden items-center gap-2 pr-3 text-[13px] sm:flex ${c.text}`}>
          <span aria-hidden="true" className={`size-1.5 rounded-full ${c.dot}`} />
          {c.label}
        </span>
        <IconButton
          label={transcriptOpen ? 'Hide transcript' : 'Show transcript'}
          aria-pressed={transcriptOpen}
          active={transcriptOpen}
          onClick={onToggleTranscript}
        >
          <AlignLeft aria-hidden="true" className="size-5" />
        </IconButton>
        <IconButton label="Settings" aria-haspopup="dialog" onClick={onOpenSettings}>
          <SlidersHorizontal aria-hidden="true" className="size-5" />
        </IconButton>
      </div>
    </header>
  );
}
