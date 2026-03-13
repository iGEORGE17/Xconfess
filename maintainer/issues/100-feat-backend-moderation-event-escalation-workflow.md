# [100] feat(backend): implement moderation event escalation workflow for high-severity and review-required content

## Summary
Convert moderation event listener placeholders into actionable moderation escalation workflows.

## Problem
High-severity and review-required moderation events are logged only, with no queueing, notification, or operator workflow execution.

## Scope
- Implement handlers for `moderation.high-severity` and `moderation.requires-review` actions.
- Add integration with notification and/or moderation queue services.
- Persist escalation events for admin visibility and audit.

## Files
- `xconfess-backend/src/moderation/moderation-events.listener.ts`
- `xconfess-backend/src/moderation/moderation.module.ts`
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/audit-log/audit-log.service.ts`

## Acceptance Criteria
- High-severity events trigger immediate operator notification path.
- Requires-review events create inspectable queue/audit entries.
- Event handling failures are retriable and logged with correlation context.

## Labels
`feature` `backend` `moderation` `workflow`

## How To Test
1. Trigger moderation outcomes for flagged and rejected content.
2. Verify escalation records and notifications are produced.
3. Simulate handler failure and confirm retry/error visibility behavior.
