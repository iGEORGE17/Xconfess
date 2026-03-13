# [50] feat(frontend): add shared validation utilities and schema reuse

## Summary
`app/lib/utils/validation.ts` is empty, while forms define ad hoc schemas inline.

## Problem
Validation logic is duplicated and can drift across forms/endpoints.

## Scope
- Add reusable validation helpers/schemas for auth and common forms.
- Export typed helpers for client-side parsing/error messages.
- Adopt shared schemas in login/register/confession forms.

## Files
- `xconfess-frontend/app/lib/utils/validation.ts`
- `xconfess-frontend/app/(auth)/login/page.tsx`
- `xconfess-frontend/app/(auth)/register/page.tsx`
- `xconfess-frontend/app/components/confession/ConfessionForm.tsx`

## Acceptance Criteria
- Validation helpers are centralized and imported by forms.
- Form-level duplication is reduced.
- User-facing validation behavior remains correct.

## Labels
`feature` `frontend` `devex` `forms`

## How To Test
1. Submit invalid auth/confession form payloads.
2. Confirm shared validation messages appear.
3. Verify form submissions still succeed with valid input.
