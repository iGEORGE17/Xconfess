# [30] fix(frontend): map backend confession fields to frontend contract

## Summary
Frontend expects `content/createdAt`, backend may return `message/created_at`.

## Problem
Feed rendering is fragile due to inconsistent data shape mapping.

## Scope
- Add normalized mapper in proxy route.
- Guarantee consistent response schema to UI.

## Files
- `xconfess-frontend/app/api/confessions/route.ts`
- `xconfess-frontend/app/components/confession/ConfessionFeed.tsx`

## Acceptance Criteria
- Feed receives stable field names.
- No runtime undefined field errors.
- Mapping logic covered by tests.

## Labels
`bug` `frontend` `api`

## How To Test
### Prerequisites
- `npm install`
- Run backend + frontend

### Run
- `npm run dev`

### Verify
1. Inspect `/api/confessions` response shape.
2. Confirm UI consistently renders content/date/reactions.
3. Test both backend-success and fallback paths.
