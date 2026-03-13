# [116] chore(backend): persist template rollout diff history for audit and forensics

## Summary
Record structured diffs for template rollout changes to improve incident analysis and compliance tracking.

## Problem
Current audit entries may capture events but lack precise before/after diff for version and rollout policy mutations.

## Scope
- Persist before/after diff snapshots for template config changes.
- Include actor, reason, correlation id, and source endpoint metadata.
- Add query endpoint/filter to inspect rollout history by template key/version.

## Files
- `xconfess-backend/src/audit-log/audit-log.service.ts`
- `xconfess-backend/src/audit-log/audit-log.entity.ts`
- `xconfess-backend/src/email/email.service.ts`
- `xconfess-backend/src/logger/logger.service.ts`

## Acceptance Criteria
- Every rollout change stores a machine-readable before/after diff.
- Audit queries can filter by template key, actor, and time window.
- Incident responders can reconstruct rollout timeline from audit records alone.

## Labels
`chore` `backend` `audit` `reliability`

## How To Test
1. Perform canary update, promote, rollback, and kill-switch actions.
2. Query audit history and verify complete diff records exist.
3. Confirm timeline reconstruction is possible from stored audit events.
