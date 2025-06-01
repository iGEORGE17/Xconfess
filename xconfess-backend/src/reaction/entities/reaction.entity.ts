import { AnonymousConfession } from 'src/confession/entities/confession.entity';
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

  @CreateDateColumn()
  createdAt: Date;
}
