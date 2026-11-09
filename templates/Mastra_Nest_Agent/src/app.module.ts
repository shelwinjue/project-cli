import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MastraModule } from '@mastra/nestjs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import configuration from './config/configuration';
import { mastra } from './mastra';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 3_600,
        },
      ],
    }),
    /*
     * 普通 NestJS 业务模块必须注册在 MastraModule 之前。
     * Mastra NestJS Adapter 包含 catch-all 路由，放在前面可能吞掉后续路由。
     */
    MastraModule.register({
      mastra,
      prefix: '/api/mastra',
      rateLimitOptions: {
        enabled: false,
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
