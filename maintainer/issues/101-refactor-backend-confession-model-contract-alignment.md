# [101] refactor(backend): align confession DTO/service/response model contract and remove legacy dead paths

## Summary
Reconcile mixed confession schemas (`message` vs `title/body`) and remove stale service methods that do not match active entity model.

## Problem
Confession module currently mixes incompatible contracts across DTOs and service methods, increasing risk of runtime errors and API drift.

## Scope
- Define one canonical confession payload model and apply it across DTOs/responses.
- Remove or isolate legacy methods (`createConfession`, `saveConfession`, `findByUser`, title/body mapping) not used by active endpoints.
- Update tests to assert canonical request/response fields.

## Files
- `xconfess-backend/src/confession/dto/create-confession.dto.ts`
- `xconfess-backend/src/confession/dto/confession-response.dto.ts`
- `xconfess-backend/src/confession/confession.service.ts`
- `xconfess-backend/src/confession/confession.controller.ts`

## Acceptance Criteria
- Confession create/read/update endpoints use one consistent field contract.
- Dead legacy methods and unused field mappings are removed or clearly deprecated.
- Service/controller tests cover canonical contract and reject mixed payloads.

## Labels
`refactor` `backend` `api` `maintainability`

## How To Test
1. Run confession unit/integration tests for create/get/update paths.
2. Verify payloads with deprecated fields fail or map explicitly per policy.
3. Confirm frontend contract consumers receive stable schema.
