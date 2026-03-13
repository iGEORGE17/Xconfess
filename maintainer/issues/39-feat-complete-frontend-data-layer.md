# [39] feat(frontend): complete API/hooks/provider data layer wiring

## Summary
Core frontend data-layer files are empty (`QueryProvider`, confessions/reactions API modules, reaction hook, auth store, utility/types).

## Problem
Current UI cannot rely on a consistent typed client state/data model, causing ad hoc fetch logic and duplicated behavior.

## Scope
- Implement `QueryProvider` and wrap app tree where needed.
- Implement `lib/api/confessions.ts` and `lib/api/reactions.ts`.
- Implement `useReactions` and central auth store.
- Add minimal shared type/util coverage for used models.

## Files
- `xconfess-frontend/app/components/providers/QueryProvider.tsx`
- `xconfess-frontend/app/lib/api/confessions.ts`
- `xconfess-frontend/app/lib/api/reactions.ts`
- `xconfess-frontend/app/lib/hooks/useReactions.ts`
- `xconfess-frontend/app/lib/store/authStore.ts`
- `xconfess-frontend/app/lib/types/reaction.ts`
- `xconfess-frontend/app/lib/types/user.ts`

## Acceptance Criteria
- Data-fetching goes through shared API modules/hooks.
- React Query provider is mounted and queries work without runtime errors.
- No empty core data-layer files remain in listed scope.

## Labels
`feature` `frontend` `architecture` `devex`

## How To Test
### Run
- `npm run dev:frontend`

### Verify
1. Confession list and reactions fetch via new modules.
2. Query cache invalidation/refetch works after reaction actions.
3. Type checks pass for added API contracts.
