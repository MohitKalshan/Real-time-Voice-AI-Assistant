import { CircleAlert } from 'lucide-react';
import type { Phase } from '@/hooks/useVoiceSession';
import type { Turn } from '@/lib/voice/session';
import { Utterance, words, type Word } from './Utterance';

interface Props {
  phase: Phase;
  turn: Turn | undefined;
  liveCaptions: boolean;
  spokenWords: number;
  talkMode: 'tap' | 'hold';
  onRetry: () => void;
}

/** "Press Space" only makes sense with a keyboard: touch screens get "Tap the mic". */
function TalkHint({ mode }: { mode: 'tap' | 'hold' }) {
  return (
    <>
      <span className="pointer-coarse:hidden">{mode === 'hold' ? 'Hold Space to talk' : 'Tap the mic or press Space'}</span>
      <span className="hidden pointer-coarse:inline">Tap the mic</span>
    </>
  );
}

function Meta({ children, dot }: { children: React.ReactNode; dot?: string }) {
  return (
    <p className="meta flex items-center gap-2">
      {dot && <span aria-hidden="true" className={`size-1.5 rounded-full ${dot}`} />}
      {children}
    </p>
  );
}

function PreviousTurn({ text }: { text: string }) {
  return (
    <div className="mb-7 flex flex-col gap-2.5">
      <Meta>You</Meta>
      <p className="max-w-[40ch] text-display-md text-ink-3">{text}</p>
    </div>
  );
}

/** Left-aligned editorial column: the words ARE the interface. */
export function Conversation({ phase, turn, liveCaptions, spokenWords, talkMode, onRetry }: Props) {
  // ---- Listening: your words, interim ones in grey ----
  if (phase === 'listening' && turn) {
    const items: Word[] = [...words(turn.user, 'ink'), ...(liveCaptions ? words(turn.interim, 'pending') : [])];
    return (
      <>
        <Meta dot="bg-accent">You · live</Meta>
        <Utterance items={items.length ? items : words('Listening…', 'pending')} />
        {!liveCaptions && <p className="text-[15px] text-ink-3">Live captions are off. Your words appear when final.</p>}
      </>
    );
  }

  // ---- Thinking: the reply streams in with a caret ----
  if (phase === 'thinking' && turn) {
    return (
      <>
        {turn.user && <PreviousTurn text={turn.user} />}
        <Meta>Assistant · writing</Meta>
        <Utterance items={words(turn.reply, 'ink')} caret />
      </>
    );
  }

  // ---- Speaking: spoken words solid, current word orange, the rest grey ----
  if (phase === 'speaking' && turn) {
    const all = words(turn.reply, 'pending');
    const items = all.map((w, i) => ({ ...w, tone: i < spokenWords ? 'ink' : i === spokenWords ? 'current' : 'pending' }) as Word);
    return (
      <>
        {turn.user && <PreviousTurn text={turn.user} />}
        <Meta>Assistant · speaking</Meta>
        <Utterance items={items} />
      </>
    );
  }

  // ---- Reply failed: keep the question, explain inline ----
  if (turn?.status === 'error') {
    return (
      <>
        <Meta>You</Meta>
        <Utterance items={words(turn.user, 'ink')} />
        <div role="alert" className="mt-3 flex max-w-[560px] items-start gap-3.5">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-danger" />
          <div className="flex flex-col gap-2">
            <p className="text-xl font-semibold tracking-[-0.01em]">Couldn&apos;t get a reply.</p>
            <p className="text-[15px] leading-normal text-ink-2">{turn.error}</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onRetry}
                disabled={phase === 'paused'}
                className="press h-11 rounded-xl bg-ink px-4 text-sm font-medium text-canvas disabled:opacity-40"
              >
                Ask again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ---- Ready / paused after a turn: the last exchange, dimmed ----
  if (turn && (turn.reply || turn.user)) {
    return (
      <>
        {turn.user && <PreviousTurn text={turn.user} />}
        <Meta>{phase === 'paused' ? 'Paused' : 'Assistant'}</Meta>
        <Utterance items={words(turn.reply || '…', 'muted')} size="lg" />
        {phase === 'ready' && (
          <p className="text-[15px] text-ink-3">
            <TalkHint mode={talkMode} /> to ask something else.
          </p>
        )}
      </>
    );
  }

  // ---- Empty, but no connection yet ----
  if (phase === 'paused') {
    return (
      <>
        <Meta dot="bg-warn">Paused</Meta>
        <Utterance items={words('Waiting for the server.', 'pending')} />
        <p className="text-[15px] leading-normal text-ink-3">The mic turns on as soon as the connection is back.</p>
      </>
    );
  }

  // ---- Empty ----
  return (
    <>
      <Meta>Ready</Meta>
      <Utterance items={words('Start talking. Your words show up here.', 'pending')} />
      <p className="text-[15px] leading-normal text-ink-3">
        <TalkHint mode={talkMode} />. Replies are spoken back to you.
      </p>
    </>
  );
}
