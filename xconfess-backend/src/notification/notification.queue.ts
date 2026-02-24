import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { Comment } from '../comment/entities/comment.entity';
import { AppLogger } from '../logger/logger.service';
import { AuditLogService } from '../audit-log/audit-log.service';

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

@Injectable()
export class NotificationQueue implements OnModuleDestroy {
  private readonly queueName = 'comment-notifications';
  private readonly queue: Queue;
  private readonly worker: Worker;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly appLogger: AppLogger,
    private readonly auditLogService: AuditLogService,
  ) {
    this.initializeWorkers();
  }

  private initializeWorkers() {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
    };

    this.queue = new Queue(this.queueName, {
      connection: redisConfig,
    });

    this.worker = new Worker(
      this.queueName,
      async (job: Job<CommentNotificationPayload>) => {
        const channel = this.getChannel(job.data);
        const startedAt = Date.now();
        await this.processNotification(job.data);

        this.appLogger.observeTimer(
          'notification_job_processing_duration_ms',
          Date.now() - startedAt,
          { channel, queue: this.queueName },
        );
      },
      { connection: redisConfig },
    );

    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully`);
      this.appLogger.incrementCounter('notification_job_completed_total', 1, {
        channel: this.getChannel(job.data as CommentNotificationPayload),
        queue: this.queueName,
      });
      this.updateQueueDepthMetrics().catch(() => undefined);
    });

    this.worker.on('failed', (job, error) => {
      console.error(`Job ${job?.id} failed:`, error);

      if (!job) {
        return;
      }

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
          attempt: attemptsMade,
        });
      }

      this.updateQueueDepthMetrics().catch(() => undefined);
    });

    // Store queues and workers for cleanup
    (this as any).commentQueue = commentQueue;
    (this as any).commentWorker = commentWorker;
  }

  /**
   * Enqueue a comment notification for processing.
   * 
   * @param payload - Contains confession, comment, and recipient user ID
   */
  async enqueueCommentNotification(payload: CommentNotificationPayload): Promise<void> {
    const channel = this.getChannel(payload);
    this.appLogger.incrementCounter('notification_enqueued_total', 1, {
      channel,
      queue: this.queueName,
    });

    await this.queue.add('comment-notification', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });

    await this.updateQueueDepthMetrics();
  }

  /**
   * Process a comment notification.
   * Resolves recipient email and sends notification if available.
   */
  private async processCommentNotification(payload: CommentNotificationPayload): Promise<void> {
    const { confession, comment, recipientUserId } = payload;
    
    const logContext = {
      service: 'NotificationQueue',
      action: 'processCommentNotification',
      confessionId: confession?.id,
      commentId: comment?.id,
      recipientUserId,
      timestamp: new Date().toISOString(),
    };

    this.logger.debug('Processing comment notification', logContext);

    // Resolve recipient email using the centralized helper
    const recipient = await this.recipientResolver.resolveRecipient(recipientUserId);

    // Handle missing recipient gracefully
    if (!recipient.canNotify) {
      this.logger.warn(`Skipping comment notification: ${recipient.reason}`, {
        ...logContext,
        reason: recipient.reason,
        userId: recipientUserId,
      });
      // Non-fatal - don't throw error, just skip
      return;
    }

    // Create an anonymized preview of the comment
    const commentPreview = this.createAnonymizedPreview(comment.content);

    // Send email notification
    try {
      await this.emailService.sendCommentNotification({
        to: recipient.email!,
        confessionId: confession.id,
        commentPreview,
      });

      this.logger.log(`Comment notification sent to user ${recipientUserId}`, {
        ...logContext,
        email: this.maskEmail(recipient.email!),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send comment notification: ${errorMessage}`, {
        ...logContext,
        error: errorMessage,
      });
      // Re-throw to trigger BullMQ retry mechanism
      throw error;
    }
  }

  private getChannel(payload: CommentNotificationPayload): string {
    return payload.channel || 'email_comment_notification';
  }

  private createAnonymizedPreview(content: string): string {
    const maxLength = 100;
    const preview = content.length > maxLength
      ? `${content.substring(0, maxLength)}...`
      : content;

    return preview;
  }

  async getDiagnostics() {
    const [counts, failedCount] = await Promise.all([
      this.queue.getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed'),
      this.queue.getFailedCount(),
    ]);

    const queueDepth = (counts.waiting || 0) + (counts.active || 0) + (counts.delayed || 0);
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
          name: 'notification_queue_depth',
          type: 'gauge',
          labels: ['queue'],
        },
        {
          name: 'notification_dlq_depth',
          type: 'gauge',
          labels: ['queue'],
        },
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

  async listDlqJobs(page = 1, limit = 20, filter?: DlqJobFilter): Promise<DlqListResult> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(limit, 100));

    const failedJobs = await this.queue.getJobs(['failed'], 0, -1, false);
    const filteredJobs = failedJobs.filter((job) => {
      const failedAt = job.finishedOn ? new Date(job.finishedOn) : null;
      const failedAfter = filter?.failedAfter ? new Date(filter.failedAfter) : null;
      const failedBefore = filter?.failedBefore ? new Date(filter.failedBefore) : null;
      const search = filter?.search?.toLowerCase()?.trim();
      const serializedPayload = JSON.stringify(job.data ?? {}).toLowerCase();
      const failedReason = (job.failedReason ?? '').toLowerCase();

      if (failedAfter && failedAt && failedAt < failedAfter) {
        return false;
      }

      if (failedBefore && failedAt && failedAt > failedBefore) {
        return false;
      }

      if (search && !serializedPayload.includes(search) && !failedReason.includes(search)) {
        return false;
      }

      return true;
    });

    const total = filteredJobs.length;
    const start = (safePage - 1) * safeLimit;
    const jobs = filteredJobs.slice(start, start + safeLimit).map((job) => this.toDlqJobView(job));

    return { jobs, total, page: safePage, limit: safeLimit };
  }

  async replayDlqJob(
    jobId: string,
    actorId: string,
    reason?: string,
  ): Promise<{ id: string; status: 'replayed'; enqueuedAt: string }> {
    const job = await this.queue.getJob(jobId);

    if (!job) {
      throw new Error(`DLQ job ${jobId} was not found`);
    }

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
        result.details.push({ id: job.id, status: 'failed', reason: 'Job not found' });
        continue;
      }

      try {
        await queuedJob.retry();
        result.replayed += 1;
        result.details.push({ id: job.id, status: 'replayed' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown replay error';
        result.failed += 1;
        result.details.push({ id: job.id, status: 'failed', reason: errorMessage });
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

    this.appLogger.incrementCounter('notification_dlq_replay_total', result.replayed, {
      queue: this.queueName,
      mode: 'bulk',
    });

    return result;
  }

  private toDlqJobView(job: Job<CommentNotificationPayload>): DlqJobView {
    const channel = this.getChannel(job.data as CommentNotificationPayload);

    return {
      id: String(job.id),
      name: job.name,
      attemptsMade: job.attemptsMade ?? 0,
      maxAttempts: job.opts.attempts ?? 1,
      failedReason: job.failedReason ?? null,
      failedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
      createdAt: job.timestamp ? new Date(job.timestamp).toISOString() : null,
      channel,
      recipientEmail: job.data?.recipientEmail,
    };
  }

  private async updateQueueDepthMetrics(): Promise<void> {
    const counts = await this.queue.getJobCounts('waiting', 'active', 'delayed', 'failed');
    const queueDepth = (counts.waiting || 0) + (counts.active || 0) + (counts.delayed || 0);
    const dlqDepth = counts.failed || 0;

    this.appLogger.setGauge('notification_queue_depth', queueDepth, {
      queue: this.queueName,
    });
    this.appLogger.setGauge('notification_dlq_depth', dlqDepth, {
      queue: this.queueName,
    });
  }

  async onModuleDestroy() {
    const commentQueue = (this as any).commentQueue as Queue;
    const commentWorker = (this as any).commentWorker as Worker;
    
    if (commentQueue) await commentQueue.close();
    if (commentWorker) await commentWorker.close();
    
    this.logger.log('NotificationQueue shutdown complete');
  }
}
