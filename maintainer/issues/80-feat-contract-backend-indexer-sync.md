# [80] feat(fullstack): implement backend indexer to sync contract events into API read models

## Summary
Create backend event indexing pipeline for contract events consumed by API endpoints.

## Problem
On-chain events are not reflected in backend query models, so frontend cannot consume chain state.

## Scope
- Add backend indexer service to consume contract event stream.
- Persist normalized read models for confessions/reactions/reports.
- Add cursor/checkpoint handling for restart-safe syncing.

## Files
- `xconfess-backend/src/chain/indexer.service.ts` (new)
- `xconfess-backend/src/chain/chain.module.ts` (new)
- `xconfess-backend/src/common/entities/*` (if new read models)
- `xconfess-backend/.env.sample`

## Acceptance Criteria
- Indexer catches up from configured start block/cursor.
- Restart resumes from last persisted checkpoint.
- API read endpoints expose indexed chain-backed records.

## Labels
`feature` `backend` `contract` `indexing`

## How To Test
1. Emit sample contract events in local dev network.
2. Run backend indexer and verify DB projections.
3. Restart indexer and confirm resume from checkpoint.