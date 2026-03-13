# [99] fix(backend): harden confession full-text search schema/query contract

## Summary
Ensure full-text search queries are compatible with actual schema and use sanitized search terms consistently.

## Problem
Repository full-text query depends on `search_vector` and computes a sanitized term that is currently unused, creating fragility and inconsistent search behavior.

## Scope
- Validate presence of required full-text columns/indexes before query execution.
- Use sanitized tokenized term consistently in full-text query path.
- Add fallback/clear error handling when full-text capability is unavailable.

## Files
- `xconfess-backend/src/confession/repository/confession.repository.ts`
- `xconfess-backend/src/confession/confession.service.ts`
- `xconfess-backend/src/confession/confession.search.spec.ts`

## Acceptance Criteria
- Full-text search no longer fails due to missing schema assumptions.
- Sanitization logic is actually applied in query construction.
- Search endpoint returns deterministic results for punctuation-heavy queries.

## Labels
`bug` `backend` `search` `reliability`

## How To Test
1. Run search endpoint with normal and punctuation-heavy terms.
2. Confirm query executes without missing-column errors.
3. Verify results are stable across repeated calls.
