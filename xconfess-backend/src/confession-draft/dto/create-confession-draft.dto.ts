import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateConfessionDraftDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Confession cannot exceed 1000 characters' })
  content: string;

  @IsOptional()
  @IsString()
  scheduledFor?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}
