# [110] feat(backend): introduce template version lifecycle state machine

## Summary
Model template versions with explicit lifecycle states to prevent unsafe routing to incomplete versions.

## Problem
Without lifecycle constraints, draft or deprecated templates can be accidentally selected for production notifications.

## Scope
- Add lifecycle states (`draft`, `canary`, `active`, `deprecated`, `archived`).
- Enforce valid state transitions with guardrails.
- Restrict routing to allowed states only (`active` and optional `canary`).

## Files
- `xconfess-backend/src/email/email.service.ts`
- `xconfess-backend/src/email/entities/template-version.entity.ts` (new)
- `xconfess-backend/src/email/email.module.ts`
- `xconfess-backend/src/audit-log/audit-log.service.ts`

## Acceptance Criteria
- Invalid state transitions are rejected with clear validation errors.
- Routing never selects `draft`/`archived` versions.
- State transition history is persisted for operational traceability.

## Labels
`feature` `backend` `email` `maintainability`

## How To Test
1. Create template versions in each lifecycle state.
2. Attempt valid/invalid transitions and verify enforcement.
3. Send notifications and confirm only routable states are used.
