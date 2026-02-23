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
import { RateLimit } from '../auth/guard/rate-limit.decorator';

@Controller('confessions')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Post(':id/report')
  @UseGuards(OptionalJwtAuthGuard) // 🛡️ Allows both Guest and Auth users
  @RateLimit(5, 300)
  async reportConfession(
    @Param('id') confessionId: string, // ✅ UUID validation (will add pipe separately)
    @GetUser('id') reporterId: number | null, // ✅ Standardized Canonical ID
    @Body() dto: CreateReportDto,
  ) {
    // If user is not logged in, reporterId will be null via OptionalGuard logic
    return this.reportsService.createReport(confessionId, reporterId, dto);
  }
}