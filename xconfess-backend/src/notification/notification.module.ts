import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationQueue } from './notification.queue';
import { EmailModule } from '../email/email.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { LoggerModule } from '../logger/logger.module';
import { NotificationAdminController } from './notification.admin.controller';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    EmailModule,
    AuditLogModule,
    LoggerModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [NotificationAdminController],
  providers: [NotificationQueue],
  exports: [NotificationQueue],
})
export class NotificationModule {}
