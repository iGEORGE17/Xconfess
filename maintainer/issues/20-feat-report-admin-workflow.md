# [20] feat(backend): secure and complete report moderation admin workflow

## Summary
Reporting exists, but full admin review workflow and surfacing are incomplete.

## Problem
Reported content is captured but not fully actionable through a maintainer flow.

## Scope
- Add/admin endpoints for listing reports with filters.
- Add report resolution actions (resolved/dismissed).
- Optional audit log entries for moderation decisions.

## Files
- `xconfess-backend/src/report/reports.controller.ts`
- `xconfess-backend/src/report/reports.service.ts`
- `xconfess-backend/src/auth/admin.guard.ts`

## Acceptance Criteria
- Admin can list pending reports.
- Admin can mark report as resolved/dismissed.
- Non-admin users cannot access admin moderation endpoints.

## Labels
`feature` `backend` `moderation` `admin`

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
