# [77] feat(contract): implement report/flag registry and status transitions

## Summary
Introduce on-chain report records linked to confession identifiers.

## Problem
Moderation state cannot be audited end-to-end without immutable flag history.

## Scope
- Add report creation with normalized reason codes.
- Add status transition functions (open, reviewed, resolved, dismissed).
- Emit report lifecycle events for backend consumers.

## Files
- `xconfess-contract/src/report.*`
- `xconfess-contract/src/lib.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- Report lifecycle transitions enforce valid state machine rules.
- Unauthorized actors cannot resolve/dismiss reports.
- Events expose reason and state change metadata.

## Labels
`feature` `contract` `moderation` `reporting`

## How To Test
1. Execute tests for valid and invalid report transitions.
2. Verify access control on resolution paths.
3. Inspect emitted events for backend indexing fields.