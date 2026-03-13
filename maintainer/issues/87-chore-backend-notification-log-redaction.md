# [87] chore(backend): redact sensitive notification payload fields in logs

## Summary
Harden logging by masking PII and secrets in notification and email execution logs.

## Problem
Notification logs may include raw recipient identifiers or message content not safe for shared logs.

## Scope
- Define redaction rules for email addresses, tokens, and template variables.
- Apply redaction consistently across logger, queue worker, and email service.
- Add unit tests for masking behavior and edge cases.

## Files
- `xconfess-backend/src/logger/logger.service.ts`
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/email/email.service.ts`
- `xconfess-backend/src/utils/mask-user-id.ts`

## Acceptance Criteria
- Logs contain masked values for configured sensitive fields.
- Redaction preserves enough context for debugging failures.
- Tests cover nested payloads and missing-field scenarios.

## Labels
`chore` `backend` `security` `logging`

## How To Test
1. Trigger notification sends with representative payload data.
2. Inspect logs and verify sensitive fields are masked.
3. Run masking unit tests and confirm pass on nested payload cases.
