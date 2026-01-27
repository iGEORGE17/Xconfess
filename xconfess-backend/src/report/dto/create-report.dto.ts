import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ReportType } from '../../admin/entities/report.entity';

export class CreateReportDto {
  @IsUUID()
  confessionId: string;

  @IsEnum(ReportType)
  type: ReportType;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}

