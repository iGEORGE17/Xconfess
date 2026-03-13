# [73] test(backend): add e2e tests for global and route-level throttling policy

## Summary
Cover request throttling behavior with deterministic e2e tests.

## Problem
Rate limit regressions are hard to catch without explicit integration tests.

## Scope
- Add e2e cases for default throttle limits.
- Add tests for route-specific overrides/exemptions.
- Verify 429 response payload/headers and reset behavior.

## Files
- `xconfess-backend/test/*.e2e-spec.ts`
- `xconfess-backend/src/auth/guard/rate-limit.guard.ts`
- `xconfess-backend/src/config/throttle.config.ts`

## Acceptance Criteria
- Requests above configured limit return 429 reliably.
- Route overrides behave as configured.
- Limits reset after TTL window.

## Labels
`test` `backend` `security` `rate-limit`

## How To Test
1. Run dedicated throttling e2e suite.
2. Verify pass/fail behavior for normal and over-limit traffic.
3. Confirm headers include rate-limit metadata where expected.