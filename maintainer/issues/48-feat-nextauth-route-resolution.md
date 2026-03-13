# [48] feat(frontend): implement or remove empty NextAuth catch-all route

## Summary
`app/api/auth/[...nextauth]/route.ts` is empty.

## Problem
Empty auth route creates confusion about active auth strategy and breaks expected NextAuth behavior if referenced.

## Scope
- Either implement full NextAuth handler or remove route entirely.
- Update frontend auth integration docs and usage accordingly.
- Ensure only one auth strategy is active.

## Files
- `xconfess-frontend/app/api/auth/[...nextauth]/route.ts`
- `xconfess-frontend/app/lib/api/auth.ts`
- `xconfess-frontend/README.md`

## Acceptance Criteria
- No empty auth API route remains.
- Auth strategy is explicit in code/docs.
- App auth flows match implemented strategy.

## Labels
`feature` `frontend` `auth` `architecture`

## How To Test
1. Run frontend auth flow.
2. Hit `/api/auth/*` endpoints if NextAuth is chosen.
3. Confirm no dead/unused auth route remains.
