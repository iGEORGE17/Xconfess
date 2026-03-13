# [24] feat(backend): report resolution endpoint for admins

## Summary
Implement action endpoint for resolving or dismissing reports.

## Problem
Reports can be created but not actioned by moderators.

## Scope
- Add `PATCH /admin/reports/:id/resolve`.
- Accept valid actions (`resolved`, `dismissed`) and optional note.

## Files
- `xconfess-backend/src/report/reports.controller.ts`
- `xconfess-backend/src/report/reports.service.ts`
- `xconfess-backend/src/report/dto/*`

## Acceptance Criteria
- Endpoint updates status and resolution metadata.
- Invalid status rejected with 400.
- Only admin can access.

## Labels
`feature` `backend` `admin` `moderation`

## How To Test
### Prerequisites
- `npm install`
- Backend DB/JWT configured

### Run
- `npm run dev:backend`

### Verify
1. Create a report.
2. Resolve it via admin endpoint.
3. Confirm status and resolution fields persist.
4. Attempt with non-admin token and confirm 403.
