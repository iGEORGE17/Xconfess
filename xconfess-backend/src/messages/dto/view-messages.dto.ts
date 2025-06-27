import { IsString, IsNotEmpty } from 'class-validator';

export class ViewMessagesDto {
  @IsString()
  @IsNotEmpty()
  confession_id: string;
}
