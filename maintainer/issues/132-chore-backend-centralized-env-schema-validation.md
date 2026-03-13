# [132] chore(backend): enforce centralized environment schema validation and typed config access

## Summary
Introduce one validated config schema so backend startup fails fast on missing or invalid environment variables.

## Problem
Backend configuration is currently spread across ad hoc `process.env` reads, making misconfiguration easy to miss until runtime.

## Scope
- Add centralized environment schema validation (Joi/Zod) at bootstrap.
- Validate critical vars (DB, JWT, Redis, email, encryption, frontend URL, rate limit).
- Replace direct `process.env` reads in runtime modules with typed `ConfigService` accessors.

## Files
- `xconfess-backend/src/main.ts`
- `xconfess-backend/src/app.module.ts`
- `xconfess-backend/src/config/validation.ts` (new)
- `xconfess-backend/src/config/*.ts`
- `xconfess-backend/.env.sample`
- `xconfess-backend/README.md`

## Acceptance Criteria
- App startup fails with actionable error when required env vars are missing/invalid.
- Runtime services no longer depend on raw `process.env` reads for required config.
- Local/dev/prod env requirements are documented and testable.

## Labels
`chore` `backend` `configuration` `reliability`

## How To Test
1. Start backend with missing/invalid env vars and confirm fail-fast validation output.
2. Start with valid env and verify successful bootstrap.
3. Run core flows (auth, notifications, db access) to confirm typed config wiring works.
