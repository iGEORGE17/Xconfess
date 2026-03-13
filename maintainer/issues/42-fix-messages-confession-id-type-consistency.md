# [42] fix(backend): align message confession ID types across DTO/controller/service

## Summary
Messaging currently treats `confession_id` as `number`, while confessions use UUID strings.

## Problem
Type mismatch causes parsing friction and potential runtime errors in message create/list flows.

## Scope
- Change message DTO `confession_id` to UUID string.
- Remove integer-only parsing in controller.
- Ensure service queries by UUID consistently.

## Files
- `xconfess-backend/src/messages/dto/message.dto.ts`
- `xconfess-backend/src/messages/messages.controller.ts`
- `xconfess-backend/src/messages/messages.service.ts`

## Acceptance Criteria
- Message create and list endpoints accept confession UUIDs end-to-end.
- No number-to-string coercion hacks remain.
- Validation rejects malformed UUID input.

## Labels
`bug` `backend` `messages` `api`

## How To Test
1. Create confession, then send message with UUID confession ID.
2. Fetch messages for same confession UUID.
3. Send invalid confession ID and confirm 400.
