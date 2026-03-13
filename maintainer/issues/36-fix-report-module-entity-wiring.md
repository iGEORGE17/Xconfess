# [36] fix(backend): wire `AnonymousConfession` repository in report module

## Summary
`ReportsService` injects `Repository<AnonymousConfession>`, but `ReportModule` only registers `Report` in `TypeOrmModule.forFeature`.

## Problem
At runtime, Nest can fail to resolve dependencies for `ReportsService`, breaking the report creation endpoint.

## Scope
- Add `AnonymousConfession` to `TypeOrmModule.forFeature` in report module.
- Keep provider/controller wiring unchanged.
- Add/adjust a focused module test to catch DI regression.

## Files
- `xconfess-backend/src/report/reports.module.ts`
- `xconfess-backend/src/report/reports.service.ts`
- `xconfess-backend/src/report/reports.controller.ts`
- `xconfess-backend/src/report/*.spec.ts` (new or updated)

## Acceptance Criteria
- App boots without DI errors related to `ReportsService`.
- `POST /confessions/:id/report` works for valid payloads.
- A test fails if `AnonymousConfession` is removed from module imports.

## Labels
`bug` `backend` `database` `high priority`

## How To Test
### Prerequisites
- `npm install`
- Backend env configured

### Run
- `npm run dev:backend`
- `npm run test --workspace=xconfess-backend`

### Verify
1. Confirm startup has no repository injection error.
2. Submit `POST /confessions/:id/report` for an existing confession.
3. Validate report persists and response is successful.
