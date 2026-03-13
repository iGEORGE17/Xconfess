# [13] feat(frontend): implement ConfessionForm component

## Summary
`ConfessionForm.tsx` is currently empty.

## Problem
Users cannot submit new confessions from frontend UI.

## Scope
- Build form with validation and submit state.
- Connect to backend `POST /confessions`.

## Files
- `xconfess-frontend/app/components/confession/ConfessionForm.tsx`
- `xconfess-frontend/app/page.tsx`

## Acceptance Criteria
- Form validates required fields.
- Successful submit updates feed (optimistic or refetch).
- Failed submit shows actionable error message.

## Labels
`feature` `frontend` `confessions`

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
