# [22] feat(backend): add report status and resolution metadata migration

## Summary
Reports currently lack lifecycle state for admin workflows.

## Problem
Cannot track whether a report is pending, resolved, or dismissed.

## Scope
- Add columns: `status`, `resolvedBy`, `resolvedAt`, `resolutionNote`.
- Add migration and update report entity.

## Files
- `xconfess-backend/src/report/report.entity.ts`
- `xconfess-backend/migrations/*`

## Acceptance Criteria
- Migration applies cleanly on existing DB.
- New reports default to `pending`.
- Entity reflects DB schema.

## Labels
`feature` `backend` `database` `moderation`

## How To Test
### Prerequisites
- `npm install`
- DB running and configured in backend env

### Run
- Execute migration flow for backend
- Start backend service

### Verify
1. Inspect reports table columns.
2. Create report and confirm default status.
3. Ensure no migration errors on fresh and existing DB states.
