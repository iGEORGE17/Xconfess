import { IsString, IsNotEmpty, MinLength, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchConfessionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  q: string; // Changed from 'keyword' to 'q' to match the endpoint requirement

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}