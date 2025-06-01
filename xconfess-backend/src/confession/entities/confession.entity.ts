import { Reaction } from 'src/reaction/entities/reaction.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class AnonymousConfession {
  @PrimaryGeneratedColumn('uuid')
  id: string;  

  @Column('text')
  message: string;

  @OneToMany(() => Reaction, (reaction) => reaction.confession)
  reactions: Reaction[];


  @CreateDateColumn()
  created_at: Date;
}
