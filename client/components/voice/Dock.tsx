import { X } from 'lucide-react';
import type { Phase } from '@/hooks/useVoiceSession';
import type { TalkMode } from '@/lib/settings';
import { IconButton } from './IconButton';
import { LevelMeter, type MeterTone } from './LevelMeter';
import { MicButton, type MicMode } from './MicButton';

const STATE: Record<Phase, { label: string; dot: string; tone: MeterTone; mic: MicMode }> = {
  ready: { label: 'Ready', dot: 'bg-ok', tone: 'idle', mic: 'talk' },
  listening: { label: 'Listening', dot: 'bg-accent', tone: 'accent', mic: 'stop' },
  thinking: { label: 'Thinking', dot: 'bg-ink-3', tone: 'idle', mic: 'interrupt' },
  speaking: { label: 'Speaking', dot: 'bg-ink', tone: 'ink', mic: 'interrupt' },
  paused: { label: 'Paused', dot: 'bg-warn', tone: 'idle', mic: 'disabled' },
};

function hint(phase: Phase, mode: TalkMode): string | null {
  if (phase === 'paused') return null;
  if (mode === 'hold') return phase === 'listening' ? 'release to send' : 'hold to talk';
  return { ready: 'to talk', listening: 'to stop', thinking: 'to interrupt', speaking: 'to interrupt' }[phase];
}

interface Props {
  phase: Phase;
  talkMode: TalkMode;
  inputStream: MediaStream | null;
  outputAnalyser: AnalyserNode | null;
  onMic: () => void;
  onEnd: () => void;
  canEnd: boolean;
}

/** The floating glass dock: level meter + status, keyboard hint, mic, end. */
export function Dock({ phase, talkMode, inputStream, outputAnalyser, onMic, onEnd, canEnd }: Props) {
  const s = STATE[phase];
  const h = hint(phase, talkMode);
  return (
    <div className="glass flex items-center gap-3 rounded-[38px] py-2.5 pr-2.5 pl-5 sm:gap-[18px] sm:pl-[22px]">
      <div className="flex items-center gap-2.5">
        <LevelMeter
          tone={s.tone}
          stream={phase === 'listening' ? inputStream : null}
          analyser={phase === 'speaking' ? outputAnalyser : null}
        />
        <span role="status" className="flex items-center gap-2 text-[13px] font-medium">
          <span aria-hidden="true" className={`size-1.5 rounded-full transition-colors duration-200 ${s.dot}`} />
          {s.label}
        </span>
      </div>

      <span className="hidden items-center gap-1.5 text-[13px] text-ink-3 sm:flex">
        {h ? (
          <>
            <kbd className="meta rounded-md bg-sunken px-1.5 py-[3px] text-ink-2">Space</kbd>
            {h}
          </>
        ) : (
          'Mic paused'
        )}
      </span>

      <MicButton mode={s.mic} onClick={onMic} />
      <IconButton label="End session" onClick={onEnd} disabled={!canEnd} className="disabled:opacity-40">
        <X aria-hidden="true" className="size-5" />
      </IconButton>
    </div>
  );
}
