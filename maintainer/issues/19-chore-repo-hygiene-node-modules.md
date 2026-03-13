# [19] chore(repo): clean tracked dependency artifacts and lockfile strategy

## Summary
Repository currently shows extensive `node_modules` and lockfile churn.

## Problem
Noise in git history makes contributor PRs difficult to review.

## Scope
- Ensure `node_modules` is ignored and untracked.
- Define lockfile policy for workspace (root vs per-package).

## Files
- `.gitignore`
- `package-lock.json`
- workspace docs

## Acceptance Criteria
- Fresh install leads to clean `git status` (except intentional changes).
- No dependency binaries/artifacts tracked.
- Lockfile approach documented for contributors.

## Labels
`chore` `devex` `high priority`

## How To Test
### Verify repository hygiene
1. Run `npm install` from repo root.
2. Run `git status --short` and confirm no dependency artifacts are newly tracked.
3. Confirm `.gitignore` correctly excludes dependency/build output paths.
4. Validate lockfile policy is documented and consistent across workspace.

### Optional checks
- Fresh clone on another machine and repeat steps 1-3.
