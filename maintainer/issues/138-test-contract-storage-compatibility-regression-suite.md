# [138] test(contract): add storage compatibility regression suite for schema evolution

## Summary
Protect future upgrades by validating storage layout and decode compatibility across versions.

## Problem
Schema evolution can break state decoding or migration assumptions without explicit compatibility tests.

## Scope
- Add compatibility fixtures representing prior state versions.
- Test that current code can read/interpret older persisted state safely.
- Add CI gate for storage compatibility regressions.

## Files
- `xconfess-contract/test/storage-compat/*` (new)
- `xconfess-contract/src/lib.*`
- `xconfess-contract/src/confession.*`
- `xconfess-contract/src/report.*`
- `.github/workflows/contract-compat.yml` (new)

## Acceptance Criteria
- Compatibility tests detect breaking state schema changes.
- Known legacy fixtures remain readable in current build.
- CI fails on unapproved storage incompatibilities.

## Labels
`test` `contract` `upgrade` `quality`

## How To Test
1. Run storage compatibility test suite locally.
2. Verify legacy fixtures decode successfully.
3. Introduce breaking schema change and confirm CI/test failure.
