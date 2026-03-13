# [120] test(contract): add invariant/property-based suite for core state integrity

## Summary
Add property-based and invariant tests to validate contract state correctness across randomized action sequences.

## Problem
Example-based tests may miss edge-case interactions between confession, reaction, and report flows.

## Scope
- Add invariant tests for counter consistency, valid status transitions, and role restrictions.
- Generate randomized multi-actor action sequences across create/react/report/resolve paths.
- Assert event emission invariants and no impossible states after each sequence.

## Files
- `xconfess-contract/test/invariants/*` (new)
- `xconfess-contract/src/lib.*`
- `xconfess-contract/src/confession.*`
- `xconfess-contract/src/reaction.*`
- `xconfess-contract/src/report.*`

## Acceptance Criteria
- Invariant suite runs in CI and detects state integrity violations.
- Core invariants are documented and mapped to test assertions.
- Flaky randomized tests are controlled via deterministic seeds.

## Labels
`test` `contract` `quality` `qa`

## How To Test
1. Run contract test suite including invariant/property tests.
2. Execute with fixed seed and confirm deterministic results.
3. Run multiple seeds and confirm invariants hold across sequences.
