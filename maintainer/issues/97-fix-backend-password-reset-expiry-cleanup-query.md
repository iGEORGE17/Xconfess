# [97] fix(backend): correct password reset expiry cleanup query for TypeORM compatibility

## Summary
Replace invalid Mongo-style delete criteria in password reset cleanup with proper TypeORM operators.

## Problem
`cleanupExpiredTokens` uses `{ $lt: ... }` criteria, which is not valid TypeORM style and can silently fail to remove expired records.

## Scope
- Replace `$lt` criteria with `LessThan(new Date())` or query builder equivalent.
- Add tests for cleanup behavior with expired and non-expired tokens.
- Emit cleanup metrics/logs with deleted row count.

## Files
- `xconfess-backend/src/auth/password-reset.service.ts`
- `xconfess-backend/src/auth/password-reset.service.spec.ts`

## Acceptance Criteria
- Expired tokens are reliably deleted by cleanup job.
- Non-expired tokens remain untouched.
- Tests fail if cleanup query regresses.

## Labels
`bug` `backend` `auth` `database`

## How To Test
1. Seed password reset rows with past/future `expiresAt` values.
2. Execute cleanup method.
3. Confirm only expired rows are removed.
