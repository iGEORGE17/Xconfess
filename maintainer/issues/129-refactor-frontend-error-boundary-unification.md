# [129] refactor(frontend): unify duplicated error boundary implementations and recovery behavior

## Summary
Consolidate multiple error boundary components into one consistent, reusable boundary system.

## Problem
Duplicated boundaries have inconsistent fallback UX and recovery behavior (`reload` vs local reset), increasing maintenance drift.

## Scope
- Merge common/confession error boundaries into shared implementation.
- Standardize fallback UI states, reset actions, and logging interface.
- Replace ad hoc window reload recovery with controlled retry/reset strategy.

## Files
- `xconfess-frontend/app/components/common/ErrorBoundary.tsx`
- `xconfess-frontend/app/components/confession/ErrorBoundary.tsx`
- `xconfess-frontend/app/page.tsx`
- `xconfess-frontend/app/(dashboard)/layout.tsx`

## Acceptance Criteria
- One canonical boundary pattern is used across app sections.
- Fallback UI and retry behavior are consistent.
- Error handling code paths are easier to test and maintain.

## Labels
`refactor` `frontend` `reliability` `maintainability`

## How To Test
1. Trigger render/runtime errors in feed and dashboard views.
2. Confirm shared fallback UI appears with consistent retry behavior.
3. Verify no forced hard reload is required for recovery.
