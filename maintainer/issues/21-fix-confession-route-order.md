# [21] fix(backend): move /confessions/trending/top above /confessions/:id

## Summary
`@Get(':id')` can shadow static routes when route order is wrong.

## Problem
`/confessions/trending/top` may be interpreted as an `id` route.

## Scope
- Reorder controller route handlers to prioritize static paths.
- Add regression test for route resolution.

## Files
- `xconfess-backend/src/confession/confession.controller.ts`
- `xconfess-backend/src/confession/confession.controller.spec.ts`

## Acceptance Criteria
- `/confessions/trending/top` resolves correctly.
- `/confessions/:id` still resolves valid confession IDs.
- Tests cover both routes.

## Labels
`bug` `backend` `routing`

## How To Test
### Prerequisites
- `npm install`
- Configure backend env in `xconfess-backend/.env`

### Run
- `npm run dev:backend`

### Verify
1. Call `GET /confessions/trending/top`.
2. Call `GET /confessions/<valid-uuid>`.
3. Confirm each hits the correct handler.
4. Run backend tests and confirm route regression test passes.
