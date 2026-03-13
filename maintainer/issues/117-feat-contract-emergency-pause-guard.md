# [117] feat(contract): add emergency pause guard for write paths with admin-controlled unpause

## Summary
Introduce a contract-level pause mechanism to stop state-changing operations during incidents.

## Problem
Without an emergency pause, critical bugs or abuse can continue mutating on-chain state while mitigation is in progress.

## Scope
- Add global paused state with owner/admin pause and unpause actions.
- Guard all write functions (create/reaction/report/status updates) while allowing safe read methods.
- Emit pause/unpause events with actor and reason metadata.

## Files
- `xconfess-contract/src/access-control.*`
- `xconfess-contract/src/lib.*`
- `xconfess-contract/src/confession.*`
- `xconfess-contract/src/reaction.*`
- `xconfess-contract/src/report.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- Paused state blocks all configured write entry points.
- Only authorized role can pause/unpause.
- Events are emitted and test-covered for pause transitions.

## Labels
`feature` `contract` `security` `operations`

## How To Test
1. Execute write actions in normal mode and confirm success.
2. Pause contract and verify write actions fail with expected error.
3. Unpause and confirm writes resume correctly.
