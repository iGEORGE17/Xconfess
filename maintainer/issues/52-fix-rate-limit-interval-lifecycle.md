# [52] fix(backend): prevent interval leak in rate-limit guard lifecycle

## Summary
Rate-limit guard starts a cleanup `setInterval` in constructor without lifecycle teardown.

## Problem
Long-lived/parallel app contexts can leak timers and create unnecessary memory/CPU usage.

## Scope
- Store interval handle and clear on module destroy.
- Move periodic cleanup to managed lifecycle hook.
- Keep behavior unchanged for request handling.

## Files
- `xconfess-backend/src/auth/guard/rate-limit.guard.ts`

## Acceptance Criteria
- Guard cleanup interval is disposed during shutdown.
- No duplicate cleanup timers accumulate across instances.
- Rate limiting behavior remains intact.

## Labels
`bug` `backend` `performance` `ops`

## How To Test
1. Start/stop app repeatedly in dev/test.
2. Confirm no orphan interval activity after shutdown.
3. Validate rate limiting still triggers as expected.
