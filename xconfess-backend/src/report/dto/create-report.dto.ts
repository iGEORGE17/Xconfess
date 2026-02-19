import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportStatus } from '../report.entity'; // Adjust path as needed

export enum ReportReason {
  INAPPROPRIATE = 'inappropriate',
  HARASSMENT = 'harassment',
  SPAM = 'spam',
  HATE_SPEECH = 'hate_speech',
  FALSE_INFORMATION = 'false_information',
  OTHER = 'other',
}

export class CreateReportDto {
  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;
}

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  resolutionReason?: string;
}

