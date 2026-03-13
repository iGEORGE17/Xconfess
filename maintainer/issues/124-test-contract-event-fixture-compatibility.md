# [124] test(contract): add golden event fixture suite for backward compatibility

## Summary
Snapshot canonical event outputs and validate future contract changes against fixture baselines.

## Problem
Event regressions can pass unit tests but still break downstream decoders when payload shape/order changes.

## Scope
- Generate golden fixtures for core events from deterministic test scenarios.
- Add fixture comparison tests in contract CI.
- Document fixture update policy for intentional schema changes.

## Files
- `xconfess-contract/test/event-fixtures/*` (new)
- `xconfess-contract/test/*`
- `xconfess-contract/src/events.*`
- `xconfess-contract/README.md`

## Acceptance Criteria
- Fixture suite detects unexpected event payload/signature changes.
- Intentional schema updates require explicit fixture refresh.
- CI includes fixture compatibility checks for every PR.

## Labels
`test` `contract` `events` `qa`

## How To Test
1. Run contract tests including event fixture checks.
2. Introduce event field change and confirm fixture test fails.
3. Update fixture intentionally and verify suite passes.
