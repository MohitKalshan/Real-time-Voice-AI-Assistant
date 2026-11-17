'use client';

import { useState } from 'react';
import { useVoiceSession } from '@/hooks/useVoiceSession';
import { useSpokenWords } from '@/hooks/useSpokenWords';
import { useSpaceToTalk } from '@/hooks/useSpaceToTalk';
import { useTheme } from '@/hooks/useTheme';
import { TopBar } from '@/components/voice/TopBar';
import { Dock } from '@/components/voice/Dock';
import { Conversation } from '@/components/voice/Conversation';
import { TranscriptPanel } from '@/components/voice/TranscriptPanel';
import { Toast } from '@/components/voice/Toast';
import { SettingsSheet } from '@/components/voice/SettingsSheet';

export default function Home() {
  const voice = useVoiceSession();
  const { phase, turns, settings, connection } = voice;
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useTheme(settings.theme);
  const spokenWords = useSpokenWords(voice.playing, voice.playbackTime);

  useSpaceToTalk({
    enabled: !settingsOpen && phase !== 'paused',
    mode: settings.talkMode,
    onToggle: () => void voice.toggleMic(),
    onPress: () => {
      if (phase !== 'listening') void voice.toggleMic();
    },
    onRelease: () => {
      if (phase === 'listening') voice.stopListening();
    },
  });

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <TopBar
        connection={connection.status}
        transcriptOpen={transcriptOpen}
        onToggleTranscript={() => setTranscriptOpen((o) => !o)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex min-h-0 flex-1 flex-wrap">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col">
          {/* Small screens: the transcript replaces the conversation, so the dock stays at the bottom. */}
          {transcriptOpen && (
            <div className="flex min-h-0 flex-1 flex-col lg:hidden">
              <TranscriptPanel turns={turns} />
            </div>
          )}
          <main
            aria-live="polite"
            className={`flex-1 flex-col justify-center gap-[18px] px-6 py-12 sm:px-[clamp(24px,8vw,120px)] ${
              transcriptOpen ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <Conversation
              phase={phase}
              turn={turns.at(-1)}
              liveCaptions={settings.liveCaptions}
              spokenWords={spokenWords}
              talkMode={settings.talkMode}
              onRetry={() => void voice.startListening()}
            />
          </main>

          <div className="sticky bottom-0 flex justify-center px-3 pb-7 sm:px-4 sm:pb-8">
            <Dock
              phase={phase}
              talkMode={settings.talkMode}
              inputStream={voice.inputStream}
              outputAnalyser={voice.outputAnalyser}
              onMic={() => void voice.toggleMic()}
              onEnd={voice.endSession}
              canEnd={turns.length > 0 || phase !== 'ready'}
            />
          </div>
        </div>

        {transcriptOpen && (
          <div className="hidden lg:flex">
            <TranscriptPanel turns={turns} />
          </div>
        )}
      </div>

      {connection.status === 'reconnecting' && (
        <Toast
          tone="warn"
          title="Connection lost"
          countdownTo={connection.retryAt}
          action={{ label: 'Retry now', onClick: connection.retryNow }}
        />
      )}
      {voice.micError && connection.status !== 'reconnecting' && (
        <Toast
          tone="error"
          title={voice.micError}
          description="Allow microphone access in your browser's site settings, then try again."
          action={{ label: 'Dismiss', onClick: voice.clearMicError }}
        />
      )}

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} />
    </div>
  );
}
