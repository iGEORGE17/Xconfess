# [136] feat(contract): add governed runtime config parameters with bounds and cooldown

## Summary
Expose critical contract parameters through controlled governance updates instead of hardcoded values.

## Problem
Operational parameters cannot be tuned safely post-deploy without code changes.

## Scope
- Add config store for bounded parameters (limits, thresholds, windows).
- Require admin authorization with cooldown between updates.
- Emit parameter-change events with before/after values.

## Files
- `xconfess-contract/src/lib.*`
- `xconfess-contract/src/access-control.*`
- `xconfess-contract/src/events.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- Config updates enforce min/max bounds and cooldown rules.
- Unauthorized updates are rejected.
- Parameter changes are observable via emitted events.

## Labels
`feature` `contract` `governance` `operations`

## How To Test
1. Update parameter within bounds as admin and verify success.
2. Attempt out-of-bounds or too-frequent update and verify rejection.
3. Confirm change event includes previous and new values.
