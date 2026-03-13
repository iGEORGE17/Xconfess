# [70] chore(backend): fail-fast startup check for pending DB migrations

## Summary
Prevent app boot in protected environments when required migrations are pending.

## Problem
Running code against outdated schema can cause runtime errors and data inconsistencies.

## Scope
- Add startup check that detects unapplied migrations.
- Configure behavior by environment (strict in prod/staging, warn in local).
- Document migration gate in deployment runbook.

## Files
- `xconfess-backend/src/main.ts`
- `xconfess-backend/data-source.ts`
- `xconfess-backend/README.md`

## Acceptance Criteria
- Backend startup fails clearly in strict environments with pending migrations.
- Local development mode keeps a non-blocking warning option.
- Error message points to migration command to resolve.

## Labels
`chore` `backend` `database` `ops`

## How To Test
1. Start backend with pending migration in strict mode.
2. Confirm startup aborts with actionable error.
3. Apply migrations and verify successful boot.