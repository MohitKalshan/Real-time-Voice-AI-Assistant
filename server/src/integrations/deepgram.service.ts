import {
  createClient,
  DeepgramClient,
  ListenLiveClient,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
} from '@deepgram/sdk';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { errorStack } from '../common/errors';
import { AppConfig } from '../config/configuration';

/** Copies a Buffer's bytes into a standalone ArrayBuffer (Buffers may be views into a larger pool). */
function toArrayBuffer(chunk: Buffer): ArrayBuffer {
  return new Uint8Array(chunk).buffer;
}

export type TranscriptHandler = (text: string, isFinal: boolean) => void;

/** A live Deepgram stream that buffers audio until the socket is open. */
export interface LiveTranscriber {
  send(chunk: Buffer): void;
  isClosed(): boolean;
  close(): void;
}

@Injectable()
export class DeepgramService {
  private readonly logger = new Logger(DeepgramService.name);
  private readonly client: DeepgramClient;
  private readonly options: AppConfig['deepgram'];

  constructor(config: ConfigService<AppConfig, true>) {
    this.options = config.get('deepgram', { infer: true });
    this.client = createClient(this.options.apiKey);
  }

  createTranscriber(
    sessionId: string,
    onTranscript: TranscriptHandler,
  ): LiveTranscriber {
    const connection: ListenLiveClient = this.client.listen.live({
      model: this.options.model,
      language: this.options.language,
      smart_format: true,
      interim_results: true,
    });

    // The first chunk from MediaRecorder carries the container header, so nothing may be dropped
    // while the socket is still connecting.
    let pending: ArrayBuffer[] = [];
    let open = false;
    let closed = false;

    connection.on(LiveTranscriptionEvents.Open, () => {
      this.logger.log(`Connection opened for session ${sessionId}`);
      open = true;
      for (const chunk of pending) connection.send(chunk);
      pending = [];
    });

    connection.on(
      LiveTranscriptionEvents.Transcript,
      (data: LiveTranscriptionEvent) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        if (transcript) onTranscript(transcript, data.is_final ?? false);
      },
    );

    connection.on(LiveTranscriptionEvents.Error, (err: unknown) => {
      this.logger.error(`Error for session ${sessionId}`, errorStack(err));
    });

    connection.on(LiveTranscriptionEvents.Close, () => {
      this.logger.log(`Connection closed for session ${sessionId}`);
      closed = true;
      pending = [];
    });

    return {
      send: (chunk) => {
        if (closed) return;
        if (open) connection.send(toArrayBuffer(chunk));
        else pending.push(toArrayBuffer(chunk));
      },
      isClosed: () => closed,
      close: () => {
        if (closed) return;
        closed = true;
        pending = [];
        connection.requestClose();
      },
    };
  }
}
