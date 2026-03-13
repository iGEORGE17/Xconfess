# [09] feat(frontend): implement dashboard landing page

## Summary
`app/(dashboard)/page.tsx` is empty.

## Problem
Dashboard route exists but has no UI/flow.

## Scope
- Create dashboard landing with user summary + recent confessions list placeholder.
- Handle loading and empty state.

## Files
- `xconfess-frontend/app/(dashboard)/page.tsx`
- `xconfess-frontend/app/(dashboard)/layout.tsx`

## Acceptance Criteria
- Dashboard route renders usable content.
- Page is mobile-friendly.
- No runtime errors with missing data.

## Labels
`feature` `frontend` `ui`

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
