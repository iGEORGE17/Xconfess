# [71] fix(backend): verify moderation webhook signature before processing

## Summary
Harden moderation webhook endpoint with signature validation and replay protection.

## Problem
Webhook endpoints without signature checks are vulnerable to spoofed moderation events.

## Scope
- Require and validate HMAC signature header.
- Reject stale or replayed webhook payloads.
- Log signature failures with request metadata.

## Files
- `xconfess-backend/src/moderation/moderation-webhook.controller.ts`
- `xconfess-backend/src/moderation/**/*.ts`
- `xconfess-backend/.env.sample`

## Acceptance Criteria
- Invalid/missing signatures return 401/403 and do not mutate data.
- Valid signatures process normally.
- Replay attempts are detected and rejected.

## Labels
`bug` `backend` `security` `moderation`

## How To Test
1. Send webhook payload with valid signature and verify success.
2. Send same payload with invalid signature and verify rejection.
3. Replay previously accepted payload and verify replay protection.