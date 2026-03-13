# [114] docs(backend): publish template rollout and rollback runbook

## Summary
Document operational workflow for releasing, canarying, promoting, and rolling back template versions.

## Problem
Rollout tasks are currently implicit, increasing incident risk during template changes.

## Scope
- Add step-by-step runbook for pre-checks, canary setup, monitoring, and promotion.
- Document emergency rollback and kill-switch procedures.
- Include verification checklist and post-release review template.

## Files
- `docs/template-rollout-runbook.md` (new)
- `xconfess-backend/README.md`
- `maintainer/issues/106-feat-backend-template-version-canary-rollout.md`

## Acceptance Criteria
- On-call can execute rollout safely using only documented steps.
- Rollback path is explicit with measurable stop criteria.
- Runbook references current commands/endpoints and known failure modes.

## Labels
`documentation` `backend` `email` `ops`

## How To Test
1. Execute a tabletop rollout using the runbook.
2. Validate each command/link is current and works.
3. Simulate rollback scenario and confirm checklist completeness.
