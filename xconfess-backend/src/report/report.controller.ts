import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportService } from './report.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { Request } from 'express';

type AuthedRequest = Request & { user?: any };

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * Create a user report for a confession.
   * - Auth is optional: if JWT is present, we attribute `reporterId`
   * - Otherwise reporterId is null (anonymous report)
   */
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async create(@Body() dto: CreateReportDto, @Req() req: AuthedRequest) {
    const reporterIdRaw = (req.user as any)?.userId ?? (req.user as any)?.sub;
    const reporterId =
      reporterIdRaw !== undefined && reporterIdRaw !== null
        ? Number(reporterIdRaw)
        : null;

    // If guard didn't populate user (e.g. missing token), reporterId becomes null.
    return this.reportService.createReport(dto, Number.isFinite(reporterId) ? reporterId : null);
  }
}

