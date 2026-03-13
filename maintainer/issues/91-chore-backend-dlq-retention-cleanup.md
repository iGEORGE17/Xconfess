# [91] chore(backend): implement DLQ retention policy and cleanup job

## Summary
Prevent unbounded DLQ growth by adding configurable retention and archival cleanup.

## Problem
Dead-letter queues can grow indefinitely, increasing storage cost and slowing operational queries.

## Scope
- Define retention window and terminal archival/delete policy.
- Add scheduled cleanup task with dry-run mode.
- Emit audit log entry for cleanup batches and deleted job counts.

## Files
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/notification/notification.module.ts`
- `xconfess-backend/src/audit-log/audit-log.service.ts`
- `xconfess-backend/src/config/database.config.ts`

## Acceptance Criteria
- DLQ entries older than retention threshold are archived or removed by policy.
- Cleanup task is idempotent and safe to rerun.
- Cleanup activity is observable through logs and audit records.

## Labels
`chore` `backend` `queue` `ops`

## How To Test
1. Seed DLQ with records spanning retention boundary dates.
2. Run cleanup in dry-run and verify candidate counts.
3. Run cleanup in active mode and confirm expected records are processed.
