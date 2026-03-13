# [03] refactor(frontend): unify duplicate useAuth implementations

## Summary
There are conflicting `useAuth` implementations (mock and API-based).

## Problem
Different components use different auth logic, causing inconsistent user state.

## Scope
- Keep one `useAuth` implementation.
- Remove or replace mock behavior.
- Ensure header and protected pages use same source.

## Files
- `xconfess-frontend/app/lib/hooks/useAuth.ts`
- `xconfess-frontend/app/lib/api/auth.ts`
- `xconfess-frontend/app/components/layout/Header.tsx`

## Acceptance Criteria
- Only one canonical auth hook remains.
- No hardcoded mock user values.
- Header reflects real login/logout state.

## Labels
`bug` `frontend` `cleanup`

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
