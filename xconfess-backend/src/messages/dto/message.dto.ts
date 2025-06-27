import { IsInt, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  confession_id: number;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;
}

export class ReplyMessageDto {
  @IsInt()
  message_id: number;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  reply: string;
}
