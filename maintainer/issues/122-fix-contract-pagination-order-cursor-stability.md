# [122] fix(contract): enforce stable ordering and cursor pagination for read-heavy registries

## Summary
Add deterministic cursor pagination for confession/report listings to support reliable off-chain consumption.

## Problem
Offset-like access patterns and unstable ordering make incremental indexing and client pagination error-prone.

## Scope
- Implement cursor-based read methods for confession and report registries.
- Guarantee deterministic ordering (primary by created sequence, secondary by id).
- Return next-cursor metadata and boundary-safe empty responses.

## Files
- `xconfess-contract/src/confession.*`
- `xconfess-contract/src/report.*`
- `xconfess-contract/src/lib.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- Read methods provide stable ordering across repeated calls.
- Cursor pagination does not skip or duplicate records.
- Tests cover first page, middle page, final page, and empty dataset.

## Labels
`bug` `contract` `read-model` `reliability`

## How To Test
1. Seed records and paginate through full dataset using returned cursors.
2. Confirm record sequence is deterministic and complete.
3. Validate no duplicates/skips when reading page-by-page.
