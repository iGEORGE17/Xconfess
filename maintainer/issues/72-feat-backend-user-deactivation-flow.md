# [72] feat(backend): implement user account deactivation and session revocation

## Summary
Add a self-service user deactivation flow that preserves historical content safely.

## Problem
Users currently lack a controlled way to deactivate accounts and invalidate active sessions.

## Scope
- Add authenticated endpoint to deactivate account.
- Revoke active auth tokens/sessions after deactivation.
- Define behavior for authored confessions/comments/messages after deactivation.

## Files
- `xconfess-backend/src/user/user.controller.ts`
- `xconfess-backend/src/user/user.service.ts`
- `xconfess-backend/src/auth/**/*.ts`
- `xconfess-backend/src/user/entities/user.entity.ts`

## Acceptance Criteria
- Deactivated users cannot authenticate until reactivated (if supported).
- Existing content ownership remains consistent for moderation/audit.
- API response clearly indicates deactivation state.

## Labels
`feature` `backend` `auth` `user`

## How To Test
1. Deactivate an authenticated account.
2. Verify subsequent authenticated calls are denied.
3. Confirm historical user content remains readable per policy.