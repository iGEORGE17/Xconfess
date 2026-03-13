# [29] fix(frontend): simplify Next route param typing in react API handler

## Summary
Current route handler typing for params is brittle and non-idiomatic.

## Problem
`params` typed as Promise can create confusion and break maintainability.

## Scope
- Use stable App Router handler signature.
- Keep runtime behavior unchanged.

## Files
- `xconfess-frontend/app/api/confessions/[id]/react/route.ts`

## Acceptance Criteria
- Type-safe handler signature without Promise wrapper for params.
- No TS errors.
- Reaction route still functions.

## Labels
`bug` `frontend` `nextjs` `types`

## How To Test
### Prerequisites
- `npm install`
- Frontend env configured

### Run
- `npm run dev:frontend`

### Verify
1. Send POST request to `/api/confessions/<id>/react`.
2. Confirm id is correctly extracted.
3. Run frontend typecheck/build and confirm no typing regressions.
