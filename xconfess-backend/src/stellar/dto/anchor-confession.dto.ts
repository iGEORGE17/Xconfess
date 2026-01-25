import { IsNotEmpty, IsString, IsOptional, Matches, Length } from 'class-validator';

export class AnchorConfessionDto {
  @IsNotEmpty()
  @IsString()
  @Length(64, 64)
  @Matches(/^[a-fA-F0-9]{64}$/, {
    message: 'Invalid Stellar transaction hash format',
  })
  stellarTxHash: string;

  @IsOptional()
  @IsString()
  @Length(64, 64)
  @Matches(/^[a-fA-F0-9]{64}$/, {
    message: 'Invalid Stellar hash format',
  })
  stellarHash?: string;
}
