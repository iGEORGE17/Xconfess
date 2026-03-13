# [11] feat(frontend): implement messages page

## Summary
`app/(dashboard)/messages/page.tsx` is empty.

## Problem
Messages route is linked from nav but non-functional.

## Scope
- Build messages page skeleton with list + selected thread panel.
- Integrate with backend messages endpoints (or explicit TODO stubs).

## Files
- `xconfess-frontend/app/(dashboard)/messages/page.tsx`
- `xconfess-frontend/app/lib/api/client.ts`

## Acceptance Criteria
- Messages page renders and handles empty/error states.
- Basic API integration for fetch (if auth token exists).
- Route is usable from header links.

## Labels
`feature` `frontend` `messages`

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
