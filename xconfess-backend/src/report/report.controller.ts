import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report.dto';
import { AdminGuard } from '../auth/admin.guard';
import { ReportStatus } from './report.entity';
import { ReportsService } from './report.service';

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------
@Controller('confessions')
export class ReportController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * POST /confessions/:id/report
   * Any user (authenticated or anonymous) can report a confession.
   */
  @Post(':id/report')
  @HttpCode(HttpStatus.CREATED)
  async reportConfession(
    @Param('id') confessionId: string,
    @Req() req: any,
    @Body() dto: CreateReportDto,
  ) {
    const reporterId: number | null = req.user?.id ?? null;
    const context = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
    return this.reportsService.createReport(
      confessionId,
      reporterId,
      dto,
      context,
    );
  }
}

// ---------------------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------------------
@Controller('admin/reports')
@UseGuards(AdminGuard)
export class AdminReportController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /admin/reports
   * List reports with optional filters: status, confessionId, page, limit.
   *
   * Examples:
   *   GET /admin/reports
   *   GET /admin/reports?status=pending
   *   GET /admin/reports?status=resolved&page=2&limit=10
   *   GET /admin/reports?confessionId=<uuid>
   */
  @Get()
  async listReports(
    @Query('status') status?: ReportStatus,
    @Query('confessionId') confessionId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filter = {
      status,
      confessionId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.reportsService.listReports(filter);
  }

  /**
   * GET /admin/reports/:id
   * Get a single report by id.
   */
  @Get(':id')
  async getReport(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.getReport(id);
  }

  /**
   * PATCH /admin/reports/:id/status
   * Resolve or dismiss a report.
   * Body: { "status": "resolved" | "dismissed", "resolutionReason": "..." }
   */
  @Patch(':id/status')
  async updateReportStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReportStatusDto,
    @Req() req: any,
  ) {
    const adminId: number = req.user.id;
    const context = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      userId: String(adminId),
    };
    return this.reportsService.updateReportStatus(id, dto, adminId, context);
  }
}
