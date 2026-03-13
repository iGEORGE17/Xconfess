# [137] feat(contract): add state snapshot and checkpoint read interfaces for indexer bootstrap

## Summary
Provide deterministic checkpoint reads to accelerate and simplify indexer backfill.

## Problem
Off-chain services lack efficient bootstrap methods and must replay full history for basic state reconstruction.

## Scope
- Add read methods to fetch checkpointed summaries (counts, latest ids, version markers).
- Add paged snapshot readers for confessions/reactions/reports from checkpoint anchors.
- Keep read outputs stable for backward-compatible indexer consumption.

## Files
- `xconfess-contract/src/lib.*`
- `xconfess-contract/src/confession.*`
- `xconfess-contract/src/reaction.*`
- `xconfess-contract/src/report.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- Indexer can bootstrap from snapshot+cursor without full replay.
- Snapshot reads are deterministic and test-covered.
- Read API outputs are versioned/documented for consumers.

## Labels
`feature` `contract` `indexing` `read-model`

## How To Test
1. Seed contract state and call snapshot/checkpoint methods.
2. Reconstruct state off-chain using returned pages and cursors.
3. Verify reconstructed totals match on-chain summaries.
