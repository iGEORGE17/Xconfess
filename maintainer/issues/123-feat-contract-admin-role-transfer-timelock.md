# [123] feat(contract): add two-step admin role transfer with timelock and cancel path

## Summary
Harden governance by requiring staged role handoff instead of immediate admin reassignment.

## Problem
Single-step role transfer increases risk of accidental lockout or compromised key takeover.

## Scope
- Add `proposeAdminTransfer`, `acceptAdminTransfer`, and `cancelAdminTransfer` flows.
- Enforce configurable timelock window before acceptance is valid.
- Emit governance events for proposal, acceptance, and cancellation.

## Files
- `xconfess-contract/src/access-control.*`
- `xconfess-contract/src/lib.*`
- `xconfess-contract/src/events.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- Admin transfer cannot complete without proposal + timelock + explicit accept.
- Unauthorized or expired acceptance attempts fail deterministically.
- Governance events capture actor and transfer lifecycle state.

## Labels
`feature` `contract` `security` `governance`

## How To Test
1. Propose transfer and attempt early acceptance (expect failure).
2. Accept after timelock from proposed account (expect success).
3. Validate cancellation prevents later acceptance.
