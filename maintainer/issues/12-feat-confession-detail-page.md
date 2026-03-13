# [12] feat(frontend): implement confession detail page

## Summary
`app/(dashboard)/confessions/[id]/page.tsx` is empty.

## Problem
No detail view for a confession despite route structure existing.

## Scope
- Add confession detail UI.
- Include reactions/comments section placeholders.
- Handle 404/error states.

## Files
- `xconfess-frontend/app/(dashboard)/confessions/[id]/page.tsx`
- `xconfess-frontend/app/api/confessions/route.ts`

## Acceptance Criteria
- Visiting detail route renders confession content.
- Handles missing confession id/data gracefully.
- Works on mobile and desktop.

## Labels
`feature` `frontend` `ui`

## How To Test
### Prerequisites
- From repo root: `npm install`
- Frontend env: `xconfess-frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3000`
- Backend running and reachable from frontend

### Run
- `npm run dev:backend`
- `npm run dev:frontend`

### Verify
1. Open the affected frontend route/UI.
2. Reproduce the issue path before changes.
3. Apply fix and confirm expected behavior from Acceptance Criteria.
4. Confirm error handling paths (invalid input or backend unavailable).
5. Refresh and ensure behavior/data consistency remains correct.

### Optional checks
- `npm run lint --workspace=xconfess-frontend`
- `npm run build --workspace=xconfess-frontend`
