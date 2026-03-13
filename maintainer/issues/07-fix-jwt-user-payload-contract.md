# [07] fix(backend): normalize JWT request user payload shape

## Summary
`JwtStrategy` returns fields that differ from what controllers/services read (`userId` vs `id`).

## Problem
Protected routes may fail authorization checks or user lookups.

## Scope
- Define canonical `req.user` contract.
- Update strategy, decorators, and dependent services.

## Files
- `xconfess-backend/src/auth/jwt.strategy.ts`
- `xconfess-backend/src/auth/get-user.decorator.ts`
- `xconfess-backend/src/messages/messages.service.ts`
- `xconfess-backend/src/user/user.controller.ts`

## Acceptance Criteria
- Protected routes consistently access user identifier.
- No mix of `id` and `userId` assumptions without mapping.
- Tests updated to enforce contract.

## Labels
`bug` `backend` `auth` `high priority`

## How To Test
### Prerequisites
- From repo root: `npm install`
- Configure backend env in `xconfess-backend/.env` (DB, JWT, required keys)
- Start PostgreSQL and ensure connection values are valid

### Run
- `npm run dev:backend`

### Verify
1. Exercise affected endpoint(s) with Postman/curl.
2. Confirm success path matches Acceptance Criteria.
3. Confirm failure paths return correct status codes/messages.
4. Validate no runtime Nest DI/entity relation errors in logs.

### Optional checks
- `npm run test --workspace=xconfess-backend`
- `npm run lint --workspace=xconfess-backend`
