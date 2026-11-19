import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElevenLabsClient } from 'elevenlabs';
import { AppConfig } from '../config/configuration';

@Injectable()
export class ElevenLabsService {
  private readonly client: ElevenLabsClient;
  private readonly options: AppConfig['elevenLabs'];

  constructor(config: ConfigService<AppConfig, true>) {
    this.options = config.get('elevenLabs', { infer: true });
    this.client = new ElevenLabsClient({ apiKey: this.options.apiKey });
  }

  /** Streams synthesized speech for `text` as audio chunks. */
  async *streamAudio(text: string): AsyncGenerator<Buffer> {
    const stream = await this.client.generate({
      voice: this.options.voiceId,
      model_id: this.options.modelId,
      text,
      stream: true,
    });
    for await (const chunk of stream) {
      yield Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
    }
  }
}
