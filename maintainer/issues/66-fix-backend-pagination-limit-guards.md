# [66] fix(backend): enforce safe pagination bounds across list endpoints

## Summary
Normalize pagination defaults and maximum bounds to prevent oversized queries.

## Problem
List endpoints can accept unbounded or inconsistent page-size values, risking slow queries.

## Scope
- Define shared pagination constraints (default, max, min).
- Apply constraints to confession, report, comment, and message list DTOs.
- Return clear validation errors for out-of-range values.

## Files
- `xconfess-backend/src/confession/dto/pagination.dto.ts`
- `xconfess-backend/src/report/**/*.dto.ts`
- `xconfess-backend/src/messages/**/*.dto.ts`
- `xconfess-backend/src/comment/**/*.dto.ts`

## Acceptance Criteria
- All list endpoints cap requested page size at configured maximum.
- Negative/zero values are rejected with 400.
- Query performance remains stable under high page-size inputs.

## Labels
`bug` `backend` `performance` `validation`

## How To Test
1. Call list endpoints with normal pagination values.
2. Call with large/negative values and verify rejection or clamp behavior.
3. Confirm response metadata remains consistent.