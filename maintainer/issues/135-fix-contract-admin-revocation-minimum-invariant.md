# [135] fix(contract): enforce minimum-admin invariant on role revocation flows

## Summary
Prevent governance lockout by guaranteeing at least one active admin remains after any revoke/transfer path.

## Problem
Role revocation/transfer edge cases can unintentionally leave the contract without an authorized admin.

## Scope
- Add invariant checks before admin revoke/finalize-transfer operations.
- Block actions that would reduce active admin count below one.
- Emit explicit failure reason and governance event metadata.

## Files
- `xconfess-contract/src/access-control.*`
- `xconfess-contract/src/lib.*`
- `xconfess-contract/src/events.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- Contract cannot enter zero-admin state via supported admin actions.
- Invalid revocation/transfer attempts fail deterministically.
- Invariant is covered by unit and integration tests.

## Labels
`bug` `contract` `security` `governance`

## How To Test
1. Create single-admin state and attempt revoke/transfer that removes last admin.
2. Verify operation fails with expected error/event.
3. Verify valid multi-admin revocation path still succeeds.
