export class ConfessionResponseDto {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ConfessionResponseDto>) {
    Object.assign(this, partial);
  }
}
