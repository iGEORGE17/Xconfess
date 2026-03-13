# [06] fix(backend): update messages ownership checks for anonymous model

## Summary
Messages flow relies on `confession.user`, but confession model links to `anonymousUser`.

## Problem
Authorization checks and notification recipient selection can break.

## Scope
- Redefine ownership checks using actual relation model.
- Update controller/service response mapping accordingly.

## Files
- `xconfess-backend/src/messages/messages.service.ts`
- `xconfess-backend/src/messages/messages.controller.ts`
- `xconfess-backend/src/confession/entities/confession.entity.ts`

## Acceptance Criteria
- `POST /messages`, `POST /messages/reply`, `GET /messages` work with real schema.
- No references to non-existent confession user fields.
- Tests validate permission rules.

## Labels
`bug` `backend` `authz` `high priority`

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
