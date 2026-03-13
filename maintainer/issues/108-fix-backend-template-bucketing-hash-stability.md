# [108] fix(backend): enforce stable canary bucketing hash strategy for template routing

## Summary
Normalize recipient bucketing so canary assignment is consistent across instances and deployments.

## Problem
Inconsistent hashing/normalization can reassign recipients between versions unpredictably, invalidating canary signal quality.

## Scope
- Define canonical bucketing input normalization (trim, lowercase, stable recipient identifier).
- Use explicit hash algorithm + optional salt for deterministic percentage bucket.
- Add unit tests for hash stability and boundary bucket behavior.

## Files
- `xconfess-backend/src/email/email.service.ts`
- `xconfess-backend/src/config/email.config.ts`
- `xconfess-backend/.env.sample`
- `xconfess-backend/src/email/email.service.spec.ts`

## Acceptance Criteria
- Same recipient always maps to same bucket for fixed config.
- Bucket distribution boundaries (0, 1, 99, 100) are deterministic and test-covered.
- Hash normalization behavior is documented and backward-compatible.

## Labels
`bug` `backend` `email` `reliability`

## How To Test
1. Run unit tests for deterministic bucketing with known fixtures.
2. Restart service and verify assignments remain unchanged.
3. Validate bucket selection behavior at percent edge cases.
