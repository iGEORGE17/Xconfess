# [82] feat(backend): add admin replay endpoint for notification DLQ jobs

## Summary
Allow operators to replay dead-lettered notification jobs after resolving transient failures.

## Problem
After retry exhaustion, failed notification jobs remain stuck without a safe replay workflow.

## Scope
- Add admin-only endpoint to list and replay DLQ notification jobs.
- Support replay by single job id and controlled bulk replay with filters.
- Record replay action in audit logs with actor, reason, and timestamp.

## Files
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/notification/notification.module.ts`
- `xconfess-backend/src/audit-log/audit-log.service.ts`
- `xconfess-backend/src/auth/admin.guard.ts`

## Acceptance Criteria
- Admin can fetch paginated DLQ jobs with failure metadata.
- Admin can replay a specific DLQ job and receive replay status.
- Replay actions are auditable and include operator identity.

## Labels
`feature` `backend` `queue` `ops`

## How To Test
1. Force notification jobs into DLQ with permanent failure.
2. Call admin list endpoint and verify failed jobs appear with error context.
3. Replay one job and confirm it re-enters active queue and is processed.
