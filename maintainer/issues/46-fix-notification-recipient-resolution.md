# [46] fix(backend): correct recipient email resolution for notification flows

## Summary
Notification send paths expect direct user email fields that may not exist due to encrypted email model.

## Problem
Reaction/message notifications can fail or silently skip due to wrong recipient source.

## Scope
- Resolve recipient email via supported user data path (decrypt utility/service boundary).
- Centralize recipient resolution helper.
- Handle missing recipient gracefully with structured logs.

## Files
- `xconfess-backend/src/reaction/reaction.service.ts`
- `xconfess-backend/src/messages/messages.controller.ts`
- `xconfess-backend/src/notification/notification.queue.ts`

## Acceptance Criteria
- Notifications use valid recipient addresses when available.
- Missing-recipient case is explicit and non-fatal.
- Notification triggers no longer depend on invalid entity fields.

## Labels
`bug` `backend` `notifications` `email`

## How To Test
1. Trigger reaction and message notifications.
2. Confirm queue jobs use valid recipient addresses.
3. Verify failure path logs clear reason without crashing request.
