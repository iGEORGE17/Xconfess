# [16] chore(frontend): implement shared UI primitives

## Summary
Several UI component files are empty (`button`, `card`, `input`, `modal`).

## Problem
No reusable design primitives for contributor features.

## Scope
- Implement accessible, typed primitives.
- Replace ad hoc button/input usage in key pages incrementally.

## Files
- `xconfess-frontend/app/components/ui/button.tsx`
- `xconfess-frontend/app/components/ui/card.tsx`
- `xconfess-frontend/app/components/ui/input.tsx`
- `xconfess-frontend/app/components/ui/modal.tsx`

## Acceptance Criteria
- All primitives exported and usable.
- Keyboard/accessibility basics included.
- At least one existing page migrated to primitives.

## Labels
`chore` `frontend` `design-system`

## How To Test
### Verify repository hygiene
1. Run `npm install` from repo root.
2. Run `git status --short` and confirm no dependency artifacts are newly tracked.
3. Confirm `.gitignore` correctly excludes dependency/build output paths.
4. Validate lockfile policy is documented and consistent across workspace.

### Optional checks
- Fresh clone on another machine and repeat steps 1-3.
