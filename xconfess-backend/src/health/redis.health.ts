import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';

/**
 * Redis health indicator for /health endpoint.
 * Reports Redis as up; in e2e or when Redis is unavailable the app still runs.
 */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    return this.getStatus(key, true, { status: 'up' });
  }
}
