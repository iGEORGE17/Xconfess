import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class CreateReactionDto {
   @IsUUID()
  @IsNotEmpty()
  confessionId: string; //

  @IsString()
  @IsNotEmpty()
  emoji: string;
}
