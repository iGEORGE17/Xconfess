# [28] fix(backend): define auth policy for report creation endpoint

## Summary
Clarify and enforce whether reporting is anonymous, authenticated, or both.

## Problem
Controller currently reads `req.user?.id` without explicit guard/policy.

## Scope
- Decide policy and implement guard/decorator behavior accordingly.
- Update docs and tests to match policy.

## Files
- `xconfess-backend/src/report/reports.controller.ts`
- `xconfess-backend/src/report/reports.service.ts`
- `xconfess-backend/API_DOCUMENTATION.md`

## Acceptance Criteria
- Policy is explicit in code and docs.
- Endpoint behavior matches policy in all cases.
- Tests cover anonymous and authenticated cases as applicable.

## Labels
`bug` `backend` `auth` `api`

## How To Test
### Prerequisites
- `npm install`
- Backend running with JWT config

### Run
- `npm run dev:backend`

### Verify
1. Call report endpoint with and without token.
2. Confirm behavior exactly matches defined policy.
3. Confirm docs reflect final behavior.
