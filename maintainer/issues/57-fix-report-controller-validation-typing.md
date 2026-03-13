# [57] fix(backend): tighten report route param validation and controller typing

## Summary
Report controller has weak request typing and unused imports; route param is not explicitly UUID-validated.

## Problem
Weak typing reduces maintainability and may allow malformed IDs deeper into service layer.

## Scope
- Add UUID validation pipe on report route param.
- Type request user shape explicitly.
- Remove unused imports and formatting noise.

## Files
- `xconfess-backend/src/report/reports.controller.ts`
- `xconfess-backend/src/report/dto/create-report.dto.ts`

## Acceptance Criteria
- Invalid report confession IDs fail at controller validation.
- Controller compiles without unused imports.
- Request typing avoids `any` for auth context.

## Labels
`bug` `backend` `validation` `code quality`

## How To Test
1. Call report endpoint with invalid UUID and confirm 400.
2. Call with valid UUID and confirm normal flow.
3. Run lint/type checks for controller file.
