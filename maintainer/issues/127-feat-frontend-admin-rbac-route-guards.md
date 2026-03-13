# [127] feat(frontend): enforce role-based route protection for admin surfaces

## Summary
Add frontend RBAC guards so admin pages are inaccessible to non-admin users.

## Problem
Admin routes can be reached without explicit client-side role checks, creating weak UX/security boundaries.

## Scope
- Add route-level protection for admin paths using middleware/layout guard.
- Gate admin navigation visibility by role.
- Add unauthorized fallback page/redirect behavior.

## Files
- `xconfess-frontend/middleware.ts` (new)
- `xconfess-frontend/app/(dashboard)/layout.tsx`
- `xconfess-frontend/app/components/layout/Header.tsx`
- `xconfess-frontend/app/(dashboard)/admin/templates/page.tsx`
- `xconfess-frontend/app/(dashboard)/admin/notifications/page.tsx`

## Acceptance Criteria
- Non-admin users cannot access admin routes directly.
- Admin navigation links are hidden/disabled for non-admin users.
- Unauthorized access path is deterministic and user-friendly.

## Labels
`feature` `frontend` `security` `routing`

## How To Test
1. Access admin route with non-admin session and verify deny/redirect.
2. Access same route with admin session and verify normal render.
3. Confirm admin nav items are role-gated in header/sidebar.
