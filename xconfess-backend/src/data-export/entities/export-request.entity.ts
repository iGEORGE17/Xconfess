// src/data-export/entities/export-request.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('export_requests')
export class ExportRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ default: 'PENDING' })
  status: string;

  // Storing the actual ZIP file in the DB
  @Column({ type: 'byte', nullable: true, select: false }) 
  fileData: Buffer; 

  @CreateDateColumn()
  createdAt: Date;
}