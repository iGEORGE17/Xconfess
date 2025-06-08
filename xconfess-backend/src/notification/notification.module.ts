import { Module } from '@nestjs/common';
import { NotificationQueue } from './notification.queue';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  providers: [NotificationQueue],
  exports: [NotificationQueue],
})
export class NotificationModule {} 