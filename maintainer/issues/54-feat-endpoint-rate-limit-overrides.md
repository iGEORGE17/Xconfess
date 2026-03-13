# [54] feat(backend): add endpoint-level rate-limit overrides for sensitive routes

## Summary
Global method-based limits are too coarse for auth/report/moderation endpoints.

## Problem
High-risk endpoints need tighter controls than generic GET/POST defaults.

## Scope
- Add per-route override support (decorator or metadata).
- Apply stricter limits to login, forgot-password, report submission.
- Keep global defaults for low-risk endpoints.

## Files
- `xconfess-backend/src/auth/guard/rate-limit.guard.ts`
- `xconfess-backend/src/auth/auth.controller.ts`
- `xconfess-backend/src/report/reports.controller.ts`

## Acceptance Criteria
- Sensitive routes enforce stricter limits.
- Non-sensitive routes continue using global defaults.
- Limit behavior is documented and testable.

## Labels
`feature` `backend` `security` `auth`

## How To Test
1. Hit sensitive routes repeatedly and confirm tighter throttling.
2. Compare with non-sensitive route limits.
3. Verify retry-after semantics remain correct.
