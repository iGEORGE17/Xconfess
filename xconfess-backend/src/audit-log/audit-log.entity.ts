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
  // Existing actions

  // New report moderation actions
  REPORT_RESOLVED = 'report_resolved',
  REPORT_DISMISSED = 'report_dismissed',
  NOTIFICATION_DLQ_REPLAY = 'notification_dlq_replay',
  NOTIFICATION_DLQ_CLEANUP = 'notification_dlq_cleanup',
  MODERATION_ESCALATION = 'moderation_escalation',
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

  // Optional: Add helper methods or computed fields if needed
  get entityId(): string | undefined {
    return this.metadata?.entityId || this.metadata?.reportId;
  }

  get entityType(): string | undefined {
    return this.metadata?.entityType;
  }
}
