import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class SearchConfessionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  keyword: string;
} 