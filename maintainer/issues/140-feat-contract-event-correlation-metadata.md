# [140] feat(contract): include optional correlation metadata in emitted events for cross-system tracing

## Summary
Add correlation metadata fields to emitted events so backend/frontend traces can be linked to on-chain actions.

## Problem
Cross-system incident debugging is slow when contract events cannot be reliably correlated with API requests/jobs.

## Scope
- Extend event payloads with optional correlation id/request context field.
- Ensure metadata is bounded and does not affect core event determinism.
- Update indexer contract to persist correlation metadata when present.

## Files
- `xconfess-contract/src/events.*`
- `xconfess-contract/src/lib.*`
- `xconfess-contract/test/*`
- `xconfess-backend/src/chain/indexer.service.ts`

## Acceptance Criteria
- Events can carry correlation metadata without breaking existing consumers.
- Indexer persists metadata for searchable traces.
- Tests validate presence/absence handling and payload bounds.

## Labels
`feature` `contract` `observability` `integration`

## How To Test
1. Emit events with and without correlation metadata.
2. Verify indexer ingestion preserves metadata correctly.
3. Query indexed records by correlation id and confirm traceability.
