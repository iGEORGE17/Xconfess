# [23] feat(backend): admin reports listing endpoint with filters

## Summary
Add an admin endpoint to list reports with filter and pagination support.

## Problem
Maintainers lack a queue view for moderation workload.

## Scope
- Create `GET /admin/reports`.
- Support filters: status, reason, date range.
- Include pagination metadata.

## Files
- `xconfess-backend/src/report/reports.controller.ts`
- `xconfess-backend/src/report/reports.service.ts`
- `xconfess-backend/src/auth/admin.guard.ts`

## Acceptance Criteria
- Admin-only access.
- Filtered/paginated results returned.
- Non-admin receives 403.

## Labels
`feature` `backend` `admin` `moderation`

## How To Test
### Prerequisites
- `npm install`
- Backend env configured with JWT and DB

### Run
- `npm run dev:backend`

### Verify
1. Hit endpoint with admin token and query filters.
2. Confirm response data and meta fields.
3. Hit endpoint with non-admin token and confirm 403.
