# [86] test(backend): add end-to-end coverage for notification retry and DLQ lifecycle

## Summary
Create e2e tests validating retry backoff, exhaustion, DLQ write, and replay behavior.

## Problem
Current tests do not protect against regressions in queue failure handling.

## Scope
- Add deterministic e2e scenarios for transient, permanent, and recovered failures.
- Verify retry count, delay strategy, and terminal DLQ transition.
- Assert replay flow from DLQ back to active queue after remediation.

## Files
- `xconfess-backend/test/notification-retry-dlq.e2e-spec.ts` (new)
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/email/email.service.ts`

## Acceptance Criteria
- Tests fail if retry attempts or delay policy drift from configured behavior.
- Tests assert DLQ persistence includes payload and error metadata.
- Replay case proves job can complete successfully after failure condition is removed.

## Labels
`test` `backend` `queue` `reliability`

## How To Test
1. Run backend test suite with notification e2e spec enabled.
2. Validate transient failure case eventually succeeds before max attempts.
3. Validate permanent failure case lands in DLQ with inspectable context.
