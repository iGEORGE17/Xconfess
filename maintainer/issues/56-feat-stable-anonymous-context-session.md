# [56] feat(backend): make anonymous context stable per user session window

## Summary
Anonymous context ID is regenerated on each request for authenticated users.

## Problem
Per-request regeneration prevents stable anonymous identity linkage within a session and reduces feature utility.

## Scope
- Generate/resolve anonymous context per session window (e.g., 24h).
- Reuse existing anonymous user/session services where possible.
- Expire/rotate context intentionally.

## Files
- `xconfess-backend/src/middleware/anonymous-context.middleware.ts`
- `xconfess-backend/src/user/anonymous-user.service.ts`
- related auth/session integration files

## Acceptance Criteria
- Same user session receives stable anonymous context ID.
- Context rotates by configured policy.
- Existing anonymity guarantees are maintained.

## Labels
`feature` `backend` `privacy` `sessions`

## How To Test
1. Make repeated authenticated requests in same session.
2. Confirm same context ID is reused.
3. Verify rotation occurs after configured expiry.
