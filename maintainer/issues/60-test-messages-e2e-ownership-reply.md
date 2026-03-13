# [60] test(backend): add message flow e2e tests for ownership and reply constraints

## Summary
Message workflows include ownership/permission edge cases that are not fully protected by integration tests.

## Problem
Permission regressions (author-only view/reply, no self-message) are high risk without e2e safety net.

## Scope
- Add e2e tests for sending message to confession author.
- Add e2e tests for forbidden self-message.
- Add e2e tests for author-only reply and single-reply enforcement.

## Files
- `xconfess-backend/test/*.e2e-spec.ts`
- `xconfess-backend/src/messages/**/*.ts` (if test hooks needed)

## Acceptance Criteria
- E2E cases validate role/ownership constraints.
- Reply duplicate attempts are rejected.
- Unauthorized users cannot read author-only message threads.

## Labels
`test` `backend` `messages` `auth`

## How To Test
1. Run message e2e suite.
2. Confirm ownership and forbidden paths are covered.
3. Validate response codes/messages for each constraint.
