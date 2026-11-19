import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';

@Injectable()
export class GeminiService {
  private readonly model: GenerativeModel;

  constructor(config: ConfigService<AppConfig, true>) {
    const { apiKey, model } = config.get('gemini', { infer: true });
    this.model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model });
  }

  /** Streams a completion, invoking `onToken` per chunk, and resolves with the full text. */
  async generateStream(
    prompt: string,
    onToken: (token: string) => void,
  ): Promise<string> {
    const result = await this.model.generateContentStream(prompt);
    let fullText = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullText += text;
      onToken(text);
    }
    return fullText;
  }
}
