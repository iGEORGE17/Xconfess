# [01] fix(frontend): use correct backend auth endpoints

## Summary
Frontend auth pages call `/auth/login` and `/auth/register`, but backend exposes `/users/login` and `/users/register`.

## Problem
Contributors cannot complete login/register flow because routes do not match backend controllers.

## Scope
- Update frontend auth requests to use backend route contract.
- Verify success and error handling behavior in forms.

## Files
- `xconfess-frontend/app/(auth)/login/page.tsx`
- `xconfess-frontend/app/(auth)/register/page.tsx`
- `xconfess-backend/src/user/user.controller.ts`

## Acceptance Criteria
- Login requests go to `/users/login`.
- Register requests go to `/users/register`.
- UI shows backend validation/auth errors clearly.
- Successful login redirects to dashboard.

## Labels
`bug` `frontend` `auth` `good first issue`

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
