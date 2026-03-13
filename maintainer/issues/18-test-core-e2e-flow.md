# [18] test(backend): add end-to-end happy path for core journey

## Summary
Core flow lacks cohesive e2e validation across auth/confession/reaction.

## Problem
Regressions are easy to introduce due to model/route mismatches.

## Scope
- Add e2e tests: register/login, create confession, fetch feed, react.
- Validate status codes and response shape.

## Files
- `xconfess-backend/test/*.ts`
- `xconfess-backend/src/**/*.spec.ts`

## Acceptance Criteria
- CI test command runs and passes locally.
- New tests fail before fix and pass after fix.
- Coverage includes at least one auth-guarded route.

## Labels
`testing` `backend` `quality`

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
