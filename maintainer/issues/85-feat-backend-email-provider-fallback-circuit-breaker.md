# [85] feat(backend): add email provider fallback and circuit breaker policy

## Summary
Improve delivery resiliency by failing over to secondary provider when primary email service is degraded.

## Problem
A single provider outage can block all notification emails and inflate queue failures.

## Scope
- Add primary/secondary provider configuration and health state tracking.
- Implement circuit breaker around primary provider with cooldown and probe.
- Route sends to fallback provider during open-circuit window.

## Files
- `xconfess-backend/src/email/email.service.ts`
- `xconfess-backend/src/email/email.module.ts`
- `xconfess-backend/src/config/email.config.ts`
- `xconfess-backend/src/notification/notification.queue.ts`

## Acceptance Criteria
- Primary provider repeated failures open circuit and trigger fallback path.
- Circuit closes only after successful health probes or cooldown completion.
- Fallback routing and circuit transitions are logged with reason codes.

## Labels
`feature` `backend` `email` `reliability`

## How To Test
1. Simulate primary provider timeout/error responses.
2. Verify circuit opens and sends switch to secondary provider.
3. Restore primary and confirm circuit half-open/close transition behavior.
