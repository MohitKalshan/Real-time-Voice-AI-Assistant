import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration, { validateEnv } from './config/configuration';
import { ConversationModule } from './conversation/conversation.module';

// TypeORM/Postgres is intentionally not wired up: nothing persists data yet. Re-add it with
// migrations (not `synchronize`) when transcript persistence (PRD FR-10) is implemented.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnv,
    }),
    ConversationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
