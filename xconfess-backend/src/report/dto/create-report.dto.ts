import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportStatus } from '../report.entity';

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

export enum AllowedReportStatusUpdate {
  RESOLVED = ReportStatus.RESOLVED,
  DISMISSED = ReportStatus.DISMISSED,
}

