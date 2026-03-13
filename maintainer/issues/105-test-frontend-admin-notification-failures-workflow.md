# [105] test(frontend): add integration coverage for admin notification failures page workflow

## Summary
Add frontend tests for list, filter, retry, and error handling on admin notification failures UI.

## Problem
The admin failures page lacks regression coverage for operational actions and async edge cases.

## Scope
- Add integration tests for loading, empty, populated, and API error states.
- Cover replay action success/failure and row-level status updates.
- Validate pagination/filter query behavior against mocked API responses.

## Files
- `xconfess-frontend/app/(dashboard)/admin/notifications/page.tsx`
- `xconfess-frontend/app/components/common/ErrorBoundary.tsx`
- `xconfess-frontend/tests/admin-notification-failures.spec.tsx` (new)
- `xconfess-frontend/package.json`

## Acceptance Criteria
- Tests validate key operator flows without brittle selectors.
- Replay action behavior is covered for both success and failure.
- CI can execute suite non-interactively with stable results.

## Labels
`test` `frontend` `admin` `reliability`

## How To Test
1. Run frontend test suite including new admin notification spec.
2. Verify all UI states and replay interactions pass.
3. Confirm failing mock APIs surface visible error states.
