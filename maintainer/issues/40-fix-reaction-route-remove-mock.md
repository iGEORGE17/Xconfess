# [40] fix(frontend): replace mock local reaction route with backend-integrated path

## Summary
`app/api/confessions/[id]/react/route.ts` currently returns mocked success and does not persist reactions.

## Problem
UI feedback implies success even when no backend mutation occurs, causing state drift and user confusion.

## Scope
- Replace mock route behavior with backend integration (or remove local proxy and call backend directly).
- Enforce validation for supported reaction types using shared constants.
- Ensure UI mutation handling reflects real backend response.

## Files
- `xconfess-frontend/app/api/confessions/[id]/react/route.ts`
- `xconfess-frontend/app/lib/api/reactions.ts`
- `xconfess-frontend/app/components/confession/ReactionButtons.tsx`
- `xconfess-backend/src/reaction/reaction.controller.ts` (if contract update needed)

## Acceptance Criteria
- React action persists server-side.
- Unsupported reaction type returns a validation error.
- UI state remains consistent after refresh.

## Labels
`bug` `frontend` `backend` `api`

## How To Test
### Run
- Start backend and frontend

### Verify
1. Trigger reaction and confirm backend write.
2. Reload page and confirm reaction count/state persists.
3. Confirm invalid reaction payload is rejected.
