# [84] fix(backend): enforce idempotency for notification enqueue requests

## Summary
Prevent duplicate notifications by introducing deterministic dedupe keys during enqueue.

## Problem
Concurrent or repeated triggers can enqueue the same notification multiple times.

## Scope
- Define idempotency key strategy based on event type, recipient, and entity id.
- Reject or collapse duplicate enqueue attempts within configurable TTL window.
- Log dedupe decisions for debugging without exposing sensitive payload fields.

## Files
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/notification/notification.module.ts`
- `xconfess-backend/src/config/rate-limit.config.ts`
- `xconfess-backend/src/logger/logger.service.ts`

## Acceptance Criteria
- Duplicate enqueue requests with same key do not create extra jobs.
- Legitimate distinct notifications still enqueue normally.
- Dedupe behavior is covered by unit tests for race and retry scenarios.

## Labels
`bug` `backend` `queue` `reliability`

## How To Test
1. Trigger same notification event rapidly from parallel requests.
2. Verify only one queue job is persisted for matching idempotency key.
3. Confirm distinct events still generate separate jobs.
