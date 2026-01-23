import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ScheduleConfessionDraftDto {
  @IsString()
  @IsNotEmpty()
  scheduledFor: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}
