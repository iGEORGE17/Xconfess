import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AnonymousConfession } from '../../confession/entities/confession.entity';

@Entity()
@Unique(['username'])
@Unique(['emailHash'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  // Encrypted email fields
  @Column({ name: 'email_encrypted', type: 'text' })
  emailEncrypted: string;

  @Column({ name: 'email_iv', type: 'varchar', length: 32 })
  emailIv: string;

  @Column({ name: 'email_tag', type: 'varchar', length: 32 })
  emailTag: string;

  // Searchable hash
  @Column({ name: 'email_hash', type: 'varchar', length: 64, unique: true })
  emailHash: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  resetPasswordToken: string | null;

  @Column({ nullable: true })
  resetPasswordExpires: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Confessions created by this user
   */
  @OneToMany(() => AnonymousConfession, confession => confession.user)
  confessions: AnonymousConfession[];
}