# [89] feat(frontend): add admin notification failures page with DLQ actions

## Summary
Provide a dashboard page for operators to inspect failed notifications and trigger replay actions.

## Problem
Notification failure handling is backend-only and lacks operational visibility in the UI.

## Scope
- Add admin page listing failed notification jobs with filters and pagination.
- Show failure reason, retry count, payload summary, and last error timestamp.
- Provide replay action with confirmation and result feedback.

## Files
- `xconfess-frontend/app/(dashboard)/admin/notifications/page.tsx` (new)
- `xconfess-frontend/app/lib/api/client.ts`
- `xconfess-frontend/app/components/ui/table.tsx` (new)
- `xconfess-frontend/app/components/common/ErrorBoundary.tsx`

## Acceptance Criteria
- Admin can view failed jobs sorted by most recent failure.
- Replay action updates row state after API response.
- Page handles loading, empty, and error states clearly.

## Labels
`feature` `frontend` `admin` `ops`

## How To Test
1. Seed failed notification jobs in backend DLQ.
2. Open admin notifications page and verify list rendering and filters.
3. Replay a job from UI and confirm status refresh without full page reload.
