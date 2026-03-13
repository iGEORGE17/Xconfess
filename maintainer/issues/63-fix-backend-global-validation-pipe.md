# [63] fix(backend): enforce strict global validation and payload whitelisting

## Summary
Apply one global validation strategy for all incoming DTO payloads.

## Problem
Inconsistent validation setup allows unknown fields and weak type coercion across routes.

## Scope
- Configure `ValidationPipe` globally in bootstrap.
- Enable `whitelist`, `forbidNonWhitelisted`, and predictable transform options.
- Align controller handlers that currently depend on implicit payload shapes.

## Files
- `xconfess-backend/src/main.ts`
- `xconfess-backend/src/**/*.dto.ts`
- `xconfess-backend/src/**/*.controller.ts`

## Acceptance Criteria
- Unknown payload fields return 400 where DTO does not allow them.
- DTO transforms and validators behave consistently across modules.
- Existing happy-path requests continue to pass.

## Labels
`bug` `backend` `validation` `api`

## How To Test
1. Submit valid payloads to auth/confession/report endpoints.
2. Submit payloads with extra fields and invalid types.
3. Verify 400 responses include useful validation messages.