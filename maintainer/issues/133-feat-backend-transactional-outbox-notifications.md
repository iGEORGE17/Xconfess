# [133] feat(backend): implement transactional outbox for notification-producing domain events

## Summary
Add a transactional outbox so notification jobs are dispatched reliably after domain writes commit.

## Problem
Current enqueue calls happen directly in request/service flows, which can cause lost or duplicated notifications when failures occur around DB commit boundaries.

## Scope
- Add outbox event entity/table for notification intents.
- Persist outbox records in same transaction as domain mutations (message/reaction/report).
- Add outbox dispatcher worker that publishes to queue with retry/idempotency and marks dispatch status.

## Files
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/messages/messages.service.ts`
- `xconfess-backend/src/reaction/reaction.service.ts`
- `xconfess-backend/src/report/reports.service.ts`
- `xconfess-backend/src/common/entities/outbox-event.entity.ts` (new)
- `xconfess-backend/src/notification/outbox-dispatcher.service.ts` (new)

## Acceptance Criteria
- Notification intent is never lost when primary domain write succeeds.
- Dispatcher retries failed publishes and records terminal failure state with context.
- Duplicate dispatch is prevented via idempotency key or unique outbox constraints.

## Labels
`feature` `backend` `queue` `reliability`

## How To Test
1. Simulate successful domain writes with temporary queue outage and verify outbox retains pending events.
2. Restore queue and confirm dispatcher drains pending outbox rows.
3. Simulate duplicate dispatch attempt and confirm idempotent behavior.
