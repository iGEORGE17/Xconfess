// src/moderation/moderation.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiModerationService } from './ai-moderation.service';
import { ModerationRepositoryService } from './moderation-repository.service';
import { ModerationController } from './moderation.controller';
import { ModerationEventsListener } from './moderation-events.listener';
import { NotificationService } from '../notifications/services/notification.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { User } from '../user/entities/user.entity';
import { ModerationLog } from './entities/moderation-log.entity';
import { AnonymousConfession } from '../confession/entities/confession.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModerationLog, AnonymousConfession, User]),
    ConfigModule,
  ],
  controllers: [ModerationController],
  providers: [
    AiModerationService,
    ModerationRepositoryService,
    ModerationEventsListener,
    NotificationService,
    AuditLogService,
  ],
  exports: [AiModerationService, ModerationRepositoryService],
})
export class ModerationModule {}
