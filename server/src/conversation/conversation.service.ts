import {
  Injectable,
  Logger,
  MessageEvent,
  OnModuleDestroy,
} from '@nestjs/common';
import { Observable, Subscriber } from 'rxjs';
import { errorStack } from '../common/errors';
import {
  DeepgramService,
  LiveTranscriber,
} from '../integrations/deepgram.service';
import { ElevenLabsService } from '../integrations/elevenlabs.service';
import { GeminiService } from '../integrations/gemini.service';
import { ServerEvent } from './conversation.events';

interface Session {
  id: string;
  subscriber: Subscriber<MessageEvent>;
  transcriber?: LiveTranscriber;
  /** Serializes assistant replies so tokens/audio from consecutive turns never interleave. */
  replyQueue: Promise<void>;
  closed: boolean;
}

@Injectable()
export class ConversationService implements OnModuleDestroy {
  private readonly logger = new Logger(ConversationService.name);
  private readonly sessions = new Map<string, Session>();

  constructor(
    private readonly deepgram: DeepgramService,
    private readonly gemini: GeminiService,
    private readonly elevenLabs: ElevenLabsService,
  ) {}

  /** Opens the SSE stream for a session. The session is torn down when the client disconnects. */
  openSession(sessionId: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      // A reconnect with the same id replaces the previous session.
      this.closeSession(sessionId);

      const session: Session = {
        id: sessionId,
        subscriber,
        replyQueue: Promise.resolve(),
        closed: false,
      };
      this.sessions.set(sessionId, session);

      return () => {
        // Only close if a newer connection hasn't already replaced this one.
        if (this.sessions.get(sessionId) === session)
          this.closeSession(sessionId);
      };
    });
  }

  /** Forwards an audio chunk to the session's transcriber. Returns false if no session is open. */
  pushAudio(sessionId: string, chunk: Buffer): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logger.warn(`Dropping audio for unknown session ${sessionId}`);
      return false;
    }
    // Connect lazily, and reconnect if Deepgram closed the socket (e.g. idle timeout).
    if (!session.transcriber || session.transcriber.isClosed()) {
      session.transcriber = this.deepgram.createTranscriber(
        sessionId,
        (text, isFinal) => this.onTranscript(session, text, isFinal),
      );
    }
    session.transcriber.send(chunk);
    return true;
  }

  onModuleDestroy(): void {
    for (const id of [...this.sessions.keys()]) this.closeSession(id);
  }

  private onTranscript(session: Session, text: string, isFinal: boolean): void {
    this.emit(session, { type: 'transcript', text, isFinal });

    if (isFinal && text.trim()) {
      session.replyQueue = session.replyQueue.then(() =>
        this.reply(session, text),
      );
    }
  }

  private async reply(session: Session, prompt: string): Promise<void> {
    if (session.closed) return;
    let failed = false;
    try {
      const responseText = await this.gemini.generateStream(prompt, (token) =>
        this.emit(session, { type: 'token', text: token }),
      );
      if (session.closed || !responseText.trim()) return;

      for await (const chunk of this.elevenLabs.streamAudio(responseText)) {
        if (session.closed) break;
        this.emit(session, { type: 'audio', audio: chunk.toString('base64') });
      }
    } catch (error) {
      this.logger.error(
        `Reply failed for session ${session.id}`,
        errorStack(error),
      );
      failed = true;
      // Tell the client the turn ended; provider details stay in the server log.
      this.emit(session, {
        type: 'error',
        message: "Sorry, I couldn't generate a reply. Please try again.",
      });
    } finally {
      // Every reply ends with exactly one terminal event ('done' or 'error'),
      // so the client can count pending replies and skip interrupted ones.
      if (!failed) this.emit(session, { type: 'done' });
    }
  }

  private emit(session: Session, event: ServerEvent): void {
    if (!session.closed) session.subscriber.next({ data: event });
  }

  private closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.closed = true;
    session.transcriber?.close();
    session.subscriber.complete();
    this.sessions.delete(sessionId);
  }
}
