# [126] fix(frontend): migrate auth token handling from localStorage to secure session strategy

## Summary
Replace browser localStorage token persistence with a safer session approach to reduce XSS blast radius.

## Problem
Auth tokens are currently stored in localStorage, which increases risk of token theft through injected scripts.

## Scope
- Replace localStorage token reads/writes in login/logout/auth checks.
- Introduce secure session transport pattern (HttpOnly cookie or server session proxy).
- Update auth client utilities and route guards to rely on session state, not raw token strings.

## Files
- `xconfess-frontend/app/(auth)/login/page.tsx`
- `xconfess-frontend/app/lib/hooks/useAuth.ts`
- `xconfess-frontend/app/lib/api/client.ts`
- `xconfess-frontend/app/lib/api/auth.ts`
- `xconfess-frontend/app/api/auth/session/route.ts` (new)

## Acceptance Criteria
- Frontend no longer stores access tokens in localStorage.
- Authenticated calls work through secure session mechanism.
- Logout invalidates session reliably across tabs/routes.

## Labels
`bug` `frontend` `security` `auth`

## How To Test
1. Log in and verify no access token is persisted in localStorage.
2. Call protected endpoints and confirm session-authenticated behavior.
3. Log out and confirm protected routes/API calls are blocked.
