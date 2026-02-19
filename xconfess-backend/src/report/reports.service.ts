import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Report } from '../admin/entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import {AnonymousConfession } from '../confession/entities/confession.entity';
import { GetReportsQueryDto } from './dto/get-reports-query.dto';
import { PaginatedReportsResponseDto } from './dto/get-reports-response.dto';
import { ReportStatus, ReportType } from '../admin/entities/report.entity';


@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(AnonymousConfession)
    private readonly confessionRepository: Repository<AnonymousConfession>,
  ) {}

  async createReport(
    confessionId: string,
    reporterId: number | null,
    dto: CreateReportDto,
  ): Promise<Report> {
   const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.reportRepository.manager.transaction(async (manager) => {
      // 1️⃣ Ensure confession exists
      const confession = await manager
        .getRepository(AnonymousConfession)
        .findOne({ where: { id: confessionId } });

      if (!confession) {
        throw new NotFoundException('Confession not found');
      }

      // 2️⃣ Duplicate check (handle NULL reporterId explicitly)
      const qb = manager
        .getRepository(Report)
        .createQueryBuilder('report')
        .where('report.confessionId = :confessionId', { confessionId })
        .andWhere('report.created_at > :since', { since });

      if (reporterId === null) {
        qb.andWhere('report.reporterId IS NULL');
      } else {
        qb.andWhere('report.reporterId = :reporterId', { reporterId });
      }

      const existingReport = await qb.getOne();

      if (existingReport) {
        throw new BadRequestException(
          'You have already reported this confession within the last 24 hours.',
        );
      }

      // 3️⃣ Save report atomically
      const report = manager.getRepository(Report).create({
        confessionId,
        reporterId: reporterId ?? undefined,
        type: dto.type, // Using type instead of reason for admin entity
        reason: dto.reason,
      });

      return manager.getRepository(Report).save(report);
    });
  }

  async getReportsWithFilters(query: GetReportsQueryDto): Promise<PaginatedReportsResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    // Build query with filters
    const queryBuilder = this.reportRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.confession', 'confession')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('report.resolver', 'resolver');

    // Apply status filter
    if (query.status) {
      queryBuilder.andWhere('report.status = :status', { status: query.status });
    }

    // Apply reason (type) filter
    if (query.reason) {
      queryBuilder.andWhere('report.type = :reason', { reason: query.reason });
    }

    // Apply date range filter
    if (query.startDate && query.endDate) {
      queryBuilder.andWhere('report.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(query.startDate),
        endDate: new Date(query.endDate),
      });
    } else if (query.startDate) {
      queryBuilder.andWhere('report.createdAt >= :startDate', { startDate: new Date(query.startDate) });
    } else if (query.endDate) {
      queryBuilder.andWhere('report.createdAt <= :endDate', { endDate: new Date(query.endDate) });
    }

    // Apply sorting
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';
    queryBuilder.orderBy(`report.${sortBy}`, sortOrder);

    // Get total count for pagination metadata
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const reports = await queryBuilder.getMany();

    // Map to response DTO structure
    const mappedReports = reports.map(report => ({
      id: report.id,
      confessionId: report.confessionId,
      reporterId: report.reporterId,
      type: report.type,
      reason: report.reason,
      status: report.status,
      resolvedBy: report.resolvedBy,
      resolvedAt: report.resolvedAt,
      resolutionNotes: report.resolutionNotes,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    }));

    return {
      data: mappedReports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
