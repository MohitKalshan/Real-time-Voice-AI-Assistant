import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder(sessionId: string) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          // Send chunk to backend
          // Note: In production, use a WebSocket or a better streaming mechanism.
          // Here we POST chunks.
          const buffer = await event.data.arrayBuffer();
          await fetch(`http://localhost:3001/audio?sessionId=${sessionId}`, {
            method: 'POST',
            body: buffer,
            headers: {
              'Content-Type': 'application/octet-stream',
            },
          });
        }
      };

      mediaRecorder.start(250); // Slice every 250ms
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  }, [sessionId]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, []);

  return { isRecording, startRecording, stopRecording };
}
