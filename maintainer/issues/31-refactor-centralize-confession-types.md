# [31] refactor(frontend): centralize confession type definitions

## Summary
Confession interfaces are duplicated across hooks and components.

## Problem
Type drift creates subtle bugs and inconsistent assumptions.

## Scope
- Define canonical confession types in `lib/types`.
- Replace duplicate inline interfaces.

## Files
- `xconfess-frontend/app/lib/types/confession.ts`
- `xconfess-frontend/app/components/confession/*.tsx`
- `xconfess-frontend/app/lib/hooks/useConfessions.ts`

## Acceptance Criteria
- Single confession type source of truth.
- All consumers import shared types.
- TypeScript build passes.

## Labels
`refactor` `frontend` `types`

## How To Test
### Prerequisites
- `npm install`

### Run
- `npm run dev:frontend`
- `npm run build --workspace=xconfess-frontend`

### Verify
1. Confirm no duplicate interface declarations remain for confession model.
2. Validate feed and cards still render correctly.
