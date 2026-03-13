# [69] feat(backend): add notification retry policy and dead-letter queue handling

## Summary
Make notification processing resilient by defining retries and DLQ behavior.

## Problem
Transient email/queue failures can silently drop notifications without clear recovery path.

## Scope
- Configure retry backoff policy for notification jobs.
- Move exhausted jobs to dead-letter queue.
- Add admin/ops visibility for failed notification jobs.

## Files
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/notification/notification.module.ts`
- `xconfess-backend/src/email/**/*.ts`

## Acceptance Criteria
- Failed jobs retry with bounded attempts and delay strategy.
- Exhausted jobs are persisted in DLQ with error context.
- Ops can inspect failure reason and payload metadata.

## Labels
`feature` `backend` `queue` `reliability`

## How To Test
1. Simulate transient and permanent mail delivery failures.
2. Verify retries occur according to configured policy.
3. Confirm exhausted jobs move to DLQ and remain inspectable.