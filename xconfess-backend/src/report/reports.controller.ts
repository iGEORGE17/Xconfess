import {
  Controller,
  Post,
  Param,
  Body,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('confession')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post(':id/report')
  async reportConfession(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReportDto,
    @Req() req: any,
  ) {
    const reporterId = req.user?.id ?? null;

    await this.reportsService.createReport(id, reporterId, dto);

    return { success: true };
  }
}
