import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from '../admin/entities/report.entity';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { ReportController } from './report.controller';
import { ReportsService } from './reports.service'; 
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, AnonymousConfession]),
    AuditLogModule, 
  ],
  controllers: [ReportController],
  providers: [ReportsService], 
  exports: [ReportsService], 
})
export class ReportModule {}
