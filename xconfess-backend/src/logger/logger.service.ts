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
