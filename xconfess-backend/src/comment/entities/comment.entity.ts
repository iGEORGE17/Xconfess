import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { AnonymousUser } from '../../user/entities/anonymous-user.entity';
import { AnonymousConfession } from '../../confession/entities/confession.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => AnonymousUser, anonymousUser => anonymousUser.comments)
  @JoinColumn({ name: 'anonymous_user_id' })
  anonymousUser: AnonymousUser;

  @ManyToOne(() => AnonymousConfession, c => c.comments)
  @JoinColumn({ name: 'confessionId' })
  confession: AnonymousConfession;

  @Column({ nullable: true })
  anonymousContextId?: string;

  @Column({ default: false })
  isDeleted: boolean;
}
