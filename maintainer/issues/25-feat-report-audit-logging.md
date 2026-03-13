# [25] feat(backend): audit log entries for report moderation actions

## Summary
Track admin moderation decisions in audit log.

## Problem
No historical trace for who resolved/dismissed a report.

## Scope
- Log report actions with actor, action, target, timestamp.
- Integrate with existing audit log module/service.

## Files
- `xconfess-backend/src/report/reports.service.ts`
- `xconfess-backend/src/audit-log/audit-log.service.ts`
- `xconfess-backend/src/audit-log/audit-log.entity.ts`

## Acceptance Criteria
- Each resolve/dismiss creates one audit record.
- Record includes report ID and admin ID.
- Failures in logging are handled safely.

## Labels
`feature` `backend` `audit` `security`

## How To Test
### Prerequisites
- `npm install`
- Backend DB configured

### Run
- `npm run dev:backend`

### Verify
1. Perform admin report action.
2. Query audit log table.
3. Confirm expected action entry exists with correct fields.
