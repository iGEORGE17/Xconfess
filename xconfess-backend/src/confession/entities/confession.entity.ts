import { Reaction } from 'src/reaction/entities/reaction.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from 'typeorm';

/**
 * Entity representing an anonymous confession in the system.
 * Each confession is stored with a unique identifier and timestamp.
 */
@Entity('anonymous_confessions')
export class AnonymousConfession {
  /**
   * Unique identifier for the confession.
   * Generated automatically using UUID v4.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The content of the confession.
   * Stored as text to allow for longer messages.
   */
  @Column('text')
  @Index()
  message: string;

  /**
   * Associated reactions to this confession.
   * One confession can have multiple reactions.
   */
  @OneToMany(() => Reaction, (reaction) => reaction.confession)
  reactions: Reaction[];

  /**
   * Timestamp when the confession was created.
   * Automatically set when the confession is created.
   */
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
