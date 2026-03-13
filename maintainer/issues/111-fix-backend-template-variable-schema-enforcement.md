# [111] fix(backend): enforce strict template variable schema and reject unknown keys

## Summary
Strengthen template rendering safety by validating both required and allowed variables.

## Problem
Current validation focus on missing variables can still allow malformed payloads with unexpected keys/types.

## Scope
- Define per-template variable schemas (required keys, optional keys, primitive types).
- Reject payloads with unknown keys or type mismatches before render.
- Include schema violations in operator-visible error metadata.

## Files
- `xconfess-backend/src/email/email.service.ts`
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/config/email.config.ts`
- `xconfess-backend/src/email/email.service.spec.ts`

## Acceptance Criteria
- Rendering fails fast for missing, unknown, or incorrectly typed variables.
- Validation errors identify offending keys and expected schema.
- Unit tests cover valid payload, missing key, unknown key, and type mismatch cases.

## Labels
`bug` `backend` `email` `validation`

## How To Test
1. Render template with valid payload and verify success.
2. Send payloads with unknown/type-invalid fields and verify rejection.
3. Confirm queue stores actionable error context for failed render.
