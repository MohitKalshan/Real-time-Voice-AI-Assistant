import { Module } from '@nestjs/common';
import { DeepgramService } from '../integrations/deepgram.service';
import { ElevenLabsService } from '../integrations/elevenlabs.service';
import { GeminiService } from '../integrations/gemini.service';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
  controllers: [ConversationController],
  providers: [
    ConversationService,
    DeepgramService,
    GeminiService,
    ElevenLabsService,
  ],
})
export class ConversationModule {}
