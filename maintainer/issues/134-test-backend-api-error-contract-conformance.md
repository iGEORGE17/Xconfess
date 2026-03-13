# [134] test(backend): add API error contract conformance suite and global error envelope standardization

## Summary
Standardize backend error responses and add conformance tests across key modules.

## Problem
Different modules throw inconsistent error shapes/status details, making frontend handling and observability brittle.

## Scope
- Define one error envelope contract (status, message, code, timestamp, requestId).
- Add/extend global exception filter to enforce envelope for known exception classes.
- Add e2e tests validating error contract across auth, confession, report, and notification endpoints.

## Files
- `xconfess-backend/src/common/filters/http-exception.filter.ts` (new)
- `xconfess-backend/src/main.ts`
- `xconfess-backend/src/common/filters/throttler-exception.filter.ts`
- `xconfess-backend/test/api-error-contract.e2e-spec.ts` (new)

## Acceptance Criteria
- Error responses follow one consistent JSON shape across covered modules.
- E2E tests fail on envelope regressions or missing required fields.
- Frontend can rely on stable error contract for UI and logging.

## Labels
`test` `backend` `api` `quality`

## How To Test
1. Trigger representative 400/401/403/404/429/500 responses.
2. Verify each response matches defined error envelope fields.
3. Run conformance e2e suite and confirm pass/fail behavior on schema drift.
