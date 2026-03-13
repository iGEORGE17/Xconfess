# [65] feat(backend): implement confession soft-delete and restore controls

## Summary
Allow authors/admins to soft-delete confessions without hard data loss.

## Problem
Permanent deletes remove moderation and audit context and make recoveries impossible.

## Scope
- Add soft-delete column(s) to confession entity.
- Implement author/admin delete endpoint behavior as soft delete.
- Add admin restore endpoint for recently deleted records.

## Files
- `xconfess-backend/src/confession/entities/confession.entity.ts`
- `xconfess-backend/src/confession/confession.service.ts`
- `xconfess-backend/src/confession/confession.controller.ts`
- `xconfess-backend/migrations/*`

## Acceptance Criteria
- Deleted confessions are excluded from normal listing/search queries.
- Soft-deleted records are recoverable by authorized admins.
- Audit log captures delete and restore actions.

## Labels
`feature` `backend` `confession` `moderation`

## How To Test
1. Create confession and soft-delete it as author/admin.
2. Verify it no longer appears in feed/search endpoints.
3. Restore as admin and confirm visibility returns.