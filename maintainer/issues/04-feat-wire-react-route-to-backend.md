# [04] feat(frontend): wire reaction route handler to backend

## Summary
`/api/confessions/[id]/react` is currently a placeholder route with no persistence.

## Problem
Reaction button appears to work but does not update backend data.

## Scope
- Forward reaction requests to backend API.
- Validate reaction payload.
- Return meaningful error status/messages.

## Files
- `xconfess-frontend/app/api/confessions/[id]/react/route.ts`
- `xconfess-frontend/app/components/confession/ReactionButtons.tsx`

## Acceptance Criteria
- Reaction endpoint persists reaction via backend.
- Invalid type returns 400.
- Failed backend response returns non-200 and UI rolls back optimistic state.

## Labels
`feature` `frontend` `api`

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
