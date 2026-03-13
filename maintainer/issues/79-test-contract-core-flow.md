# [79] test(contract): add integration tests for end-to-end confession to moderation flow

## Summary
Build contract integration tests covering realistic multi-actor lifecycle scenarios.

## Problem
Unit tests alone miss cross-module regressions in state transitions and event order.

## Scope
- Add integration test for create confession, react, report, resolve.
- Verify event sequence and persisted state after each step.
- Include negative-path scenarios (invalid role, duplicate actions).

## Files
- `xconfess-contract/test/integration/*`
- `xconfess-contract/src/lib.*`

## Acceptance Criteria
- Integration suite validates full happy path and critical rejection paths.
- Event ordering is deterministic and documented.
- Test suite runs in CI in acceptable time budget.

## Labels
`test` `contract` `integration` `qa`

## How To Test
1. Run contract integration test command.
2. Validate both happy-path and negative-path cases pass.
3. Confirm deterministic output across repeated runs.