# [102] feat(backend): add admin template preview endpoint with strict variable validation

## Summary
Provide a safe preview API so operators can render notification templates before enabling new versions.

## Problem
Template changes are currently validated only at send time, increasing risk of production failures after rollout.

## Scope
- Add admin-only endpoint to preview a template by key/version with sample payload.
- Reuse production render path and required-variable validation rules.
- Return rendered subject/body plus validation errors without sending email.

## Files
- `xconfess-backend/src/email/email.service.ts`
- `xconfess-backend/src/email/email.module.ts`
- `xconfess-backend/src/email/email.controller.ts` (new)
- `xconfess-backend/src/auth/admin.guard.ts`

## Acceptance Criteria
- Admin can preview any registered template version.
- Missing/invalid template variables return actionable validation errors.
- Preview endpoint never dispatches real notification jobs/emails.

## Labels
`feature` `backend` `email` `admin`

## How To Test
1. Call preview endpoint with valid template payload and verify rendered output.
2. Omit required fields and confirm clear validation errors.
3. Confirm no email is sent and no queue job is created.
