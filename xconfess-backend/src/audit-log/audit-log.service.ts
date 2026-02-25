import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditActionType } from './audit-log.entity';

export interface AuditLogContext {
  userId?: string | null;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface CreateAuditLogDto {
  actionType: AuditActionType;
  metadata?: Record<string, any>;
  context?: AuditLogContext;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) { }

  /**
   * Log a sensitive action to the audit log
   * Includes error handling to prevent logging failures from breaking the application
   */
  async log(dto: CreateAuditLogDto): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        userId: dto.context?.userId || null,
        actionType: dto.actionType,
        metadata: {
          ...(dto.metadata || {}),
          ...(dto.context?.requestId
            ? { requestId: dto.context.requestId }
            : {}),
          ...(dto.metadata?.templateKey && dto.metadata?.templateVersion
            ? { templateKey: dto.metadata.templateKey, templateVersion: dto.metadata.templateVersion }
            : {}),
        },
        ipAddress: dto.context?.ipAddress || null,
        userAgent: dto.context?.userAgent || null,
      });

      await this.auditLogRepository.save(auditLog);

      this.logger.log(
        `Audit log created: ${dto.actionType} by user ${dto.context?.userId || 'anonymous'}`,
      );
    } catch (error) {
      // Log the error but don't throw to prevent disrupting the main operation
      this.logger.error(
        `Failed to create audit log for action ${dto.actionType}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Log confession deletion
   */
  async logConfessionDelete(
    confessionId: string,
    userId: string,
    context?: AuditLogContext,
  ): Promise<void> {
    await this.log({
      actionType: AuditActionType.CONFESSION_DELETE,
      metadata: {
        confessionId,
        entityType: 'confession',
        entityId: confessionId,
        deletedAt: new Date().toISOString(),
      },
      context: { ...context, userId },
    });
  }

  /**
   * Log comment deletion
   */
  async logCommentDelete(
    commentId: string,
    confessionId: string,
    userId: string,
    context?: AuditLogContext,
  ): Promise<void> {
    await this.log({
      actionType: AuditActionType.COMMENT_DELETE,
      metadata: {
        commentId,
        confessionId,
        entityType: 'comment',
        entityId: commentId,
        deletedAt: new Date().toISOString(),
      },
      context: { ...context, userId },
    });
  }

  /**
   * Log failed login attempt
   */
  async logFailedLogin(
    identifier: string,
    reason: string,
    context?: AuditLogContext,
  ): Promise<void> {
    await this.log({
      actionType: AuditActionType.FAILED_LOGIN,
      metadata: {
        identifier,
        reason,
        attemptedAt: new Date().toISOString(),
      },
      context,
    });
  }

  /**
   * Log report creation
   */
  async logReport(
    reportId: string,
    targetType: 'confession' | 'comment',
    targetId: string,
    reporterId: string,
    reason: string,
    context?: AuditLogContext,
  ): Promise<void> {
    await this.log({
      actionType: AuditActionType.REPORT_CREATED,
      metadata: {
        reportId,
        targetType,
        targetId,
        entityType: targetType,
        entityId: targetId,
        reason,
        reportedAt: new Date().toISOString(),
      },
      context: { ...context, userId: reporterId },
    });
  }

  /**
   * Log report resolution
   */
  async logReportResolved(
    reportId: string,
    adminId: string,
    metadata: {
      previousStatus?: string;
      reason?: string;
      confessionId?: string;
      resolvedBy?: string;
    },
    context?: AuditLogContext,
  ): Promise<void> {
    await this.log({
      actionType: AuditActionType.REPORT_RESOLVED,
      metadata: {
        reportId,
        entityType: 'report',
        entityId: reportId,
        ...metadata,
        resolvedAt: new Date().toISOString(),
      },
      context: { ...context, userId: adminId },
    });
  }

  /**
   * Log report dismissal
   */
  async logReportDismissed(
    reportId: string,
    adminId: string,
    metadata: {
      previousStatus?: string;
      reason?: string;
      confessionId?: string;
      dismissedBy?: string;
    },
    context?: AuditLogContext,
  ): Promise<void> {
    await this.log({
      actionType: AuditActionType.REPORT_DISMISSED,
      metadata: {
        reportId,
        entityType: 'report',
        entityId: reportId,
        ...metadata,
        dismissedAt: new Date().toISOString(),
      },
      context: { ...context, userId: adminId },
    });
  }

  /**
   * Log notification DLQ replay actions performed by operators/admins.
   */
  async logNotificationDlqReplay(
    adminId: string,
    metadata: {
      replayType: 'single' | 'bulk';
      queue: string;
      jobId?: string;
      filters?: Record<string, any>;
      summary?: {
        attempted: number;
        replayed: number;
        failed: number;
      };
      reason?: string | null;
      replayedAt?: string;
    },
    context?: AuditLogContext,
  ): Promise<void> {
    await this.log({
      actionType: AuditActionType.NOTIFICATION_DLQ_REPLAY,
      metadata: {
        entityType: 'notification_dlq',
        ...metadata,
        replayedAt: metadata.replayedAt || new Date().toISOString(),
      },
      context: { ...context, userId: adminId },
    });
  }

  /**
   * Log template state transition
   */
  async logTemplateStateTransition(
    templateKey: string,
    version: string,
    from: string,
    to: string,
    adminId: string,
    reason?: string,
    context?: AuditLogContext,
  ): Promise<void> {
    await this.log({
      actionType: AuditActionType.TEMPLATE_STATE_TRANSITION,
      metadata: {
        templateKey,
        templateVersion: version,
        from,
        to,
        reason,
        entityType: 'template_version',
        entityId: `${templateKey}:${version}`,
        transitionedAt: new Date().toISOString(),
      },
      context: { ...context, userId: adminId },
    });
  }

  /**
   * Log template killswitch toggle
   */
  async logTemplateKillswitchToggle(
    adminId: string,
    enabled: boolean,
    templateKey?: string,
    reason?: string,
    context?: AuditLogContext,
  ): Promise<void> {
    await this.log({
      actionType: AuditActionType.TEMPLATE_ROLLOUT_KILLSWITCH,
      metadata: {
        enabled,
        templateKey: templateKey || 'global',
        reason,
        entityType: 'template_config',
        entityId: templateKey || 'global',
        toggledAt: new Date().toISOString(),
      },
      context: { ...context, userId: adminId },
    });
  }

  /**
   * Log template fallback activation
   */
  async logTemplateFallbackActivated(
    templateKey: string,
    failedVersion: string,
    fallbackVersion: string,
    reason: string,
    context?: AuditLogContext,
  ): Promise<void> {
    await this.log({
      actionType: AuditActionType.TEMPLATE_FALLBACK_ACTIVATED,
      metadata: {
        templateKey,
        failedVersion,
        fallbackVersion,
        reason,
        entityType: 'template_version',
        entityId: `${templateKey}:${failedVersion}`,
        activatedAt: new Date().toISOString(),
      },
      context,
    });
  }

  /**
   * Find audit logs by entity (backward compatible with the requested feature)
   */
  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    try {
      // Since we store entity info in metadata, we need to query the JSONB field
      const logs = await this.auditLogRepository
        .createQueryBuilder('audit_log')
        .leftJoinAndSelect('audit_log.user', 'user')
        .where("audit_log.metadata->>'entityType' = :entityType", { entityType })
        .andWhere("audit_log.metadata->>'entityId' = :entityId", { entityId })
        .orderBy('audit_log.timestamp', 'DESC')
        .getMany();

      return logs;
    } catch (error) {
      this.logger.error(`Failed to find audit logs by entity: ${error.message}`);
      return [];
    }
  }

  /**
   * Find audit logs by user
   */
  async findByUser(userId: string): Promise<AuditLog[]> {
    try {
      return this.auditLogRepository.find({
        where: { userId },
        order: { timestamp: 'DESC' },
        relations: ['user'],
      });
    } catch (error) {
      this.logger.error(`Failed to find audit logs by user: ${error.message}`);
      return [];
    }
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async findAll(options: {
    userId?: string;
    actionType?: AuditActionType;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    try {
      const query = this.auditLogRepository.createQueryBuilder('audit_log')
        .leftJoinAndSelect('audit_log.user', 'user');

      if (options.userId) {
        query.andWhere('audit_log.user_id = :userId', {
          userId: options.userId,
        });
      }

      if (options.actionType) {
        query.andWhere('audit_log.action_type = :actionType', {
          actionType: options.actionType,
        });
      }

      if (options.entityType) {
        query.andWhere("audit_log.metadata->>'entityType' = :entityType", {
          entityType: options.entityType,
        });
      }

      if (options.entityId) {
        query.andWhere("audit_log.metadata->>'entityId' = :entityId", {
          entityId: options.entityId,
        });
      }

      if (options.startDate) {
        query.andWhere('audit_log.timestamp >= :startDate', {
          startDate: options.startDate,
        });
      }

      if (options.endDate) {
        query.andWhere('audit_log.timestamp <= :endDate', {
          endDate: options.endDate,
        });
      }

      query.orderBy('audit_log.timestamp', 'DESC');
      query.limit(options.limit || 100);
      query.offset(options.offset || 0);

      const [logs, total] = await query.getManyAndCount();

      return {
        logs,
        total,
        limit: options.limit || 100,
        offset: options.offset || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get audit logs: ${error.message}`);
      return {
        logs: [],
        total: 0,
        limit: options.limit || 100,
        offset: options.offset || 0,
      };
    }
  }

  /**
   * Get audit log statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date) {
    try {
      // Create a base query for counting total logs
      const countQuery = this.auditLogRepository.createQueryBuilder('audit_log');

      if (startDate) {
        countQuery.andWhere('audit_log.timestamp >= :startDate', { startDate });
      }

      if (endDate) {
        countQuery.andWhere('audit_log.timestamp <= :endDate', { endDate });
      }

      // Get total count before modifying the query for group by
      const totalLogs = await countQuery.getCount();

      // Create a separate query for action type counts (with group by)
      const statsQuery = this.auditLogRepository.createQueryBuilder('audit_log');

      if (startDate) {
        statsQuery.andWhere('audit_log.timestamp >= :startDate', { startDate });
      }

      if (endDate) {
        statsQuery.andWhere('audit_log.timestamp <= :endDate', { endDate });
      }

      const actionTypeCounts = await statsQuery
        .select('audit_log.action_type', 'actionType')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit_log.action_type')
        .getRawMany();

      return {
        totalLogs,
        actionTypeCounts,
      };
    } catch (error) {
      this.logger.error(`Failed to get audit log statistics: ${error.message}`);
      return {
        totalLogs: 0,
        actionTypeCounts: [],
      };
    }
  }
}

