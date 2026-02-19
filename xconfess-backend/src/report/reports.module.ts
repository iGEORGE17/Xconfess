import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { Report } from '../admin/entities/report.entity'; // Using admin Report entity
import { ReportsController } from './reports.controller';
import { AdminReportsController } from './admin-reports.controller';
import { AnonymousConfession } from '../confession/entities/confession.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, AnonymousConfession])],
  providers: [ReportsService],
  controllers: [ReportsController, AdminReportsController],
  exports: [ReportsService],
})
export class ReportModule {}
