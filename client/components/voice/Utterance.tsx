export type WordTone = 'ink' | 'pending' | 'current' | 'muted';

const TONE: Record<WordTone, string> = {
  ink: 'text-ink',
  pending: 'text-pending',
  current: 'text-accent-text',
  muted: 'text-ink-3',
};

export interface Word {
  text: string;
  tone: WordTone;
}

export function words(text: string, tone: WordTone): Word[] {
  return text.split(/\s+/).filter(Boolean).map((w) => ({ text: w, tone }));
}

interface Props {
  items: Word[];
  size?: 'xl' | 'lg';
  caret?: boolean;
}

/**
 * The conversation itself, set as display type. Each word fades/blurs in once
 * when it first mounts (keys are positions, so existing words never re-animate)
 * and changes colour as its state changes.
 */
export function Utterance({ items, size = 'xl', caret = false }: Props) {
  return (
    <p
      className={`max-w-[18ch] text-pretty ${size === 'xl' ? 'text-display-xl' : 'max-w-[24ch] text-display-lg'}`}
    >
      {items.map((w, i) => (
        <span
          key={i}
          className={`mr-[0.24em] inline-block animate-word-in transition-colors duration-200 ${TONE[w.tone]}`}
        >
          {w.text}
        </span>
      ))}
      {caret && (
        <span
          aria-hidden="true"
          className="inline-block h-[0.85em] w-1 translate-y-[0.08em] animate-caret bg-accent align-baseline"
        />
      )}
    </p>
  );
}
