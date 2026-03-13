# [53] feat(backend): support distributed rate limiting with Redis-backed store

## Summary
Current rate limiter uses in-memory `Map`, which is not shared across instances.

## Problem
Horizontal scaling bypasses effective rate limiting and creates inconsistent enforcement.

## Scope
- Introduce Redis-backed rate-limit store.
- Keep local in-memory fallback for dev mode.
- Make backend rate-limit backend configurable by env.

## Files
- `xconfess-backend/src/auth/guard/rate-limit.guard.ts`
- `xconfess-backend/src/config/rate-limit.config.ts`
- `xconfess-backend/src/app.module.ts`

## Acceptance Criteria
- Rate limits are consistent across multiple app instances.
- Redis store can be toggled/configured via env.
- Existing rate-limit response format is preserved.

## Labels
`feature` `backend` `scalability` `security`

## How To Test
1. Run two app instances against same Redis.
2. Send requests from same client across both instances.
3. Confirm limit enforcement is shared.
