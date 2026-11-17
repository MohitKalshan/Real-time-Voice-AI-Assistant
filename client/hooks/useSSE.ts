import { useEffect, useState } from 'react';

export interface SSEEvent {
  type: 'transcript' | 'token' | 'audio' | 'error';
  text?: string;
  message?: string; // set on 'error'
  isFinal?: boolean;
  audio?: string; // base64
}

export function useSSE(sessionId: string) {
  const [messages, setMessages] = useState<SSEEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const eventSource = new EventSource(`http://localhost:3001/sse?sessionId=${sessionId}`);

    eventSource.onopen = () => {
      console.log('SSE Connected');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // NestJS SSE sends data wrapped in "data" property if using MessageEvent, 
        // but here we might receive it directly or wrapped.
        // Let's assume standard NestJS SSE format:
        // data: { type: ..., ... }
        
        // Actually, NestJS Observable<MessageEvent> sends:
        // id: ...
        // type: ...
        // data: ... (this is what we get in event.data)
        
        // If we sent an object, it's JSON stringified.
        // The Orchestrator sent { data: { type: ... } }
        // So event.data will be '{"type":...}' if we unwrapped it, or '{"data": {"type":...}}'
        // Let's check Orchestrator: session.sse.next({ data: { type: 'transcript', ... } });
        // So event.data will be JSON.stringify({ type: 'transcript', ... })
        
        setMessages((prev) => [...prev, data]);
      } catch (e) {
        console.error('Error parsing SSE message:', e);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  return { messages, isConnected };
}
