# [08] fix(backend): resolve missing Nest module wiring for confession dependencies

## Summary
`ConfessionService` injects providers that are not clearly imported/exported in modules.

## Problem
Potential Nest DI runtime errors for logger/encryption/event-emitter dependencies.

## Scope
- Import/export required modules/providers.
- Add `EventEmitterModule` where needed.

## Files
- `xconfess-backend/src/confession/confession.module.ts`
- `xconfess-backend/src/app.module.ts`
- `xconfess-backend/src/logger/logger.module.ts`
- `xconfess-backend/src/encryption/encryption.module.ts`

## Acceptance Criteria
- App boots with no unresolved provider errors.
- Confession create/read paths execute successfully.
- Basic integration test confirms module graph is valid.

## Labels
`bug` `backend` `nestjs` `high priority`

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
