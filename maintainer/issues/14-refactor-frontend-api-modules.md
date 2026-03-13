# [14] refactor(frontend): implement missing API client modules

## Summary
`app/lib/api/confessions.ts` and `app/lib/api/reactions.ts` are empty.

## Problem
Data access is scattered and inconsistent across components/routes.

## Scope
- Add typed API functions for confessions and reactions.
- Reuse in hooks/components instead of inline fetch logic.

## Files
- `xconfess-frontend/app/lib/api/confessions.ts`
- `xconfess-frontend/app/lib/api/reactions.ts`
- `xconfess-frontend/app/components/confession/ConfessionFeed.tsx`

## Acceptance Criteria
- API modules export reusable typed methods.
- Feed/reaction components use shared methods.
- Errors are normalized for UI consumption.

## Labels
`refactor` `frontend` `api`

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
