'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL } from '@/lib/config';

/**
 * Records the mic as WebM/Opus and POSTs a chunk every 250 ms.
 *
 * Chunks are slices of ONE continuous file: only the first carries the WebM header,
 * so Deepgram must receive them in order. Uploads are therefore chained: each POST
 * starts only after the previous one finished. (Before, a slow request could be
 * overtaken and corrupt the stream.)
 */
export function useAudioRecorder(sessionId: string, deviceId: string) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const uploads = useRef<Promise<void>>(Promise.resolve());

  const start = useCallback(async (): Promise<boolean> => {
    if (recorder.current) return true;
    setError(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      });
      const rec = new MediaRecorder(media);
      rec.ondataavailable = (event) => {
        if (event.data.size === 0) return;
        const chunk = event.data;
        uploads.current = uploads.current.then(async () => {
          try {
            await fetch(`${API_URL}/audio?sessionId=${sessionId}`, {
              method: 'POST',
              body: chunk,
              headers: { 'Content-Type': 'application/octet-stream' },
            });
          } catch (e) {
            console.error('Audio upload failed', e);
          }
        });
      };
      rec.start(250);
      recorder.current = rec;
      setStream(media);
      return true;
    } catch (e) {
      const blocked = e instanceof DOMException && e.name === 'NotAllowedError';
      setError(blocked ? 'Microphone access is blocked for this site.' : 'The microphone could not be started.');
      return false;
    }
  }, [sessionId, deviceId]);

  const stop = useCallback(() => {
    const rec = recorder.current;
    if (!rec) return;
    rec.stop();
    rec.stream.getTracks().forEach((t) => t.stop());
    recorder.current = null;
    setStream(null);
  }, []);

  // Release the mic if the page unmounts mid-recording.
  useEffect(() => () => recorder.current?.stream.getTracks().forEach((t) => t.stop()), []);

  return { isRecording: stream !== null, stream, start, stop, error, clearError: () => setError(null) };
}
