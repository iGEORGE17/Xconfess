# [106] feat(backend): support canary rollout strategy for notification template versions

## Summary
Introduce staged activation so new template versions can be rolled out gradually before full cutover.

## Problem
Current template version switching is binary, which increases blast radius when a new version has rendering or deliverability issues.

## Scope
- Add rollout policy per template key (active version + optional canary version/percentage).
- Route a deterministic subset of jobs to canary version based on stable recipient hash.
- Capture per-version delivery metrics and audit events during rollout windows.

## Files
- `xconfess-backend/src/email/email.service.ts`
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/config/email.config.ts`
- `xconfess-backend/src/audit-log/audit-log.service.ts`

## Acceptance Criteria
- Operators can configure canary percentage and promotion/rollback safely.
- Same recipient maps consistently to the same version during rollout.
- Metrics/audit records show delivery outcomes by template version.

## Labels
`feature` `backend` `email` `release`

## How To Test
1. Configure active and canary template versions with a low canary percentage.
2. Send batch notifications and verify deterministic version split.
3. Set canary to 0/100 and confirm rollback/promotion behavior.
