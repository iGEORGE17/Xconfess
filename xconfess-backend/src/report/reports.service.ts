import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async createReport(
    confessionId: number,
    reporterId: number | null,
    dto: CreateReportDto,
  ): Promise<Report> {
    const since = new Date();
    since.setHours(since.getHours() - 24);

    const existingReport = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.confessionId = :confessionId', { confessionId })
      .andWhere('report.reporterId = :reporterId', { reporterId })
      .andWhere('report.createdAt > :since', { since })
      .getOne();

    if (existingReport) {
      throw new BadRequestException(
        'You have already reported this confession within the last 24 hours.',
      );
    }

    const report = this.reportRepository.create({
      confessionId,
      reporterId: reporterId ?? undefined,
      reason: dto.reason,
      details: dto.details,
    });

    return this.reportRepository.save(report);
  }
}
