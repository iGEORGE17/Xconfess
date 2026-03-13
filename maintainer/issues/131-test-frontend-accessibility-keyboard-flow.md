# [131] test(frontend): add accessibility and keyboard-flow regression suite for core pages

## Summary
Add automated accessibility checks and keyboard navigation tests for auth, feed, and admin-critical UI.

## Problem
Current UI paths can regress on keyboard support/semantics without automated checks.

## Scope
- Add automated a11y checks (axe or equivalent) for login/register/feed/admin screens.
- Validate keyboard-only navigation for header/menu/reaction/actions.
- Cover focus management for modal/error/retry flows.

## Files
- `xconfess-frontend/tests/accessibility/auth-feed-admin.a11y.spec.ts` (new)
- `xconfess-frontend/app/components/layout/Header.tsx`
- `xconfess-frontend/app/components/confession/ReactionButtons.tsx`
- `xconfess-frontend/app/components/common/ErrorBoundary.tsx`
- `xconfess-frontend/package.json`

## Acceptance Criteria
- CI test suite fails on critical accessibility violations.
- Keyboard-only users can complete primary navigation and actions.
- Focus order and reset behavior are deterministic after errors.

## Labels
`test` `frontend` `accessibility` `quality`

## How To Test
1. Run accessibility test suite locally and in CI.
2. Validate no critical violations on covered pages.
3. Execute keyboard-only flow for auth + feed + admin actions.
