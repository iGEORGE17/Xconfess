# [144] feat(contract): require quorum approvals for critical governance actions

## Summary
Introduce multi-approver quorum checks for high-impact admin operations.

## Problem
Single-admin execution, even with timelock, can still create a single-key failure domain for critical actions.

## Scope
- Define critical actions requiring quorum (pause, config updates, admin role changes).
- Add proposal + approval + execution flow with minimum approval threshold.
- Emit governance events for proposal, approval, revoke-approval, and execution.

## Files
- `xconfess-contract/src/access-control.*`
- `xconfess-contract/src/lib.*`
- `xconfess-contract/src/events.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- Critical actions cannot execute without required quorum approvals.
- Approval revocation updates executability deterministically.
- Unauthorized approvals/executions fail with stable error codes.

## Labels
`feature` `contract` `security` `governance`

## How To Test
1. Propose critical action and attempt execute before quorum (expect failure).
2. Add approvals to threshold and execute (expect success).
3. Revoke approval before execution and confirm action blocks again.
