# [02] refactor(frontend): standardize auth token storage key

## Summary
The frontend uses both `token` and `accessToken` keys in different places.

## Problem
Inconsistent token key usage breaks authenticated requests and logout behavior.

## Scope
- Define one token key constant.
- Apply everywhere: login, interceptors, auth checks, logout.

## Files
- `xconfess-frontend/app/(auth)/login/page.tsx`
- `xconfess-frontend/app/lib/api/client.ts`
- `xconfess-frontend/app/lib/api/auth.ts`

## Acceptance Criteria
- One shared token key is used across app.
- Authenticated requests consistently include Bearer token.
- Logout removes token and user state reliably.

## Labels
`bug` `frontend` `auth`

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
