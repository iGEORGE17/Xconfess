import { User } from '../../user/entities/user.entity';
import { AnonymousConfession } from '../../confession/entities/confession.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  emoji: string;

  @ManyToOne(() => AnonymousConfession, (confession) => confession.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'confession_id' })
  confession: AnonymousConfession;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
