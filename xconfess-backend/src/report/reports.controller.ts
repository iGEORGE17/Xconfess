import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('confessions')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post(':id/report')
  @UseGuards(OptionalJwtAuthGuard) // 🛡️ Allows both Guest and Auth users
  async reportConfession(
    @Param('id') id: string, // ✅ Standardized UUID
    @GetUser('id') reporterId: number | null, // ✅ Standardized Canonical ID
    @Body() dto: CreateReportDto,
  ) {
    // If user is not logged in, reporterId will be null via the OptionalGuard logic
    return this.reportsService.createReport(id, reporterId, dto);
  }
}