import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/entities/user.entity';

export enum AuditActionType {
  // Existing moderation actions
  REPORT_RESOLVED = 'report_resolved',
  REPORT_DISMISSED = 'report_dismissed',
  REPORT_CREATED = 'report_created',
  COMMENT_DELETED = 'comment_deleted',
  CONFESSION_DELETED = 'confession_deleted',
  NOTIFICATION_SUPPRESSED = 'notification_suppressed',
  FAILED_LOGIN = 'failed_login',
  NOTIFICATION_DLQ_REPLAY = 'notification_dlq_replay',
  NOTIFICATION_DLQ_CLEANUP = 'notification_dlq_cleanup',
  MODERATION_ESCALATION = 'moderation_escalation',

  // ✅ Email template rollout actions
  EMAIL_TEMPLATE_DELIVERED = 'email_template_delivered',
  EMAIL_TEMPLATE_FAILED = 'email_template_failed',
  EMAIL_TEMPLATE_PROMOTED = 'email_template_promoted',
  EMAIL_TEMPLATE_ROLLED_BACK = 'email_template_rolled_back',
}

@Entity('audit_logs')
@Index(['userId', 'timestamp'])
@Index(['actionType', 'timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: AuditActionType,
    name: 'action_type',
  })
  actionType: AuditActionType;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  timestamp: Date;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  // Optional helpers
  get entityId(): string | undefined {
    return this.metadata?.entityId || this.metadata?.reportId;
  }

  get entityType(): string | undefined {
    return this.metadata?.entityType;
  }
}
