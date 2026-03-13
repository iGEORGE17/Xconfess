# [109] feat(backend): add emergency kill-switch and safe fallback for template rollouts

## Summary
Implement an operator kill-switch to stop canary usage immediately during incidents.

## Problem
Canary misconfiguration or bad template versions need instant mitigation without code deploy.

## Scope
- Add global and per-template kill-switch flags in runtime config.
- Force routing to active stable version when kill-switch is enabled.
- Emit audit events for switch toggles and fallback activations.

## Files
- `xconfess-backend/src/email/email.service.ts`
- `xconfess-backend/src/config/email.config.ts`
- `xconfess-backend/src/audit-log/audit-log.service.ts`
- `xconfess-backend/src/notification/notification.queue.ts`

## Acceptance Criteria
- Operators can disable canary routing instantly via config/control endpoint.
- Notification sends continue via stable version when switch is on.
- Kill-switch actions and fallback reasons are auditable.

## Labels
`feature` `backend` `email` `ops`

## How To Test
1. Enable canary rollout and verify mixed routing.
2. Activate kill-switch and confirm routing switches to stable version only.
3. Verify audit logs capture actor/timestamp/reason.
