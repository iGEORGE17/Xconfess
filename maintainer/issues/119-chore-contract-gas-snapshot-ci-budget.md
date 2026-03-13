# [119] chore(contract): add gas snapshot workflow with regression budget checks

## Summary
Track gas usage of core contract methods and fail CI on significant regressions.

## Problem
Gas costs can drift over time without visibility, making production execution increasingly expensive.

## Scope
- Add gas snapshot command for core methods (create, react, report, resolve).
- Commit baseline gas report and compare in CI.
- Add configurable regression threshold and actionable CI output.

## Files
- `xconfess-contract/package.json`
- `xconfess-contract/test/*`
- `.github/workflows/contract-gas.yml` (new)
- `xconfess-contract/README.md`

## Acceptance Criteria
- Gas snapshot is generated deterministically in local and CI runs.
- CI fails when method gas exceeds configured budget threshold.
- Documentation explains how to refresh baseline after approved optimizations.

## Labels
`chore` `contract` `ci` `performance`

## How To Test
1. Run gas snapshot command locally and verify baseline output.
2. Trigger CI workflow and confirm it checks against baseline.
3. Simulate regression and verify workflow fails with clear diff.
