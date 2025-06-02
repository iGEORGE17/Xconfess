import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateConfessionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Confession must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Confession cannot exceed 1000 characters' })
  message: string;
}
