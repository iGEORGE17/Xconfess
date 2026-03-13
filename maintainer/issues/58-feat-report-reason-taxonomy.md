# [58] feat(backend): enforce report reason taxonomy with enum-based validation

## Summary
Report reason is free-form text, making moderation analytics and triage inconsistent.

## Problem
Unbounded reason strings reduce signal quality and complicate admin filtering.

## Scope
- Introduce report reason enum with supported categories.
- Keep optional details text for context.
- Update DTO and persistence handling.

## Files
- `xconfess-backend/src/report/dto/create-report.dto.ts`
- `xconfess-backend/src/report/report.entity.ts`
- report migration files (if required)

## Acceptance Criteria
- Report reason must match allowed categories.
- Admin/report queries can filter by normalized reason.
- Invalid reason payload returns 400.

## Labels
`feature` `backend` `moderation` `validation`

## How To Test
1. Submit reports with valid/invalid reasons.
2. Confirm invalid reasons are rejected.
3. Verify stored reasons are normalized categories.
