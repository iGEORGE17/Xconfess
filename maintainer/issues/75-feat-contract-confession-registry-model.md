# [75] feat(contract): implement on-chain confession registry data model

## Summary
Define and implement the base contract storage model for confession records.

## Problem
No canonical on-chain schema exists for confession identity, ownership, and metadata hash.

## Scope
- Define confession struct/schema (id, author, content hash, timestamps, status).
- Implement create/read functions with access rules.
- Emit events for create/update/delete state transitions.

## Files
- `xconfess-contract/src/lib.*`
- `xconfess-contract/src/confession.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- Confession create/read paths are deterministic and test-covered.
- Invalid input and unauthorized actions revert/fail cleanly.
- Events expose enough data for backend indexing.

## Labels
`feature` `contract` `core` `data-model`

## How To Test
1. Run contract unit tests for create/read scenarios.
2. Verify event emissions and schema serialization.
3. Confirm invalid operations fail with expected errors.