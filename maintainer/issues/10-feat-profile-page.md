# [10] feat(frontend): implement profile page

## Summary
`app/(dashboard)/profile/page.tsx` is empty.

## Problem
Profile navigation exists in header but destination has no implementation.

## Scope
- Build profile page UI with current user details.
- Add account actions (logout, optional deactivate/reactivate placeholders).

## Files
- `xconfess-frontend/app/(dashboard)/profile/page.tsx`
- `xconfess-frontend/app/components/layout/Header.tsx`

## Acceptance Criteria
- Profile page renders authenticated user info.
- Unauthenticated users are redirected or shown clear state.
- Page uses shared auth source.

## Labels
`feature` `frontend` `auth` `ui`

## How To Test
### Prerequisites
- From repo root: `npm install`
- Frontend env: `xconfess-frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3000`
- Backend running and reachable from frontend

### Run
- `npm run dev:backend`
- `npm run dev:frontend`

### Verify
1. Open the affected frontend route/UI.
2. Reproduce the issue path before changes.
3. Apply fix and confirm expected behavior from Acceptance Criteria.
4. Confirm error handling paths (invalid input or backend unavailable).
5. Refresh and ensure behavior/data consistency remains correct.

### Optional checks
- `npm run lint --workspace=xconfess-frontend`
- `npm run build --workspace=xconfess-frontend`
