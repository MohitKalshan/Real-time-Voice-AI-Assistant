import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  MessageEvent,
  NotFoundException,
  ParseUUIDPipe,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConversationService } from './conversation.service';

/** Rejects a missing or non-UUIDv4 `sessionId` with 400. */
const SessionId = () => Query('sessionId', new ParseUUIDPipe({ version: '4' }));

@Controller()
export class ConversationController {
  constructor(private readonly conversation: ConversationService) {}

  @Sse('sse')
  events(@SessionId() sessionId: string): Observable<MessageEvent> {
    return this.conversation.openSession(sessionId);
  }

  @Post('audio')
  @HttpCode(200)
  audio(@SessionId() sessionId: string, @Body() body: unknown) {
    if (!Buffer.isBuffer(body) || body.length === 0) {
      throw new BadRequestException(
        'Expected a non-empty application/octet-stream body',
      );
    }
    if (!this.conversation.pushAudio(sessionId, body)) {
      throw new NotFoundException(
        `No open session ${sessionId}; connect to /sse first`,
      );
    }
    return { status: 'ok' };
  }
}
