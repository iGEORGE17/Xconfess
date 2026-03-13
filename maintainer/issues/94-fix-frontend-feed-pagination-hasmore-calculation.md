# [94] fix(frontend): correct `hasMore` pagination derivation in confession feed proxy

## Summary
Compute `hasMore` from backend pagination metadata rather than defaulting to true.

## Problem
Proxy sets `hasMore` as true unless explicitly false, causing unnecessary/infinite page fetch attempts for finite datasets.

## Scope
- Derive `hasMore` from backend `meta` fields (`page`, `limit`, `totalPages`, `total`) when available.
- Add fallback logic for legacy response shape.
- Guard feed against requesting next page when returned batch is empty.

## Files
- `xconfess-frontend/app/api/confessions/route.ts`
- `xconfess-frontend/app/components/confession/ConfessionFeed.tsx`
- `xconfess-frontend/app/lib/hooks/useConfessions.ts`

## Acceptance Criteria
- `hasMore` is false on last page for backend meta responses.
- Infinite scroll stops after final page without repeated empty requests.
- Pagination logic is covered by unit/integration test cases.

## Labels
`bug` `frontend` `pagination` `performance`

## How To Test
1. Seed backend with finite confession count (e.g., 12) and `limit=10`.
2. Scroll feed to load all pages.
3. Confirm no extra requests after page 2 and `hasMore=false`.
