import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AnonymousConfession } from '../../confession/entities/confession.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  sender: User;

  @ManyToOne(() => AnonymousConfession, { nullable: false })
  confession: AnonymousConfession;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  hasReply: boolean;

  @Column({ type: 'text', nullable: true })
  replyContent: string | null;

  @Column({ type: 'timestamp', nullable: true })
  repliedAt: Date | null;
}
