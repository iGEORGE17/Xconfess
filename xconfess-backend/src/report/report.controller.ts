import {
  Body,
  Controller,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report.dto';
import { ReportService } from './report.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { Request } from 'express';

type AuthedRequest = Request & { user?: any };

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async create(@Body() dto: CreateReportDto, @Req() req: AuthedRequest) {
    const reporterIdRaw = (req.user as any)?.userId ?? (req.user as any)?.sub;
    const reporterId =
      reporterIdRaw !== undefined && reporterIdRaw !== null
        ? Number(reporterIdRaw)
        : null;

    return this.reportService.createReport(
      dto,
      Number.isFinite(reporterId) ? reporterId : null,
    );
  }

  // ✅ ADMIN STATUS UPDATE
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.reportService.updateReportStatus(id, dto);
  }
}