import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
@Unique(['username'])
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  resetPasswordToken: string | null;

  @Column({ nullable: true })
  resetPasswordExpires: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}