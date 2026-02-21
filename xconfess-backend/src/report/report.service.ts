import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from './report.entity';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AuditLogService,
  AuditLogContext,
} from '../audit-log/audit-log.service';
import { AuditActionType } from '../audit-log/audit-log.entity';

export interface ListReportsFilter {
  status?: ReportStatus;
  confessionId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(AnonymousConfession)
    private readonly confessionRepository: Repository<AnonymousConfession>,
    private readonly eventEmitter: EventEmitter2,
    private readonly auditLogService: AuditLogService,
  ) {}

  // -------------------------------------------------------------------------
  // Public: create a report on a confession
  // -------------------------------------------------------------------------
  async createReport(
    confessionId: string,
    reporterId: number | null,
    dto: CreateReportDto,
    context?: AuditLogContext,
  ): Promise<Report> {
    const confession = await this.confessionRepository.findOne({
      where: { id: confessionId },
    });

    if (!confession) {
      throw new NotFoundException('Confession not found');
    }

    const report = this.reportRepository.create({
      confessionId,
      reporterId: reporterId ?? undefined,
      reason: dto.reason,
      details: dto.additionalDetails ?? undefined,
      status: ReportStatus.PENDING,
    });

    const saved = await this.reportRepository.save(report);

    this.eventEmitter.emit('report.created', {
      reportId: saved.id,
      confessionId: saved.confessionId,
      status: saved.status,
      createdAt: saved.created_at,
    });

    await this.auditLogService.logReport(
      String(saved.id),
      'confession',
      confessionId,
      reporterId ? String(reporterId) : 'anonymous',
      dto.reason,
      context,
    );

    return saved;
  }

  // -------------------------------------------------------------------------
  // Admin: list reports with optional filters and pagination
  // -------------------------------------------------------------------------
  async listReports(filter: ListReportsFilter): Promise<{
    data: Report[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filter.page && filter.page > 0 ? filter.page : 1;
    const limit =
      filter.limit && filter.limit > 0 ? Math.min(filter.limit, 100) : 20;

    const qb = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.resolvedBy', 'resolvedBy')
      .orderBy('report.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filter.status) {
      qb.andWhere('report.status = :status', { status: filter.status });
    }

    if (filter.confessionId) {
      qb.andWhere('report.confessionId = :confessionId', {
        confessionId: filter.confessionId,
      });
    }

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  // -------------------------------------------------------------------------
  // Admin: get a single report by id
  // -------------------------------------------------------------------------
  async getReport(id: number): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['resolvedBy'],
    });

    if (!report) {
      throw new NotFoundException(`Report #${id} not found`);
    }

    return report;
  }

  // -------------------------------------------------------------------------
  // Admin: resolve or dismiss a report
  // -------------------------------------------------------------------------
  async updateReportStatus(
    id: number,
    dto: UpdateReportStatusDto,
    adminId: number,
    context?: AuditLogContext,
  ): Promise<Report> {
    const report = await this.getReport(id);

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException(
        `Report is already ${report.status} and cannot be updated`,
      );
    }

    const previousStatus = report.status;

    report.status = dto.status;
    report.resolvedById = adminId;
    report.resolvedAt = new Date();
    report.resolutionReason = dto.resolutionReason ?? undefined;

    const saved = await this.reportRepository.save(report);

    const sharedMeta = {
      previousStatus,
      reason: dto.resolutionReason,
      confessionId: report.confessionId,
    };
    const adminIdStr = String(adminId);

    if (dto.status === ReportStatus.RESOLVED) {
      await this.auditLogService.logReportResolved(
        String(id),
        adminIdStr,
        { ...sharedMeta, resolvedBy: adminIdStr },
        context,
      );
    } else {
      await this.auditLogService.logReportDismissed(
        String(id),
        adminIdStr,
        { ...sharedMeta, dismissedBy: adminIdStr },
        context,
      );
    }

    this.eventEmitter.emit('report.updated', {
      reportId: saved.id,
      status: saved.status,
      resolvedById: adminId,
      resolvedAt: saved.resolvedAt,
    });

    return saved;
  }
}
