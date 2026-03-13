# [142] feat(contract): add monotonic event nonce ordering for entity-level trace consistency

## Summary
Introduce monotonic event nonces so indexers and consumers can deterministically order entity lifecycle events.

## Problem
Timestamp and block-order assumptions alone can produce ambiguous ordering and make gap detection difficult in downstream event processing.

## Scope
- Add per-entity or per-stream nonce increment on every state-changing event.
- Include nonce in confession/reaction/report/governance event payloads.
- Provide read method(s) to query latest nonce for reconciliation.

## Files
- `xconfess-contract/src/events.*`
- `xconfess-contract/src/lib.*`
- `xconfess-contract/src/confession.*`
- `xconfess-contract/src/reaction.*`
- `xconfess-contract/src/report.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- All state-changing event streams emit deterministic monotonic nonce values.
- Indexer can detect missing/duplicate/out-of-order events using nonce checks.
- Nonce behavior is covered by unit and integration tests.

## Labels
`feature` `contract` `events` `indexing`

## How To Test
1. Trigger sequential actions for the same entity and inspect emitted nonces.
2. Confirm nonce increments by exactly one per emitted event in stream.
3. Simulate replay/out-of-order ingestion and verify gaps are detectable.
