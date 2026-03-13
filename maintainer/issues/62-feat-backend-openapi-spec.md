# [62] feat(backend): publish OpenAPI spec for active API routes

## Summary
Generate and expose a Swagger/OpenAPI document for implemented backend modules.

## Problem
API consumers rely on scattered controller code and stale docs, causing contract drift.

## Scope
- Add Swagger bootstrap in Nest app startup.
- Tag and document active controllers and DTOs.
- Expose `/api-docs` in non-production environments.

## Files
- `xconfess-backend/src/main.ts`
- `xconfess-backend/src/**/*.controller.ts`
- `xconfess-backend/src/**/*.dto.ts`

## Acceptance Criteria
- `/api-docs` renders with Auth, Confession, Reaction, Messages, and Report endpoints.
- Request/response schemas match DTO validation rules.
- OpenAPI generation is disabled or protected for production.

## Labels
`feature` `backend` `api` `documentation`

## How To Test
1. Start backend locally.
2. Open `/api-docs` and verify endpoint groups and schemas.
3. Confirm documented payload validation matches runtime behavior.