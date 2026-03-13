# [130] feat(frontend): adopt OpenAPI-generated typed API client and contracts

## Summary
Generate frontend API types/clients from backend OpenAPI to eliminate hand-written contract drift.

## Problem
Manual API shapes and ad hoc fetch wrappers can desync from backend contracts and cause runtime errors.

## Scope
- Add OpenAPI client generation pipeline for frontend.
- Replace critical auth/confession/reaction API calls with generated typed client.
- Add CI check to fail when generated client is stale.

## Files
- `xconfess-frontend/package.json`
- `xconfess-frontend/app/lib/api/client.ts`
- `xconfess-frontend/app/lib/api/confessions.ts`
- `xconfess-frontend/app/lib/api/reactions.ts`
- `xconfess-frontend/scripts/generate-openapi-client.ts` (new)

## Acceptance Criteria
- Frontend compiles against generated API types.
- Contract-breaking backend changes surface during typecheck/CI.
- Core API modules no longer rely on loosely typed response parsing.

## Labels
`feature` `frontend` `api` `type-safety`

## How To Test
1. Generate client from current backend OpenAPI spec.
2. Run frontend typecheck and ensure generated types are consumed.
3. Change API schema intentionally and verify CI/typecheck detects drift.
