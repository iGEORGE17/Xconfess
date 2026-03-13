# [44] fix(backend): unify JWT request-user shape for guarded endpoints

## Summary
Guarded endpoint code mixes `req.user.id` and `req.user.userId`, increasing auth-context inconsistency.

## Problem
Inconsistent request-user shape can break profile update and ownership logic depending on strategy output.

## Scope
- Define canonical JWT request-user interface.
- Update strategy/decorator/controller usage to one shape.
- Remove ambiguous user ID reads.

## Files
- `xconfess-backend/src/auth/jwt.strategy.ts`
- `xconfess-backend/src/auth/get-user.decorator.ts`
- `xconfess-backend/src/user/user.controller.ts`
- any guarded controllers using `req.user`

## Acceptance Criteria
- All guarded handlers resolve user ID via one contract.
- No endpoint relies on mixed `id`/`userId` assumptions.
- Authenticated profile update works reliably.

## Labels
`bug` `backend` `auth`

## How To Test
1. Call guarded endpoints with valid JWT.
2. Verify user ID extraction is consistent.
3. Confirm update/profile endpoints succeed.
