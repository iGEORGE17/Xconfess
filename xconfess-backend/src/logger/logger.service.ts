// src/logger/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { UserIdMasker } from 'src/utils/mask-user-id';

@Injectable()
export class AppLogger implements NestLoggerService {
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

  log(message: any, context?: string, requestId?: string) {
    console.log(this.formatPrefix(context, requestId), this.sanitize(message));
  }

  error(message: any, trace?: string, context?: string, requestId?: string) {
    console.error(
      this.formatPrefix(context, requestId),
      this.sanitize(message),
      trace || '',
    );
  }

  warn(message: any, context?: string, requestId?: string) {
    console.warn(this.formatPrefix(context, requestId), this.sanitize(message));
  }

  debug(message: any, context?: string, requestId?: string) {
    console.debug(
      this.formatPrefix(context, requestId),
      this.sanitize(message),
    );
  }

  verbose(message: any, context?: string, requestId?: string) {
    console.log(
      `[VERBOSE]${this.formatPrefix(context, requestId)}`,
      this.sanitize(message),
    );
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
