import { Mic } from 'lucide-react';

export type MicMode = 'talk' | 'stop' | 'interrupt' | 'disabled';

const MODES: Record<MicMode, { label: string; className: string }> = {
  talk: { label: 'Start talking', className: 'bg-accent text-on-accent' },
  stop: { label: 'Stop talking', className: 'bg-accent text-on-accent shadow-[0_0_0_8px_var(--primary-soft)]' },
  interrupt: { label: 'Interrupt and talk', className: 'bg-ink text-canvas' },
  disabled: { label: 'Microphone unavailable', className: 'bg-sunken text-ink-3' },
};

interface Props {
  mode: MicMode;
  onClick: () => void;
  size?: 'md' | 'lg';
}

/** The single big control. Colour, icon and label all change with the mode (never colour alone). */
export function MicButton({ mode, onClick, size = 'md' }: Props) {
  const m = MODES[mode];
  return (
    <button
      type="button"
      aria-label={m.label}
      title={m.label}
      disabled={mode === 'disabled'}
      onClick={onClick}
      className={`press flex shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed ${
        size === 'lg' ? 'size-16' : 'size-14'
      } ${m.className}`}
    >
      {mode === 'stop' ? (
        <span aria-hidden="true" className="size-[18px] rounded-[4px] bg-current" />
      ) : (
        <Mic aria-hidden="true" className={size === 'lg' ? 'size-[26px]' : 'size-[22px]'} strokeWidth={2} />
      )}
    </button>
  );
}
