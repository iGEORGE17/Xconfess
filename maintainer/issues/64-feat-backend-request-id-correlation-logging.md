# [64] feat(backend): add request-id middleware and correlation logging

## Summary
Introduce per-request correlation IDs to improve tracing across logs and async tasks.

## Problem
Current logs are hard to connect across middleware, controllers, and background jobs.

## Scope
- Add request-id middleware (honor incoming header or generate UUID).
- Attach request id to structured logger context.
- Include request id in error responses and audit log writes where relevant.

## Files
- `xconfess-backend/src/main.ts`
- `xconfess-backend/src/middleware/**/*.ts`
- `xconfess-backend/src/logger/**/*.ts`
- `xconfess-backend/src/audit-log/**/*.ts`

## Acceptance Criteria
- Every API request has a stable request ID through lifecycle.
- Logs include request ID for controller/service error paths.
- Clients receive request ID in response header for support/debugging.

## Labels
`feature` `backend` `observability` `logging`

## How To Test
1. Send requests with and without `x-request-id` header.
2. Verify response includes request id.
3. Confirm backend logs correlate to the same request id.