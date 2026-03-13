# [143] test(contract): add adversarial abuse/griefing suite for anti-spam and boundary protections

## Summary
Create targeted adversarial tests to validate contract resilience against spammy and griefing interaction patterns.

## Problem
Happy-path and generic invariant tests may miss targeted abuse vectors such as repeated near-limit actions and boundary flooding.

## Scope
- Add tests for repeated actor spam patterns across create/react/report flows.
- Validate boundary protections (max sizes, duplicate suppression, cooldown windows, role checks).
- Add deterministic high-volume sequence tests to detect unexpected state growth or denial-of-service regressions.

## Files
- `xconfess-contract/test/adversarial/*` (new)
- `xconfess-contract/src/confession.*`
- `xconfess-contract/src/reaction.*`
- `xconfess-contract/src/report.*`
- `xconfess-contract/src/access-control.*`

## Acceptance Criteria
- Adversarial suite catches abuse-pattern regressions in CI.
- Boundary and anti-spam controls are explicitly validated.
- Tests are deterministic and reproducible with fixed seeds.

## Labels
`test` `contract` `security` `qa`

## How To Test
1. Run contract tests including adversarial suite.
2. Execute with fixed seed and verify deterministic outcomes.
3. Confirm abuse scenarios fail safely without corrupting state.
