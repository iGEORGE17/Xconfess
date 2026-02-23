import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const RESOLVE_ACTIONS = ['resolved', 'dismissed'] as const;
export type ResolveAction = (typeof RESOLVE_ACTIONS)[number];

export class ResolveReportDto {
  @IsIn(RESOLVE_ACTIONS, {
    message: 'action must be "resolved" or "dismissed"',
  })
  action: ResolveAction;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
