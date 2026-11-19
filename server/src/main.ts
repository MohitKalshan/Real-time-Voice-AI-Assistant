import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<AppConfig, true>);

  app.enableCors();
  // The client POSTs audio chunks as application/octet-stream; parse them into a Buffer.
  app.useBodyParser('raw', { type: 'application/octet-stream', limit: '5mb' });
  app.enableShutdownHooks();
  await app.listen(config.get('port', { infer: true }));
}
void bootstrap();
