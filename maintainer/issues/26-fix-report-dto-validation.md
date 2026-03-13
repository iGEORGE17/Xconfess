# [26] fix(backend): add strict DTO validation for report admin actions

## Summary
Admin report action payloads need strict schema validation.

## Problem
Malformed request payloads may pass through and cause inconsistent behavior.

## Scope
- Add DTO classes and class-validator rules.
- Restrict enum values for report status updates.

## Files
- `xconfess-backend/src/report/dto/*`
- `xconfess-backend/src/report/reports.controller.ts`

## Acceptance Criteria
- Invalid payload returns 400 with clear error message.
- Valid payload accepted.
- Validation behavior covered in tests.

## Labels
`bug` `backend` `validation`

## How To Test
### Prerequisites
- `npm install`
- Backend running

### Run
- `npm run dev:backend`

### Verify
1. Send invalid action values and missing fields.
2. Confirm 400 responses.
3. Send valid payload and confirm success.
