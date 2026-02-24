import { Module } from '@nestjs/common';
import { NotificationQueue } from './notification.queue';
import { EmailModule } from '../email/email.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { NotificationAdminController } from './notification.admin.controller';

@Module({
  imports: [EmailModule, AuditLogModule],
  controllers: [NotificationAdminController],
  providers: [NotificationQueue],
  exports: [NotificationQueue],
})
export class NotificationModule {} 
