# [83] feat(backend): expose notification delivery metrics and queue health indicators

## Summary
Add metrics for notification throughput, retries, failures, and DLQ depth for observability.

## Problem
Operations cannot detect notification degradation early without service-level queue metrics.

## Scope
- Emit counters and timers for send success, retry, and final failure.
- Track queue depth and DLQ depth as gauges.
- Expose metrics through an authenticated diagnostics endpoint.

## Files
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/email/email.service.ts`
- `xconfess-backend/src/app.controller.ts`
- `xconfess-backend/src/logger/logger.service.ts`

## Acceptance Criteria
- Metrics include per-channel success/failure counts and retry attempts.
- Queue and DLQ size metrics are available in diagnostics response.
- Metric labels are stable and documented for dashboards and alerts.

## Labels
`feature` `backend` `observability` `queue`

## How To Test
1. Process successful and failing notification jobs.
2. Query diagnostics endpoint and verify counters and gauges update correctly.
3. Confirm metrics distinguish transient retries from terminal failures.
