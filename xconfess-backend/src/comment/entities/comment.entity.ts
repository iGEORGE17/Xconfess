import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, ManyToOne, JoinColumn
} from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { AnonymousConfession } from '../../confession/entities/confession.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => AnonymousConfession, c => c.comments)
  @JoinColumn({ name: 'confessionId' })
  confession: AnonymousConfession;

  @Column({ nullable: true })
  anonymousContextId?: string;

  @Column({ default: false })
  isDeleted: boolean;
}
