# [27] fix(backend): enforce report dedupe with DB-level constraint

## Summary
Prevent duplicate report spam using database-level protection.

## Problem
Current duplicate checks are app-level and may race under concurrency.

## Scope
- Add index/constraint strategy for dedupe window.
- Handle conflict errors gracefully in service.

## Files
- `xconfess-backend/migrations/*`
- `xconfess-backend/src/report/reports.service.ts`

## Acceptance Criteria
- Concurrent duplicate reports do not create multiple rows.
- API returns clear duplicate-report message.
- No unhandled DB conflict exceptions.

## Labels
`bug` `backend` `database` `high priority`

## How To Test
### Prerequisites
- `npm install`
- Backend DB configured

### Run
- `npm run dev:backend`

### Verify
1. Submit duplicate report requests rapidly.
2. Confirm only one persists in DB.
3. Confirm duplicate response is deterministic.
