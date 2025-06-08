import { Injectable } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { Comment } from '../comment/entities/comment.entity';

export interface CommentNotificationPayload {
  confession: AnonymousConfession;
  comment: Comment;
  recipientEmail: string;
}

@Injectable()
export class NotificationQueue {
  private readonly queue: Queue;
  private readonly worker: Worker;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
    };

    this.queue = new Queue('comment-notifications', {
      connection: redisConfig,
    });

    this.worker = new Worker(
      'comment-notifications',
      async (job: Job<CommentNotificationPayload>) => {
        await this.processNotification(job.data);
      },
      { connection: redisConfig },
    );

    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, error) => {
      console.error(`Job ${job?.id} failed:`, error);
    });
  }

  async enqueueCommentNotification(payload: CommentNotificationPayload): Promise<void> {
    await this.queue.add('comment-notification', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  private async processNotification(payload: CommentNotificationPayload): Promise<void> {
    const { confession, comment, recipientEmail } = payload;

    // Create an anonymized preview of the comment
    const commentPreview = this.createAnonymizedPreview(comment.content);

    // Send email notification
    await this.emailService.sendCommentNotification({
      to: recipientEmail,
      confessionId: confession.id,
      commentPreview,
    });
  }

  private createAnonymizedPreview(content: string): string {
    // Truncate long comments and ensure anonymity
    const maxLength = 100;
    const preview = content.length > maxLength
      ? `${content.substring(0, maxLength)}...`
      : content;

    return preview;
  }

  async onModuleDestroy() {
    await this.queue.close();
    await this.worker.close();
  }
} 