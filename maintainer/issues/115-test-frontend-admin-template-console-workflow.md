# [115] test(frontend): add integration tests for admin template rollout console

## Summary
Add robust frontend tests for template rollout UI state transitions and operator actions.

## Problem
Critical rollout controls need regression protection against UI bugs in form validation and action sequencing.

## Scope
- Cover list/load/empty/error states for template console.
- Test canary percentage edits, promote/rollback flows, and kill-switch toggles.
- Validate optimistic updates and rollback-on-error UI behavior.

## Files
- `xconfess-frontend/app/(dashboard)/admin/templates/page.tsx`
- `xconfess-frontend/tests/admin-template-console.spec.tsx` (new)
- `xconfess-frontend/package.json`

## Acceptance Criteria
- Core operator flows are covered by deterministic integration tests.
- Failed API actions display clear error states and do not leave stale UI.
- Tests run reliably in CI with no network dependency.

## Labels
`test` `frontend` `admin` `qa`

## How To Test
1. Run frontend test suite with template console spec.
2. Verify success and failure interaction paths pass.
3. Confirm CI execution is stable across repeated runs.
