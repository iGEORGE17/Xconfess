import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConfessionDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
