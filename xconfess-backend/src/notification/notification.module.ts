import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationQueue } from './notification.queue';
import { RecipientResolver } from './recipient-resolver.service';
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
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    EmailModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    NotificationQueue,
    RecipientResolver,
  ],
  exports: [
    NotificationQueue,
    RecipientResolver,
  ],
})
export class NotificationModule {}
