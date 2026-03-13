# [145] fix(contract): enforce bounded event payload and string length constraints

## Summary
Add hard limits for emitted event payload fields and user-provided strings.

## Problem
Unbounded payload fields can increase gas unpredictably, degrade indexer reliability, and open griefing vectors.

## Scope
- Define max lengths for confession/report text and metadata fields.
- Validate and reject over-limit values before state write/event emission.
- Add tests for boundary values and over-limit rejection paths.

## Files
- `xconfess-contract/src/confession.*`
- `xconfess-contract/src/report.*`
- `xconfess-contract/src/events.*`
- `xconfess-contract/src/errors.*`
- `xconfess-contract/test/*`

## Acceptance Criteria
- Inputs exceeding configured limits are rejected deterministically.
- Event payload sizes stay within documented bounds.
- Boundary tests cover exact-limit and limit+1 scenarios.

## Labels
`bug` `contract` `security` `performance`

## How To Test
1. Submit values at exact max length and verify success.
2. Submit values above max length and verify expected rejection.
3. Inspect emitted events to confirm bounded payload behavior.
