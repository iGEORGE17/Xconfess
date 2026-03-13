# [112] feat(frontend): add admin template rollout console for version and canary controls

## Summary
Provide UI for operators to inspect template versions and manage canary percentages safely.

## Problem
Template rollout controls are backend-only, making operational changes slower and more error-prone.

## Scope
- Add admin page listing template keys, active/canary versions, and rollout percentages.
- Add guarded actions for promote, rollback, and kill-switch toggles.
- Surface per-version delivery status and recent validation failures.

## Files
- `xconfess-frontend/app/(dashboard)/admin/templates/page.tsx` (new)
- `xconfess-frontend/app/lib/api/client.ts`
- `xconfess-frontend/app/components/common/ErrorBoundary.tsx`
- `xconfess-frontend/app/components/ui/table.tsx`

## Acceptance Criteria
- Operators can view and update rollout policy per template key.
- Risky actions (promote/rollback/kill-switch) require confirmation.
- UI reflects backend state changes without full page reload.

## Labels
`feature` `frontend` `admin` `release`

## How To Test
1. Open admin template console with seeded rollout data.
2. Perform canary percent update and verify UI refreshes correctly.
3. Trigger rollback/kill-switch and confirm reflected state and feedback.
