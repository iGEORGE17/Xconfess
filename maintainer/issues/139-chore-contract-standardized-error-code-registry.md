# [139] chore(contract): standardize error code registry and enforce deterministic failure mapping

## Summary
Define a canonical error code registry for all contract failure paths.

## Problem
Inconsistent error messages/codes make client handling and incident diagnosis difficult across modules.

## Scope
- Create shared error registry with stable symbolic codes.
- Refactor module failures to use registry codes consistently.
- Document code-to-reason mapping for backend/frontend consumers.

## Files
- `xconfess-contract/src/errors.*`
- `xconfess-contract/src/lib.*`
- `xconfess-contract/src/confession.*`
- `xconfess-contract/src/reaction.*`
- `xconfess-contract/src/report.*`
- `xconfess-contract/README.md`

## Acceptance Criteria
- Contract failures return stable, documented error codes.
- No module returns ad hoc/undocumented failure codes.
- Consumer docs include machine-readable error mapping.

## Labels
`chore` `contract` `api` `maintainability`

## How To Test
1. Trigger representative failure paths across modules.
2. Verify returned code matches registry mapping.
3. Confirm docs/tests stay in sync with error registry.
