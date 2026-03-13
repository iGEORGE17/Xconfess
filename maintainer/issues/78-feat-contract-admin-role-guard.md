# [78] feat(contract): add admin role management and privileged action guards

## Summary
Implement contract-level role control for moderation and emergency actions.

## Problem
Privileged functions need explicit role checks to prevent unauthorized state changes.

## Scope
- Add owner/admin role assignment and revocation flows.
- Guard privileged report moderation and config update functions.
- Emit role-change audit events.

## Files
- `xconfess-contract/src/access-control.*`
- `xconfess-contract/src/lib.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- Only authorized roles can execute protected methods.
- Role handoff/revocation paths are test-covered.
- Unauthorized calls fail with clear error codes/messages.

## Labels
`feature` `contract` `security` `access-control`

## How To Test
1. Test owner/admin grant and revoke flows.
2. Attempt privileged operations from unauthorized accounts.
3. Confirm expected failures and event emissions.