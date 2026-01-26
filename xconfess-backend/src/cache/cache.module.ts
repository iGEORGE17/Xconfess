import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = {
          store: redisStore as any,
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          ttl: 300,
          max: 100,
        };

        if (configService.get('REDIS_PASSWORD')) {
          redisConfig['password'] = configService.get('REDIS_PASSWORD');
        }

        return redisConfig;
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
