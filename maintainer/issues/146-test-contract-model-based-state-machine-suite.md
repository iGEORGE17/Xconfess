# [146] test(contract): add model-based state-machine suite for lifecycle correctness

## Summary
Introduce model-based tests comparing on-chain behavior against a reference state machine.

## Problem
Invariant/property tests may still miss semantic regressions in action sequencing and transition logic.

## Scope
- Define reference model for confession/reaction/report/governance lifecycle.
- Generate randomized action sequences and compare contract state to model state after each step.
- Add deterministic seed controls and failure replay output.

## Files
- `xconfess-contract/test/model/*` (new)
- `xconfess-contract/src/confession.*`
- `xconfess-contract/src/reaction.*`
- `xconfess-contract/src/report.*`
- `xconfess-contract/src/access-control.*`

## Acceptance Criteria
- Model-based suite catches state-machine divergence regressions.
- Failing seeds are reproducible and easy to replay.
- CI includes model-based suite with acceptable runtime budget.

## Labels
`test` `contract` `quality` `qa`

## How To Test
1. Run model-based suite with fixed seed and verify deterministic results.
2. Run multiple seeds and confirm no model divergence.
3. Introduce intentional transition bug and verify suite fails.
