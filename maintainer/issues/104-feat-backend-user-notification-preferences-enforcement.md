# [104] feat(backend): add user notification preferences and enforce at enqueue time

## Summary
Allow users to opt in/out of notification categories and enforce suppression before queueing.

## Problem
All eligible notification events are currently treated the same, with no per-user delivery preferences.

## Scope
- Add preference model for notification categories (message, reaction, moderation, system).
- Add authenticated endpoint to read/update user notification preferences.
- Apply preference checks in notification enqueue flow and audit suppressed sends.

## Files
- `xconfess-backend/src/user/entities/user.entity.ts`
- `xconfess-backend/src/user/user.controller.ts`
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/audit-log/audit-log.service.ts`

## Acceptance Criteria
- Users can persist notification preference settings.
- Disabled categories do not enqueue/send notifications.
- Suppressed notifications are logged with reason and category.

## Labels
`feature` `backend` `notifications` `user-settings`

## How To Test
1. Disable one notification category for a user.
2. Trigger event for that category and verify no queued/sent notification.
3. Re-enable category and verify delivery resumes.
