# [34] fix(backend): gate TypeORM synchronize by environment

## Summary
`synchronize: true` is unsafe beyond local development.

## Problem
Schema sync can unintentionally mutate data in non-dev environments.

## Scope
- Set conservative default (`false`).
- Enable only in explicit local/dev environment.
- Update migration workflow docs.

## Files
- `xconfess-backend/src/config/database.config.ts`
- `xconfess-backend/README.md`

## Acceptance Criteria
- Non-dev env runs with `synchronize=false`.
- Dev can opt-in explicitly.
- Migrations become authoritative for schema evolution.

## Labels
`bug` `backend` `database` `high priority`

## How To Test
### Prerequisites
- `npm install`
- Two env configurations: dev and production-like

### Run
- Start backend with each env profile

### Verify
1. Confirm synchronize behavior differs as configured.
2. Confirm app starts successfully in both modes.
3. Verify schema changes are applied via migration flow.
