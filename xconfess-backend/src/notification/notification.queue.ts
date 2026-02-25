import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { Comment } from '../comment/entities/comment.entity';
import { AppLogger } from '../logger/logger.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { rateLimitConfig } from '../config/rate-limit.config';
import {
  dlqRetentionConfig,
  DlqRetentionConfig,
} from '../config/dlq-retention.config';
import * as crypto from 'crypto';
import Redis from 'ioredis';

export interface CommentNotificationPayload {
  confession: AnonymousConfession;
  comment: Comment;
  recipientEmail: string;
  channel?: string;
}

export interface DlqJobFilter {
  failedAfter?: string;
  failedBefore?: string;
  search?: string;
}

export interface DlqJobView {
  id: string;
  name: string;
  attemptsMade: number;
  maxAttempts: number;
  failedReason: string | null;
  failedAt: string | null;
  createdAt: string | null;
  channel: string;
  recipientEmail?: string;
}

export interface DlqListResult {
  jobs: DlqJobView[];
  total: number;
  page: number;
  limit: number;
}

export interface ReplayResult {
  attempted: number;
  replayed: number;
  failed: number;
  details: Array<{
    id: string;
    status: 'replayed' | 'failed';
    reason?: string;
  }>;
}

/**
 * Fields used to construct the idempotency key.
 * Only stable, non-sensitive identifiers — never email addresses or content.
 */
interface IdempotencyFields {
  eventType: string; // e.g. 'comment-notification'
  recipientEmail: string;
  entityId: string; // confession ID
}

const DEDUPE_KEY_PREFIX = 'notif:dedupe:';

@Injectable()
export class NotificationQueue implements OnModuleDestroy {
  private readonly queueName = 'comment-notifications';
  private queue: Queue;
  private worker: Worker;
  private redisClient: Redis;
  private readonly dedupeTtl: number;

  private readonly dlqConfig: DlqRetentionConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly appLogger: AppLogger,
    private readonly auditLogService: AuditLogService,
    @Inject('DLQ_RETENTION_CONFIG')
    dlqConfig: DlqRetentionConfig = dlqRetentionConfig,
  ) {
    this.dedupeTtl = rateLimitConfig.notification.dedupeTtlSeconds;
    this.dlqConfig = dlqConfig;
    this.initializeWorkers();
    // Schedule periodic cleanup (every 6 hours)
    setInterval(
      () => {
        this.cleanupDlq().catch((err) =>
          this.appLogger.error(`DLQ cleanup failed: ${err.message}`),
        );
      },
      6 * 60 * 60 * 1000,
    );
  }
  /**
   * Cleanup DLQ jobs older than retention window.
   * If dryRun is true, only logs candidates.
   * Emits audit log for each batch.
   */
  async cleanupDlq(options?: {
    dryRun?: boolean;
    batchSize?: number;
    retentionDays?: number;
    actorId?: string;
  }) {
    const now = Date.now();
    const retentionMs =
      1000 *
      60 *
      60 *
      24 *
      (options?.retentionDays ?? this.dlqConfig.retentionDays);
    const cutoff = now - retentionMs;
    const dryRun = options?.dryRun ?? this.dlqConfig.dryRun;
    const batchSize = options?.batchSize ?? this.dlqConfig.cleanupBatchSize;
    const actorId = options?.actorId ?? 'system';

    const failedJobs = await this.queue.getJobs(['failed'], 0, -1, false);
    const candidates = failedJobs.filter((job) => {
      const failedAt = job.finishedOn
        ? new Date(job.finishedOn).getTime()
        : null;
      return failedAt !== null && failedAt < cutoff;
    });
    const toProcess = candidates.slice(0, batchSize);

    if (dryRun) {
      this.appLogger.log(
        `[DLQ Cleanup] Dry run: ${toProcess.length} jobs older than ${this.dlqConfig.retentionDays} days would be deleted/archived`,
        'NotificationQueue',
      );
    } else {
      let deleted = 0;
      for (const job of toProcess) {
        try {
          await job.remove();
          deleted++;
        } catch (err) {
          this.appLogger.error(
            `Failed to remove DLQ job ${job.id}: ${err.message}`,
          );
        }
      }
      this.appLogger.log(
        `[DLQ Cleanup] Deleted ${deleted} jobs older than ${this.dlqConfig.retentionDays} days`,
        'NotificationQueue',
      );
    }

    // Audit log
    await this.auditLogService.log({
      actionType: 'NOTIFICATION_DLQ_CLEANUP',
      metadata: {
        entityType: 'notification_dlq',
        dryRun,
        retentionDays: this.dlqConfig.retentionDays,
        batchSize,
        attempted: toProcess.length,
        deleted: dryRun ? 0 : toProcess.length,
        jobIds: toProcess.map((j) => j.id),
        cleanedAt: new Date().toISOString(),
      },
      context: { userId: actorId },
    });

    return {
      attempted: toProcess.length,
      deleted: dryRun ? 0 : toProcess.length,
      dryRun,
      jobIds: toProcess.map((j) => j.id),
    };
  }

  private initializeWorkers() {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    };

    // Dedicated ioredis client for idempotency key management.
    // Kept separate from BullMQ's internal connection so Bull's
    // subscribe/blocking commands don't interfere.
    this.redisClient = new Redis(redisConfig);

    this.queue = new Queue(this.queueName, {
      connection: redisConfig,
    });

    this.worker = new Worker(
      this.queueName,
      async (job: Job<CommentNotificationPayload>) => {
        const channel = this.getChannel(job.data);
        const startedAt = Date.now();
        await this.processCommentNotification(job.data);

        this.appLogger.observeTimer(
          'notification_job_processing_duration_ms',
          Date.now() - startedAt,
          { channel, queue: this.queueName },
        );
      },
      { connection: redisConfig },
    );

    this.worker.on('completed', (job) => {
      const maskedJobId = job.id;
      this.appLogger.log(
        `Job ${maskedJobId} completed successfully`,
        'NotificationQueue',
      );
      this.appLogger.incrementCounter('notification_job_completed_total', 1, {
        channel: this.getChannel(job.data as CommentNotificationPayload),
        queue: this.queueName,
      });
      this.updateQueueDepthMetrics().catch(() => undefined);
    });

    this.worker.on('failed', (job, error) => {
      const maskedJobId = job?.id;
      const maskedError =
        error && typeof error.message === 'string'
          ? UserIdMasker.maskObject({ msg: error.message }).msg
          : error;
      this.appLogger.error(
        `Job ${maskedJobId} failed: ${maskedError}`,
        undefined,
        'NotificationQueue',
      );

      if (!job) return;

      const channel = this.getChannel(job.data as CommentNotificationPayload);
      const attemptsMade = job.attemptsMade ?? 0;
      const maxAttempts = job.opts.attempts ?? 1;
      const isTerminalFailure = attemptsMade >= maxAttempts;

      if (isTerminalFailure) {
        this.appLogger.incrementCounter('notification_send_failure_total', 1, {
          channel,
          queue: this.queueName,
          outcome: 'terminal',
        });
      } else {
        this.appLogger.incrementCounter('notification_retry_attempt_total', 1, {
          channel,
          queue: this.queueName,
          attempt: String(attemptsMade),
        });
      }

      this.updateQueueDepthMetrics().catch(() => undefined);
    });
  }

  // ---------------------------------------------------------------------------
  // Idempotency helpers
  // ---------------------------------------------------------------------------

  /**
   * Build a deterministic, opaque idempotency key from stable, non-sensitive
   * fields. The SHA-256 hash means the Redis key never exposes user data.
   *
   * Key space: eventType + recipientEmail + confessionId
   * Collision probability across the TTL window is negligible for this scale.
   */
  buildIdempotencyKey(fields: IdempotencyFields): string {
    const raw = `${fields.eventType}:${fields.recipientEmail}:${fields.entityId}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return `${DEDUPE_KEY_PREFIX}${hash}`;
  }

  /**
   * Attempt to claim the idempotency slot for this notification.
   *
   * Uses Redis SET NX EX — atomic: only one caller can set the key; all
   * concurrent callers racing on the same key will get null back.
   *
   * Returns true if the slot was claimed (caller should enqueue).
   * Returns false if a duplicate was detected (caller should skip).
   */
  private async claimIdempotencySlot(key: string): Promise<boolean> {
    const result = await this.redisClient.set(
      key,
      '1',
      'EX',
      this.dedupeTtl,
      'NX',
    );
    return result === 'OK';
  }

  // ---------------------------------------------------------------------------
  // Public enqueue API
  // ---------------------------------------------------------------------------

  /**
   * Enqueue a comment notification for processing.
   *
   * Idempotency guarantee: duplicate calls with the same confession ID,
   * recipient email, and event type within the dedupe TTL window will be
   * collapsed — only the first call results in a queued job.
   */
  async enqueueCommentNotification(
    payload: CommentNotificationPayload,
  ): Promise<void> {
    const channel = this.getChannel(payload);

    const idempotencyFields: IdempotencyFields = {
      eventType: 'comment-notification',
      recipientEmail: payload.recipientEmail,
      entityId: String(payload.confession?.id ?? ''),
    };

    const idempotencyKey = this.buildIdempotencyKey(idempotencyFields);
    const claimed = await this.claimIdempotencySlot(idempotencyKey);

    if (!claimed) {
      // Duplicate detected — log for debugging without exposing payload data
      this.appLogger.warn(
        'Duplicate notification enqueue suppressed (idempotency)',
        'NotificationQueue',
      );
      this.appLogger.incrementCounter(
        'notification_dedupe_suppressed_total',
        1,
        {
          channel,
          queue: this.queueName,
        },
      );
      return;
    }

    this.appLogger.incrementCounter('notification_enqueued_total', 1, {
      channel,
      queue: this.queueName,
    });

    // Attach template key/version if present in payload
    let jobOpts: any = {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    };
    if ((payload as any).templateKey && (payload as any).templateVersion) {
      jobOpts.templateKey = (payload as any).templateKey;
      jobOpts.templateVersion = (payload as any).templateVersion;
    }
    await this.queue.add('comment-notification', payload, jobOpts);

    await this.updateQueueDepthMetrics();
  }

  // ---------------------------------------------------------------------------
  // Private processing
  // ---------------------------------------------------------------------------

  private async processCommentNotification(
    payload: CommentNotificationPayload,
  ): Promise<void> {
    const { confession, comment, recipientEmail } = payload;

    const logContext = `confessionId=${confession?.id} commentId=${comment?.id}`;

    this.appLogger.debug(
      UserIdMasker.maskObject({
        msg: `Processing comment notification [${logContext}]`,
      }).msg,
      'NotificationQueue',
    );

    if (!recipientEmail) {
      this.appLogger.warn(
        UserIdMasker.maskObject({
          msg: `Skipping comment notification: no recipient email [${logContext}]`,
        }).msg,
        'NotificationQueue',
      );
      return;
    }

    const commentPreview = this.createAnonymizedPreview(comment.content);

    try {
      await this.emailService.sendCommentNotification({
        to: UserIdMasker.maskObject({ email: recipientEmail }).email,
        confessionId: confession.id,
        commentPreview: UserIdMasker.maskObject({ msg: commentPreview }).msg,
      });

      this.appLogger.log(
        UserIdMasker.maskObject({
          msg: `Comment notification sent [${logContext}]`,
        }).msg,
        'NotificationQueue',
      );
      this.appLogger.incrementCounter('notification_send_success_total', 1, {
        channel: this.getChannel(payload),
        queue: this.queueName,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.appLogger.error(
        UserIdMasker.maskObject({
          msg: `Failed to send comment notification: ${errorMessage} [${logContext}]`,
        }).msg,
        undefined,
        'NotificationQueue',
      );
      throw error; // re-throw to trigger BullMQ retry
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private getChannel(payload: CommentNotificationPayload): string {
    return payload.channel || 'email_comment_notification';
  }

  private createAnonymizedPreview(content: string): string {
    const maxLength = 100;
    return content.length > maxLength
      ? `${content.substring(0, maxLength)}...`
      : content;
  }

  // ---------------------------------------------------------------------------
  // DLQ / Admin
  // ---------------------------------------------------------------------------

  async getDiagnostics() {
    const [counts, failedCount] = await Promise.all([
      this.queue.getJobCounts(
        'waiting',
        'active',
        'delayed',
        'failed',
        'completed',
      ),
      this.queue.getFailedCount(),
    ]);

    const queueDepth =
      (counts.waiting || 0) + (counts.active || 0) + (counts.delayed || 0);
    const dlqDepth = failedCount || counts.failed || 0;

    this.appLogger.setGauge('notification_queue_depth', queueDepth, {
      queue: this.queueName,
    });
    this.appLogger.setGauge('notification_dlq_depth', dlqDepth, {
      queue: this.queueName,
    });

    return {
      queue: this.queueName,
      queueDepth,
      dlqDepth,
      counts,
      metricDefinitions: [
        {
          name: 'notification_send_success_total',
          type: 'counter',
          labels: ['channel', 'queue'],
        },
        {
          name: 'notification_send_failure_total',
          type: 'counter',
          labels: ['channel', 'queue', 'outcome'],
        },
        {
          name: 'notification_retry_attempt_total',
          type: 'counter',
          labels: ['channel', 'queue', 'attempt'],
        },
        {
          name: 'notification_dedupe_suppressed_total',
          type: 'counter',
          labels: ['channel', 'queue'],
        },
        { name: 'notification_queue_depth', type: 'gauge', labels: ['queue'] },
        { name: 'notification_dlq_depth', type: 'gauge', labels: ['queue'] },
      ],
      labels: {
        channel: [
          'email_comment_notification',
          'email_password_reset',
          'email_reaction',
          'email_welcome',
          'email_generic',
        ],
        queue: [this.queueName],
        outcome: ['transient', 'terminal'],
      },
      metrics: this.appLogger.getMetricsSnapshot(),
    };
  }

  async listDlqJobs(
    page = 1,
    limit = 20,
    filter?: DlqJobFilter,
  ): Promise<DlqListResult> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(limit, 100));

    const failedJobs = await this.queue.getJobs(['failed'], 0, -1, false);

    const filteredJobs = failedJobs.filter((job) => {
      const failedAt = job.finishedOn ? new Date(job.finishedOn) : null;
      const failedAfter = filter?.failedAfter
        ? new Date(filter.failedAfter)
        : null;
      const failedBefore = filter?.failedBefore
        ? new Date(filter.failedBefore)
        : null;
      const search = filter?.search?.toLowerCase()?.trim();
      const serializedPayload = JSON.stringify(job.data ?? {}).toLowerCase();
      const failedReason = (job.failedReason ?? '').toLowerCase();

      if (failedAfter && failedAt && failedAt < failedAfter) return false;
      if (failedBefore && failedAt && failedAt > failedBefore) return false;
      if (
        search &&
        !serializedPayload.includes(search) &&
        !failedReason.includes(search)
      )
        return false;

      return true;
    });

    const total = filteredJobs.length;
    const start = (safePage - 1) * safeLimit;
    const jobs = filteredJobs
      .slice(start, start + safeLimit)
      .map((job) => this.toDlqJobView(job));

    return { jobs, total, page: safePage, limit: safeLimit };
  }

  async replayDlqJob(
    jobId: string,
    actorId: string,
    reason?: string,
  ): Promise<{ id: string; status: 'replayed'; enqueuedAt: string }> {
    const job = await this.queue.getJob(jobId);
    if (!job) throw new Error(`DLQ job ${jobId} was not found`);

    await job.retry();
    await this.updateQueueDepthMetrics();

    await this.auditLogService.logNotificationDlqReplay(actorId, {
      replayType: 'single',
      queue: this.queueName,
      jobId: String(job.id),
      reason: reason || null,
      replayedAt: new Date().toISOString(),
    });

    this.appLogger.incrementCounter('notification_dlq_replay_total', 1, {
      queue: this.queueName,
      mode: 'single',
    });

    return {
      id: String(job.id),
      status: 'replayed',
      enqueuedAt: new Date().toISOString(),
    };
  }

  async replayDlqJobsBulk(
    actorId: string,
    options?: {
      limit?: number;
      failedAfter?: string;
      failedBefore?: string;
      search?: string;
      reason?: string;
    },
  ): Promise<ReplayResult> {
    const safeLimit = Math.max(1, Math.min(options?.limit ?? 20, 200));
    const { jobs } = await this.listDlqJobs(1, safeLimit, {
      failedAfter: options?.failedAfter,
      failedBefore: options?.failedBefore,
      search: options?.search,
    });

    const result: ReplayResult = {
      attempted: jobs.length,
      replayed: 0,
      failed: 0,
      details: [],
    };

    for (const job of jobs) {
      const queuedJob = await this.queue.getJob(job.id);

      if (!queuedJob) {
        result.failed += 1;
        result.details.push({
          id: job.id,
          status: 'failed',
          reason: 'Job not found',
        });
        continue;
      }

      try {
        await queuedJob.retry();
        result.replayed += 1;
        result.details.push({ id: job.id, status: 'replayed' });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown replay error';
        result.failed += 1;
        result.details.push({
          id: job.id,
          status: 'failed',
          reason: errorMessage,
        });
      }
    }

    await this.updateQueueDepthMetrics();

    await this.auditLogService.logNotificationDlqReplay(actorId, {
      replayType: 'bulk',
      queue: this.queueName,
      reason: options?.reason || null,
      filters: {
        limit: safeLimit,
        failedAfter: options?.failedAfter || null,
        failedBefore: options?.failedBefore || null,
        search: options?.search || null,
      },
      summary: {
        attempted: result.attempted,
        replayed: result.replayed,
        failed: result.failed,
      },
      replayedAt: new Date().toISOString(),
    });

    this.appLogger.incrementCounter(
      'notification_dlq_replay_total',
      result.replayed,
      {
        queue: this.queueName,
        mode: 'bulk',
      },
    );

    return result;
  }

  private toDlqJobView(job: Job<CommentNotificationPayload>): DlqJobView {
    return {
      id: String(job.id),
      name: job.name,
      attemptsMade: job.attemptsMade ?? 0,
      maxAttempts: job.opts.attempts ?? 1,
      failedReason: job.failedReason ?? null,
      failedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
      createdAt: job.timestamp ? new Date(job.timestamp).toISOString() : null,
      channel: this.getChannel(job.data as CommentNotificationPayload),
      recipientEmail: job.data?.recipientEmail,
    };
  }

  private async updateQueueDepthMetrics(): Promise<void> {
    const counts = await this.queue.getJobCounts(
      'waiting',
      'active',
      'delayed',
      'failed',
    );
    const queueDepth =
      (counts.waiting || 0) + (counts.active || 0) + (counts.delayed || 0);
    const dlqDepth = counts.failed || 0;

    this.appLogger.setGauge('notification_queue_depth', queueDepth, {
      queue: this.queueName,
    });
    this.appLogger.setGauge('notification_dlq_depth', dlqDepth, {
      queue: this.queueName,
    });
  }

  async onModuleDestroy() {
    await this.queue.close();
    await this.worker.close();
    await this.redisClient.quit();
    this.appLogger.log(
      'NotificationQueue shutdown complete',
      'NotificationQueue',
    );
  }
}
