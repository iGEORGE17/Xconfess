import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class ConfessionViewCacheService {
  constructor(
    @InjectRedis() private readonly redis: Redis
  ) {}

  async hasViewedRecently(confessionId: string, userOrIp: string): Promise<boolean> {
    const key = `confession:viewed:${confessionId}:${userOrIp}`;
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  async markViewed(confessionId: string, userOrIp: string): Promise<void> {
    const key = `confession:viewed:${confessionId}:${userOrIp}`;
    await this.redis.set(key, '1', 'EX', 60 * 60); // 1 hour expiry
  }
}
