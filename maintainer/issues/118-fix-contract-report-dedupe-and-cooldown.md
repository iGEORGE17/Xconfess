# [118] fix(contract): enforce report dedupe and cooldown per actor/confession pair

## Summary
Prevent report spam by restricting duplicate submissions from the same actor on the same confession.

## Problem
Repeated reports from one actor can inflate moderation noise and increase on-chain storage cost without improving signal quality.

## Scope
- Add per-actor/per-confession dedupe guard for report creation.
- Add optional cooldown window before same actor can re-report identical target.
- Emit explicit rejection reason for duplicate/cooldown violations.

## Files
- `xconfess-contract/src/report.*`
- `xconfess-contract/src/lib.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- Same actor cannot submit duplicate report during cooldown window.
- Different actors can still report the same confession independently.
- Rejection paths return deterministic error codes/messages.

## Labels
`bug` `contract` `moderation` `integrity`

## How To Test
1. Submit initial report from actor A and verify success.
2. Submit duplicate report from actor A and verify rejection.
3. Submit report from actor B for same confession and verify success.
