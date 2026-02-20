import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportStatus } from '../enums/report-status.enum';

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus, {
    message: `status must be one of: ${Object.values(ReportStatus).join(', ')}`,
  })
  status: ReportStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}