'use client';

import { useState, useEffect, useRef } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSSE, SSEEvent } from '@/hooks/useSSE';
import { Mic, MicOff, Activity, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function Home() {
  const [sessionId, setSessionId] = useState<string>('');
  const [history, setHistory] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [currentAiResponse, setCurrentAiResponse] = useState<string>('');
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  const { isRecording, startRecording, stopRecording } = useAudioRecorder(sessionId);
  const { messages, isConnected } = useSSE(sessionId);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, currentTranscript, currentAiResponse]);

  // Process messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      
      if (lastMsg.type === 'transcript') {
        if (lastMsg.isFinal) {
          // Commit previous AI response if exists (though usually User speaks first, then AI)
          // Actually, if we are receiving a FINAL transcript, it means the user just finished a sentence.
          // If there was a pending AI response from a PREVIOUS turn that hasn't been committed, do it now.
          if (currentAiResponse.trim()) {
             setHistory(prev => [...prev, { role: 'ai', text: currentAiResponse }]);
             setCurrentAiResponse('');
          }
          
          // Commit this User message
          setHistory(prev => [...prev, { role: 'user', text: lastMsg.text || '' }]);
          setCurrentTranscript('');
        } else {
          setCurrentTranscript(lastMsg.text || '');
        }
      } else if (lastMsg.type === 'token') {
        setCurrentAiResponse((prev) => prev + (lastMsg.text || ''));
      } else if (lastMsg.type === 'audio' && lastMsg.audio) {
        setAudioQueue((prev) => [...prev, lastMsg.audio!]);
      } else if (lastMsg.type === 'error') {
        setCurrentAiResponse('');
        setHistory(prev => [...prev, { role: 'ai', text: lastMsg.message || 'Something went wrong.' }]);
      }
    }
  }, [messages]);

  // Audio Playback Queue
  useEffect(() => {
    if (!isPlaying && audioQueue.length > 0) {
      playNextAudio();
    }
  }, [audioQueue, isPlaying]);

  const playNextAudio = () => {
    const nextAudio = audioQueue[0];
    if (!nextAudio) return;

    setIsPlaying(true);
    const audio = new Audio(`data:audio/mp3;base64,${nextAudio}`);
    audioRef.current = audio;
    
    audio.onended = () => {
      setIsPlaying(false);
      setAudioQueue((prev) => prev.slice(1));
    };

    audio.play().catch(err => {
      console.error("Audio play error", err);
      setIsPlaying(false);
      setAudioQueue((prev) => prev.slice(1));
    });
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      // If we stop recording, we might want to commit the current AI response if it's done?
      // But we don't know if it's done. 
      // Let's just leave it. The next user input will commit it, or we can just render it as "current".
    } else {
      startRecording();
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <h1 className="font-semibold text-lg">AI Voice Chat</h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
          <span className="hidden sm:inline">ID: {sessionId.slice(0, 8)}</span>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto pt-20 pb-32 px-4 sm:px-6 md:px-20 lg:px-32 flex flex-col gap-6"
      >
        {history.length === 0 && !currentTranscript && !currentAiResponse && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-20">
            <p className="text-xl font-medium">Start a conversation</p>
            <p className="text-sm mt-2">Tap the microphone to speak</p>
          </div>
        )}

        {history.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-800 text-gray-100 rounded-bl-none'
            }`}>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Current User Transcript (Interim) */}
        {currentTranscript && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-blue-600/50 text-white/80 rounded-br-none border border-blue-500/30">
              <p className="leading-relaxed italic">{currentTranscript}...</p>
            </div>
          </div>
        )}

        {/* Current AI Response (Streaming) */}
        {currentAiResponse && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700">
              <p className="leading-relaxed">
                {currentAiResponse}
                <span className="inline-block w-1.5 h-4 bg-blue-400 ml-1 align-middle animate-pulse"></span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 w-full bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pt-10 pb-8 px-4 flex justify-center items-center z-20">
        <button
          onClick={toggleRecording}
          className={`relative group p-4 rounded-full transition-all duration-300 transform hover:scale-105 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
              : 'bg-white hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
          }`}
        >
          {isRecording ? (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75"></span>
              <MicOff className="w-8 h-8 text-white relative z-10" />
            </>
          ) : (
            <Mic className="w-8 h-8 text-black" />
          )}
        </button>
      </div>
    </main>
  );
}
