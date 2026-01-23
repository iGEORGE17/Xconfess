import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateConfessionDraftDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Confession cannot exceed 1000 characters' })
  content?: string;
}
