# [37] fix(fullstack): reconcile auth API contract and token key usage

## Summary
Frontend and backend auth contracts are inconsistent (`/auth/login` vs `/users/login`, `/auth/me` vs `/users/profile`, `token` vs `accessToken`).

## Problem
Mixed endpoint and token conventions cause fragile auth flows, stale sessions, and broken profile fetches.

## Scope
- Define canonical auth endpoints and response shape.
- Update frontend auth callers to use the same contract everywhere.
- Standardize one localStorage key (or migrate to cookie/session strategy).
- Remove stale/duplicate auth logic paths.

## Files
- `xconfess-frontend/app/(auth)/login/page.tsx`
- `xconfess-frontend/app/lib/api/client.ts`
- `xconfess-frontend/app/lib/api/auth.ts`
- `xconfess-frontend/app/lib/hooks/useAuth.ts`
- `xconfess-backend/src/user/user.controller.ts`
- `xconfess-backend/src/auth/auth.controller.ts`

## Acceptance Criteria
- Login, auth-check, and logout use one shared contract end-to-end.
- No mixed usage of `token` and `accessToken` remains.
- Profile fetch succeeds with valid token and fails predictably without one.

## Labels
`bug` `frontend` `backend` `auth` `high priority`

## How To Test
### Prerequisites
- Backend and frontend running

### Run
- Login with valid credentials
- Refresh app and navigate protected pages
- Logout and verify redirect/auth reset

### Verify
1. Token storage/read path is consistent.
2. Protected requests include expected auth header/session.
3. Invalid token path clears auth state and routes correctly.
