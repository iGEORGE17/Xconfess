# [67] feat(backend): support idempotency key on report creation endpoint

## Summary
Prevent accidental duplicate report submissions during retries/timeouts.

## Problem
Client retries can create multiple near-identical reports for the same event.

## Scope
- Accept `Idempotency-Key` header on report create route.
- Store key and response linkage for replay-safe handling.
- Return prior successful response for duplicate key reuse.

## Files
- `xconfess-backend/src/report/reports.controller.ts`
- `xconfess-backend/src/report/reports.service.ts`
- `xconfess-backend/src/report/report.entity.ts`
- `xconfess-backend/migrations/*`

## Acceptance Criteria
- Same authenticated user + same idempotency key returns one logical creation.
- Replayed requests return stable response payload.
- Key collision across different users is isolated.

## Labels
`feature` `backend` `api` `reliability`

## How To Test
1. Submit report request twice with same idempotency key.
2. Verify only one report record is persisted.
3. Repeat with different users and confirm isolation.