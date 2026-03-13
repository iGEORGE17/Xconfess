# [128] feat(frontend): add request correlation and structured client error context

## Summary
Attach request correlation metadata to frontend API calls and error logs for faster incident debugging.

## Problem
Frontend errors lack stable request correlation context, making backend/ops tracing slower during incidents.

## Scope
- Generate/request correlation id per API request and pass via headers.
- Capture structured client error context (route, action, request id, status).
- Surface correlation id in user-facing error state for support handoff.

## Files
- `xconfess-frontend/app/lib/api/client.ts`
- `xconfess-frontend/app/api/confessions/route.ts`
- `xconfess-frontend/app/components/common/ErrorBoundary.tsx`
- `xconfess-frontend/app/components/confession/ConfessionFeed.tsx`

## Acceptance Criteria
- API requests include stable correlation header/id.
- Error logs include route + request id + status metadata.
- Support can map frontend failure to backend logs using correlation id.

## Labels
`feature` `frontend` `observability` `reliability`

## How To Test
1. Trigger a failing API request and inspect client error payload/log.
2. Confirm correlation id is present in request headers and error UI metadata.
3. Verify same id can be traced in backend logs.
