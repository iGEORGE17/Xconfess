import { IsInt } from 'class-validator';

export class ViewMessagesDto {
  @IsInt()
  confession_id: number;
}
