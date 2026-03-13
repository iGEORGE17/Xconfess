# [90] docs(backend): publish notification incident response and recovery runbook

## Summary
Document step-by-step procedures for diagnosing and recovering notification delivery incidents.

## Problem
Operators rely on tribal knowledge for queue outages, provider failures, and DLQ recovery.

## Scope
- Write runbook sections for detection, triage, mitigation, and post-incident review.
- Include common failure signatures and command snippets for verification.
- Add replay safety checklist and communication templates.

## Files
- `xconfess-backend/README.md`
- `docs/notification-operations-runbook.md` (new)
- `maintainer/issues/69-feat-backend-notification-retry-dlq.md`

## Acceptance Criteria
- Runbook covers at least provider outage, queue backlog, and DLQ replay scenarios.
- Required metrics/log locations are documented with expected healthy ranges.
- On-call can execute recovery checklist without tribal context.

## Labels
`documentation` `backend` `ops` `reliability`

## How To Test
1. Walk through runbook during tabletop incident simulation.
2. Validate all commands and links resolve in current repository.
3. Confirm on-call reviewer can complete checklist end-to-end.
