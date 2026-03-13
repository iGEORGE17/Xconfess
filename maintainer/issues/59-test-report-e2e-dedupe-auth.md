# [59] test(backend): add report e2e coverage for dedupe and auth variants

## Summary
Report logic has nuanced behavior (anonymous vs authenticated, 24h dedupe) that needs stronger e2e guarantees.

## Problem
Without e2e coverage, regressions in dedupe/auth policy can ship unnoticed.

## Scope
- Add e2e tests for anonymous report creation.
- Add e2e tests for authenticated report creation.
- Add e2e tests for 24-hour duplicate rejection.

## Files
- `xconfess-backend/test/*.e2e-spec.ts`
- `xconfess-backend/src/report/**/*.ts` (as needed for testability)

## Acceptance Criteria
- E2E suite covers success and duplicate-failure paths.
- Tests assert status codes and response messages.
- CI-ready deterministic setup for report tests.

## Labels
`test` `backend` `moderation` `high priority`

## How To Test
1. Run `npm run test:e2e --workspace=xconfess-backend`.
2. Confirm new report e2e cases pass.
3. Verify duplicate case fails with expected 4xx response.
