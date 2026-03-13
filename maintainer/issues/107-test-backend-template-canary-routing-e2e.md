# [107] test(backend): add e2e coverage for template canary routing and promotion/rollback flow

## Summary
Add deterministic end-to-end tests for canary version selection, promotion, and rollback behavior.

## Problem
Canary rollout logic can regress silently without integration tests that validate routing decisions across real queue/email paths.

## Scope
- Add e2e tests for active+canary split, 0% canary, and 100% canary scenarios.
- Verify deterministic recipient-to-version mapping remains stable across repeated sends.
- Validate promotion/rollback transitions do not route to retired versions.

## Files
- `xconfess-backend/test/notification-template-canary.e2e-spec.ts` (new)
- `xconfess-backend/src/email/email.service.ts`
- `xconfess-backend/src/notification/notification.queue.ts`

## Acceptance Criteria
- E2E suite proves deterministic version assignment per recipient.
- Promotion/rollback cases assert expected routing immediately after config change.
- Tests fail if canary percent handling or routing stability regresses.

## Labels
`test` `backend` `email` `release`

## How To Test
1. Run backend e2e suite including canary template spec.
2. Confirm deterministic split for fixed recipient fixtures.
3. Confirm rollback restores 100% active-version routing.
