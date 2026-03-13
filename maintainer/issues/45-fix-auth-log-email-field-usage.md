# [45] fix(backend): stop logging non-existent plaintext email field in auth service

## Summary
Auth service logs reference `user.email`, but user entity stores encrypted email fields.

## Problem
Incorrect field usage can log undefined values and mask real operational issues.

## Scope
- Remove `user.email` references from auth logs.
- Use safe masked identifiers and non-PII metadata only.
- Keep observability without plaintext exposure.

## Files
- `xconfess-backend/src/auth/auth.service.ts`
- `xconfess-backend/src/utils/mask-user-id.ts`

## Acceptance Criteria
- Auth logs contain stable, non-PII identifiers.
- No `user.email` reads on encrypted-only entity.
- Forgot/reset flows still produce actionable logs.

## Labels
`bug` `backend` `security` `observability`

## How To Test
1. Trigger forgot/reset password flows.
2. Inspect logs for masked-only user references.
3. Verify no undefined or plaintext email logging.
