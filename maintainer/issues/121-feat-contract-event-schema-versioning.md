# [121] feat(contract): add explicit event schema versioning for indexer compatibility

## Summary
Version contract event payloads so downstream indexers can evolve safely without brittle decoder assumptions.

## Problem
Event field changes can silently break backend ingestion when payload shape is not versioned.

## Scope
- Add `eventVersion` metadata to core emitted events (confession, reaction, report, role).
- Standardize event field names/order for stable decode contracts.
- Add backward-compatible decoder tests for supported event versions.

## Files
- `xconfess-contract/src/events.*`
- `xconfess-contract/src/lib.*`
- `xconfess-contract/src/confession.*`
- `xconfess-contract/src/reaction.*`
- `xconfess-contract/src/report.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- All core events include explicit schema version metadata.
- Existing consumers can continue decoding supported versions.
- Tests fail on accidental event signature/schema drift.

## Labels
`feature` `contract` `events` `indexing`

## How To Test
1. Emit each core event and inspect payload for `eventVersion`.
2. Run decoder compatibility tests for current and prior supported versions.
3. Confirm event schema drift is detected by tests.
