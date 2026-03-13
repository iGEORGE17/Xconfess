# [43] fix(backend): normalize confession owner relation usage (`anonymousUser` vs `user`)

## Summary
Multiple modules reference `confession.user`, but confession entity defines owner relation as `anonymousUser`.

## Problem
Incorrect relation naming breaks ownership checks, notification routing, and relation loading.

## Scope
- Replace `user` relation access with `anonymousUser` where appropriate.
- Update relation arrays in repository/service calls.
- Adjust typing/tests for ownership and notification paths.

## Files
- `xconfess-backend/src/confession/entities/confession.entity.ts`
- `xconfess-backend/src/messages/messages.service.ts`
- `xconfess-backend/src/messages/messages.controller.ts`
- `xconfess-backend/src/reaction/reaction.service.ts`

## Acceptance Criteria
- No runtime access to non-existent `confession.user` remains.
- Ownership checks use valid relation data.
- Relation-based queries load expected owner record.

## Labels
`bug` `backend` `entities` `high priority`

## How To Test
1. Run affected endpoints (messages/reactions).
2. Verify relation loading succeeds without undefined access.
3. Confirm ownership checks still enforce expected behavior.
