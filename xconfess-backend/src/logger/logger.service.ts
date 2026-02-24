// src/services/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { UserIdMasker } from '../utils/mask-user-id';

type MetricLabels = Record<string, string | number | boolean>;

interface TimerAggregate {
  count: number;
  totalMs: number;
  minMs: number;
  maxMs: number;
  lastMs: number;
}

@Injectable()
export class AppLogger implements NestLoggerService {
  private readonly counters = new Map<string, number>();
  private readonly gauges = new Map<string, number>();
  private readonly timers = new Map<string, TimerAggregate>();
// src/logger/logger.service.ts
import {
  Injectable,
  Logger,
  LoggerService as NestLoggerService,
} from '@nestjs/common';
import { UserIdMasker } from '../utils/mask-user-id';

@Injectable()
export class AppLogger implements NestLoggerService {
  private readonly nestLogger = new Logger('AppLogger');

  /**
   * Sanitizes log message by masking any user IDs
   */
  private sanitize(message: any): any {
    if (typeof message === 'string') {
      return message;
    }

    if (typeof message === 'object' && message !== null) {
      return UserIdMasker.maskObject(message);
    }

    return message;
  }

  private formatPrefix(context?: string, requestId?: string): string {
    const parts: string[] = [];
    if (context) parts.push(context);
    if (requestId) parts.push(`req:${requestId}`);
    return parts.length > 0 ? `[${parts.join('][')}]` : '[App]';
  }

  private toLogPayload(
    message: any,
    context?: string,
    requestId?: string,
  ): { prefix: string; data: any } {
    return {
      prefix: this.formatPrefix(context, requestId),
      data: this.sanitize(message),
    };
  }

  log(message: any, context?: string, requestId?: string) {
    const payload = this.toLogPayload(message, context, requestId);
    this.nestLogger.log(payload, context);
  }

  error(message: any, trace?: string, context?: string, requestId?: string) {
    const payload = this.toLogPayload(message, context, requestId);
    this.nestLogger.error(payload, trace, context);
  }

  warn(message: any, context?: string, requestId?: string) {
    const payload = this.toLogPayload(message, context, requestId);
    this.nestLogger.warn(payload, context);
  }

  debug(message: any, context?: string, requestId?: string) {
    const payload = this.toLogPayload(message, context, requestId);
    this.nestLogger.debug(payload, context);
  }

  verbose(message: any, context?: string, requestId?: string) {
    const payload = this.toLogPayload(message, context, requestId);
    this.nestLogger.verbose(payload, context);
  }

  private normalizeLabelValue(value: string | number | boolean): string {
    return String(value);
  }

  private serializeLabels(labels?: MetricLabels): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }

    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${this.normalizeLabelValue(value)}`)
      .join(',');
  }

  private metricKey(name: string, labels?: MetricLabels): string {
    const serializedLabels = this.serializeLabels(labels);
    return serializedLabels ? `${name}|${serializedLabels}` : name;
  }

  incrementCounter(name: string, value = 1, labels?: MetricLabels): number {
    const key = this.metricKey(name, labels);
    const current = this.counters.get(key) ?? 0;
    const next = current + value;
    this.counters.set(key, next);
    return next;
  }

  setGauge(name: string, value: number, labels?: MetricLabels): number {
    const key = this.metricKey(name, labels);
    this.gauges.set(key, value);
    return value;
  }

  observeTimer(name: string, durationMs: number, labels?: MetricLabels): TimerAggregate {
    const key = this.metricKey(name, labels);
    const current = this.timers.get(key);

    if (!current) {
      const created: TimerAggregate = {
        count: 1,
        totalMs: durationMs,
        minMs: durationMs,
        maxMs: durationMs,
        lastMs: durationMs,
      };
      this.timers.set(key, created);
      return created;
    }

    const next: TimerAggregate = {
      count: current.count + 1,
      totalMs: current.totalMs + durationMs,
      minMs: Math.min(current.minMs, durationMs),
      maxMs: Math.max(current.maxMs, durationMs),
      lastMs: durationMs,
    };

    this.timers.set(key, next);
    return next;
  }

  getMetricsSnapshot() {
    const parseMetric = (key: string) => {
      const [name, rawLabels] = key.split('|');
      const labels: Record<string, string> = {};

      if (rawLabels) {
        rawLabels.split(',').forEach((pair) => {
          const [k, v] = pair.split('=');
          if (k && v !== undefined) {
            labels[k] = v;
          }
        });
      }

      return { name, labels };
    };

    const counters = Array.from(this.counters.entries()).map(([key, value]) => ({
      ...parseMetric(key),
      value,
      type: 'counter' as const,
    }));

    const gauges = Array.from(this.gauges.entries()).map(([key, value]) => ({
      ...parseMetric(key),
      value,
      type: 'gauge' as const,
    }));

    const timers = Array.from(this.timers.entries()).map(([key, value]) => ({
      ...parseMetric(key),
      ...value,
      avgMs: value.count > 0 ? value.totalMs / value.count : 0,
      type: 'timer' as const,
    }));

    return { counters, gauges, timers };
  }

  /**
   * Log with explicit user context (auto-masks)
   */
  logWithUser(
    message: string,
    userId: string | number,
    context?: string,
    requestId?: string,
  ) {
    const maskedId = UserIdMasker.mask(userId);
    this.log(`${message} [${maskedId}]`, context, requestId);
  }

  /**
   * Log error with user context (auto-masks)
   */
  errorWithUser(
    message: string,
    userId: string | number,
    trace?: string,
    context?: string,
    requestId?: string,
  ) {
    const maskedId = UserIdMasker.mask(userId);
    this.error(`${message} [${maskedId}]`, trace, context, requestId);
  }

  /**
   * Log with request-id context only (no user)
   */
  logWithRequestId(message: string, requestId: string, context?: string) {
    this.log(message, context, requestId);
  }

  /**
   * Log error with request-id context only (no user)
   */
  errorWithRequestId(
    message: string,
    requestId: string,
    trace?: string,
    context?: string,
  ) {
    this.error(message, trace, context, requestId);
  }
}
