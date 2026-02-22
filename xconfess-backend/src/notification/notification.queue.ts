import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { Comment } from '../comment/entities/comment.entity';
import { RecipientResolver, NotificationRecipient } from './recipient-resolver.service';

export interface CommentNotificationPayload {
  confession: AnonymousConfession;
  comment: Comment;
  /** User ID to resolve email from (replaces direct recipientEmail) */
  recipientUserId: number;
}

export interface ReactionNotificationPayload {
  confession: AnonymousConfession;
  reactorId: number;
  emoji: string;
  /** User ID to resolve email from */
  recipientUserId: number;
}

@Injectable()
export class NotificationQueue {
  private readonly logger = new Logger(NotificationQueue.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly recipientResolver: RecipientResolver,
  ) {
    this.initializeWorkers();
  }

  private initializeWorkers() {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
    };

    // Comment notification worker
    const commentQueue = new Queue('comment-notifications', {
      connection: redisConfig,
    });

    const commentWorker = new Worker(
      'comment-notifications',
      async (job: Job<CommentNotificationPayload>) => {
        await this.processCommentNotification(job.data);
      },
      { connection: redisConfig },
    );

    commentWorker.on('completed', (job) => {
      this.logger.debug(`Comment notification job ${job.id} completed successfully`);
    });

    commentWorker.on('failed', (job, error) => {
      this.logger.error(`Comment notification job ${job?.id} failed:`, {
        jobId: job?.id,
        error: error.message,
        stack: error.stack,
      });
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
    const logContext = {
      service: 'NotificationQueue',
      action: 'enqueueCommentNotification',
      confessionId: payload.confession?.id,
      recipientUserId: payload.recipientUserId,
      timestamp: new Date().toISOString(),
    };

    this.logger.debug('Enqueueing comment notification', logContext);

    const queue = (this as any).commentQueue as Queue;
    await queue.add('comment-notification', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
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

  /**
   * Create an anonymized preview of comment content.
   */
  private createAnonymizedPreview(content: string): string {
    const maxLength = 100;
    const preview = content.length > maxLength
      ? `${content.substring(0, maxLength)}...`
      : content;

    return preview;
  }

  /**
   * Mask email for logging.
   */
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!domain) {
      return '***';
    }
    
    const maskedLocal = localPart.length > 3 
      ? `${localPart.substring(0, 3)}***` 
      : '***';
    
    return `${maskedLocal}@${domain}`;
  }

  async onModuleDestroy() {
    const commentQueue = (this as any).commentQueue as Queue;
    const commentWorker = (this as any).commentWorker as Worker;
    
    if (commentQueue) await commentQueue.close();
    if (commentWorker) await commentWorker.close();
    
    this.logger.log('NotificationQueue shutdown complete');
  }
}
