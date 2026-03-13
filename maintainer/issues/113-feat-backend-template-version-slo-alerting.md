# [113] feat(backend): add per-template-version SLO metrics and alert thresholds

## Summary
Track delivery health by template version and raise alerts when rollout quality degrades.

## Problem
Global notification metrics are insufficient to identify whether a specific template version is causing failures.

## Scope
- Emit success/failure/retry metrics with `template_key` and `template_version` labels.
- Define configurable error-rate and latency thresholds for active/canary versions.
- Trigger structured warning/alert events when thresholds are exceeded.

## Files
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/email/email.service.ts`
- `xconfess-backend/src/config/email.config.ts`
- `xconfess-backend/src/logger/logger.service.ts`

## Acceptance Criteria
- Metrics can segment outcomes by template key/version.
- Threshold breaches produce actionable alert logs/events with context.
- Alerting rules are configurable per environment.

## Labels
`feature` `backend` `observability` `email`

## How To Test
1. Generate mixed success/failure traffic for multiple template versions.
2. Verify labeled metrics are emitted correctly.
3. Simulate breach threshold and confirm alert event/log emission.
