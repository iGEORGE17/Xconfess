import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  OutboxEvent,
  OutboxStatus,
} from '../../common/entities/outbox-event.entity';
import { NotificationService } from './notification.service';

@Injectable()
export class OutboxDispatcherService {
  private readonly logger = new Logger(OutboxDispatcherService.name);
  private isProcessing = false;

  constructor(
    @InjectRepository(OutboxEvent)
    private readonly outboxRepo: Repository<OutboxEvent>,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleOutbox() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      await this.processEvents();
    } catch (error) {
      this.logger.error(`Error processing outbox: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processEvents() {
    const events = await this.outboxRepo.find({
      where: [
        { status: OutboxStatus.PENDING },
        { status: OutboxStatus.FAILED, retryCount: LessThan(5) },
      ],
      order: { createdAt: 'ASC' },
      take: 50,
    });

    if (events.length === 0) return;

    this.logger.log(`Processing ${events.length} outbox events`);

    for (const event of events) {
      await this.processEvent(event);
    }
  }

  private async processEvent(event: OutboxEvent) {
    try {
      // Set to processing
      event.status = OutboxStatus.PROCESSING;
      await this.outboxRepo.save(event);

      // Dispatch based on type
      switch (event.type) {
        case 'comment_notification':
        case 'message_notification':
        case 'reply_notification':
        case 'reaction_notification':
        case 'reaction_update':
        case 'report_notification':
          await this.notificationService.enqueueNotification(event.type, event.payload);
          break;
        default:
          this.logger.warn(`Unknown outbox event type: ${event.type}`);
          event.status = OutboxStatus.COMPLETED;
          event.processedAt = new Date();
          await this.outboxRepo.save(event);
          return;
      }

      // Mark as completed
      event.status = OutboxStatus.COMPLETED;
      event.processedAt = new Date();
      await this.outboxRepo.save(event);
    } catch (error) {
      this.logger.error(
        `Failed to dispatch event ${event.id}: ${error.message}`,
      );
      event.status = OutboxStatus.FAILED;
      event.retryCount += 1;
      event.lastError = error.message;
      await this.outboxRepo.save(event);
    }
  }
}
