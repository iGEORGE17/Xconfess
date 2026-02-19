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

// Only allow transitioning to resolved or dismissed states
export enum AllowedReportStatusUpdate {
  RESOLVED = ReportStatus.RESOLVED,
  DISMISSED = ReportStatus.DISMISSED,
}

export class UpdateReportStatusDto {
  @IsEnum(AllowedReportStatusUpdate)
  status: AllowedReportStatusUpdate;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  resolutionReason?: string;
}
