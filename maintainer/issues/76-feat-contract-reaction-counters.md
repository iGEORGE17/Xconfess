# [76] feat(contract): add on-chain reaction counters with anti-double-vote constraints

## Summary
Add contract-level reaction tracking for confession entries.

## Problem
Reaction integrity is weak without deterministic on-chain constraints and replay protections.

## Scope
- Support reaction types (e.g., like/love) with per-confession counters.
- Enforce one active reaction per account per confession.
- Support reaction change/removal while preserving totals correctly.

## Files
- `xconfess-contract/src/reaction.*`
- `xconfess-contract/src/lib.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- Duplicate same-reaction submissions from same account are rejected or no-op by design.
- Counter updates remain accurate after reaction change/removal.
- Events emitted for add/update/remove reaction actions.

## Labels
`feature` `contract` `reactions` `integrity`

## How To Test
1. Run reaction unit tests for add/change/remove flows.
2. Verify totals for multi-user interactions.
3. Confirm duplicate vote constraints are enforced.