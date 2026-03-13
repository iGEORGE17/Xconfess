# [93] fix(frontend): remove synthetic fallback responses from confessions proxy

## Summary
Stop returning hardcoded demo payloads when backend requests fail.

## Problem
The proxy currently returns HTTP 200 with synthetic confessions on upstream failure, masking real outages and corrupting operational signals.

## Scope
- Remove hardcoded fallback payload blocks in non-OK and catch paths.
- Propagate backend status/error details safely to client.
- Add structured error payload shape for frontend handling.

## Files
- `xconfess-frontend/app/api/confessions/route.ts`
- `xconfess-frontend/app/components/confession/ConfessionFeed.tsx`

## Acceptance Criteria
- Upstream failures no longer return fake confession data.
- Client receives non-200 status and stable error schema.
- Observability/logging can distinguish backend errors from empty data.

## Labels
`bug` `frontend` `api` `reliability`

## How To Test
1. Force backend `/confessions` to return 500.
2. Call frontend `/api/confessions` and verify non-200 propagation.
3. Confirm feed displays error state instead of demo content.
