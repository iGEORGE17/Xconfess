import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  Matches,
} from 'class-validator';
import { Gender } from './get-confessions.dto';

export class CreateConfessionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Confession cannot exceed 1000 characters' })
  message: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  @Matches(/^[a-fA-F0-9]{64}$/, {
    message: 'Invalid Stellar transaction hash format',
  })
  stellarTxHash?: string;
}
