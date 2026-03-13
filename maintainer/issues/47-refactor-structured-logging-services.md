# [47] refactor(backend): replace direct console usage in queue/logger services

## Summary
`console.log/error` is used directly in logging/queue services instead of Nest logger abstractions.

## Problem
Unstructured logging reduces observability quality and complicates production log pipelines.

## Scope
- Replace `console.*` with Nest logger service usage.
- Standardize context names and metadata format.
- Preserve masking/sanitization behavior.

## Files
- `xconfess-backend/src/logger/logger.service.ts`
- `xconfess-backend/src/notification/notification.queue.ts`

## Acceptance Criteria
- No direct `console.*` calls remain in scoped services.
- Logs include context and structured metadata.
- Existing log redaction behavior remains intact.

## Labels
`refactor` `backend` `observability`

## How To Test
1. Trigger queue job success/failure and auth logs.
2. Verify output format is consistent and contextual.
3. Confirm no regression in masked identifiers.
