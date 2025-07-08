// src/confession/entities/confession.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reaction } from '../../reaction/entities/reaction.entity';
import { User } from '../../user/entities/user.entity';
import { Gender } from '../dto/get-confessions.dto';

/**
 * Entity representing an anonymous confession.
 */
@Entity('anonymous_confessions')
export class AnonymousConfession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  @Index()
  message: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @OneToMany(() => Reaction, (reaction) => reaction.confession)
  reactions: Reaction[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.confessions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ default: false })
  isDeleted: boolean;

  get content(): string {
    return this.message;
  }
}
