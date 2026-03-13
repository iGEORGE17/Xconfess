# [51] fix(frontend): replace hard reload auth redirect with router-aware flow

## Summary
Axios response interceptor redirects via `window.location.href` on 401.

## Problem
Hard navigation can discard app state unexpectedly and is harder to test/control in App Router flows.

## Scope
- Replace global hard redirect with controlled auth state handling.
- Route unauthenticated users via app-level auth guard/router logic.
- Prevent redirect loops for public routes.

## Files
- `xconfess-frontend/app/lib/api/client.ts`
- `xconfess-frontend/app/lib/hooks/useAuth.ts`
- `xconfess-frontend/app/(dashboard)/layout.tsx`

## Acceptance Criteria
- 401 handling clears auth state without forced full reload.
- Protected routes redirect predictably.
- Public routes remain accessible after auth failure.

## Labels
`bug` `frontend` `auth` `routing`

## How To Test
1. Force a 401 on protected API call.
2. Confirm app redirects using router flow.
3. Ensure no reload loop on public pages.
