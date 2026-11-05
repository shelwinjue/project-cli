import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: false,
    }),
  );

  const config = app.get(ConfigService);
  const corsOrigin = config.get<string>('cors.origin') || '*';

  if (corsOrigin === '*') {
    app.enableCors({ origin: '*' });
  } else {
    const allowedOrigins = corsOrigin
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    app.enableCors({
      credentials: true,
      origin(origin, callback) {
        callback(null, !origin || allowedOrigins.includes(origin));
      },
    });
  }

  app.setGlobalPrefix('api');

  const port = config.get<number>('port') || 3000;
  await app.listen(port);

  console.log(`NestJS server is running at http://localhost:${port}`);
  console.log(`Mastra API is available at http://localhost:${port}/api/mastra`);
}

void bootstrap();
