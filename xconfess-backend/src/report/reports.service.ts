import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from './report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { User, UserRole } from '../user/entities/user.entity';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(AnonymousConfession)
    private readonly confessionRepository: Repository<AnonymousConfession>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createReport(
    confessionId: string,
    reporterId: number | null,
    dto: CreateReportDto,
    context?: { ipAddress?: string; userAgent?: string },
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

      // 3️⃣ Save report atomically with pending status
      const report = manager.getRepository(Report).create({
        confessionId,
        reporterId: reporterId ?? undefined,
        reason: dto.reason,
        details: dto.details,
        status: ReportStatus.PENDING,
      });

      const savedReport = await manager.getRepository(Report).save(report);

      // 4️⃣ Log report creation (non-blocking - no await)
      if (reporterId) {
        this.auditLogService.logReport(
          savedReport.id.toString(),
          'confession',
          confessionId,
          reporterId.toString(),
          dto.reason,
          {
            ipAddress: context?.ipAddress,
            userAgent: context?.userAgent,
            userId: reporterId.toString(),
          },
        ).catch(error => {
          this.logger.error(`Failed to log report creation: ${error.message}`);
        });
      }

      return savedReport;
    });
  }

  async resolveReport(
    reportId: number,
    admin: User,
    options?: { 
      reason?: string; 
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<Report> {
    // Use pessimistic locking to prevent race conditions
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      lock: { mode: 'pessimistic_write' },
    });
    
    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    if (!this.isAdmin(admin)) {
      throw new ForbiddenException('Only admins can resolve reports');
    }

    if (report.status === ReportStatus.RESOLVED || report.status === ReportStatus.DISMISSED) {
      throw new BadRequestException(`Report is already ${report.status}`);
    }

    const previousStatus = report.status;
    
    // Update report status
    report.status = ReportStatus.RESOLVED;
    report.resolvedById = admin.id;
    report.resolvedAt = new Date();
    report.resolutionReason = options?.reason || 'Report resolved'; // Consistent default
    
    const updatedReport = await this.reportRepository.save(report);

    // Log report resolution (truly non-blocking - no await)
    this.auditLogService.logReportResolved(
      reportId.toString(),
      admin.id.toString(),
      {
        previousStatus,
        reason: options?.reason,
        confessionId: report.confessionId,
        resolvedBy: admin.username,
      },
      {
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
      },
    ).catch(error => {
      this.logger.error(`Failed to log report resolution: ${error.message}`);
    });

    this.logger.log(`Report ${reportId} resolved by admin ${admin.id}`);
    
    return updatedReport;
  }

  async dismissReport(
    reportId: number,
    admin: User,
    options?: { 
      reason?: string; 
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<Report> {
    // Use pessimistic locking to prevent race conditions
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      lock: { mode: 'pessimistic_write' },
    });
    
    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    if (!this.isAdmin(admin)) {
      throw new ForbiddenException('Only admins can dismiss reports');
    }

    if (report.status === ReportStatus.RESOLVED || report.status === ReportStatus.DISMISSED) {
      throw new BadRequestException(`Report is already ${report.status}`);
    }

    const previousStatus = report.status;
    
    // Update report status
    report.status = ReportStatus.DISMISSED;
    report.resolvedById = admin.id;
    report.resolvedAt = new Date();
    report.resolutionReason = options?.reason || 'Report dismissed'; // Consistent default
    
    const updatedReport = await this.reportRepository.save(report);

    // Log report dismissal (truly non-blocking - no await)
    this.auditLogService.logReportDismissed(
      reportId.toString(),
      admin.id.toString(),
      {
        previousStatus,
        reason: options?.reason,
        confessionId: report.confessionId,
        dismissedBy: admin.username,
      },
      {
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
      },
    ).catch(error => {
      this.logger.error(`Failed to log report dismissal: ${error.message}`);
    });

    this.logger.log(`Report ${reportId} dismissed by admin ${admin.id}`);
    
    return updatedReport;
  }

  async getReportAuditLogs(reportId: number): Promise<any> {
    return this.auditLogService.findByEntity('report', reportId.toString());
  }

  async findAll(options?: {
    status?: ReportStatus;
    page?: number;
    limit?: number;
  }): Promise<{ items: Report[]; total: number }> {
    const { status, page = 1, limit = 20 } = options || {};
    
    const query = this.reportRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.resolvedBy', 'resolvedBy')
      .orderBy('report.created_at', 'DESC');

    if (status) {
      query.andWhere('report.status = :status', { status });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  async findOne(id: number): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['resolvedBy'],
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  private isAdmin(user: User): boolean {
    return user.role === UserRole.ADMIN;
  }
}

