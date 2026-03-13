# [38] feat(frontend): implement currently empty dashboard pages and base shells

## Summary
Several route-group dashboard pages and shared layout components are empty placeholders.

## Problem
Empty pages/components block end-to-end user flow and make navigation appear broken.

## Scope
- Implement minimal functional UI for dashboard home, profile, messages, and confession detail pages.
- Fill sidebar/footer with navigation + fallback content.
- Reuse existing API/hooks where possible.

## Files
- `xconfess-frontend/app/(dashboard)/page.tsx`
- `xconfess-frontend/app/(dashboard)/profile/page.tsx`
- `xconfess-frontend/app/(dashboard)/messages/page.tsx`
- `xconfess-frontend/app/(dashboard)/confessions/[id]/page.tsx`
- `xconfess-frontend/app/components/layout/Sidebar.tsx`
- `xconfess-frontend/app/components/layout/Footer.tsx`

## Acceptance Criteria
- Each dashboard route renders meaningful UI (no blank page).
- Navigation across dashboard routes works on desktop and mobile widths.
- Loading/error/empty states are present for data-backed views.

## Labels
`feature` `frontend` `ui` `high priority`

## How To Test
### Run
- `npm run dev:frontend`

### Verify
1. Visit each dashboard route directly and via navigation links.
2. Confirm non-empty render with sensible defaults.
3. Confirm responsive layout does not collapse or overflow.
