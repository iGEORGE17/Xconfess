# [15] feat(frontend): implement useReactions hook

## Summary
`app/lib/hooks/useReactions.ts` is empty.

## Problem
Reaction logic lives only inside component and cannot be reused/tested.

## Scope
- Create hook for optimistic reaction updates + rollback.
- Expose loading/error states and action function.

## Files
- `xconfess-frontend/app/lib/hooks/useReactions.ts`
- `xconfess-frontend/app/components/confession/ReactionButtons.tsx`

## Acceptance Criteria
- `ReactionButtons` uses hook.
- Hook supports optimistic update and rollback.
- Includes basic unit tests.

## Labels
`feature` `frontend` `hooks`

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
