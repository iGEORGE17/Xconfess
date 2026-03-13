# [61] docs(repo): reconcile root README with actual implementation status

## Summary
Root README advertises features/structure not reflected in current tracked code (contracts/docs/routes placeholders).

## Problem
Contributor onboarding and planning are slowed by mismatch between documentation and actual codebase state.

## Scope
- Update feature matrix to indicate implemented vs planned.
- Correct project structure section to match current folders.
- Remove or clearly mark placeholder links and unavailable modules.

## Files
- `README.md`
- `xconfess-backend/README.md`
- `xconfess-frontend/README.md`

## Acceptance Criteria
- README reflects current monorepo reality and active modules.
- Planned items are clearly labeled as roadmap, not implemented.
- Onboarding instructions run successfully as documented.

## Labels
`documentation` `repo hygiene` `maintainers`

## How To Test
1. Follow setup docs from a clean clone.
2. Verify documented directories/routes exist.
3. Confirm feature claims match observable behavior.
