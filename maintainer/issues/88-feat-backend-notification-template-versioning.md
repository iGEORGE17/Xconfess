# [88] feat(backend): add versioned notification template registry and rendering guardrails

## Summary
Introduce template versioning so notification content updates are controlled and traceable.

## Problem
Unversioned templates make rollback and incident debugging difficult when content changes cause send failures.

## Scope
- Add registry mapping template key to active version.
- Validate required variables before rendering template.
- Persist template key and version in notification job metadata.

## Files
- `xconfess-backend/src/email/email.service.ts`
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/config/email.config.ts`
- `xconfess-backend/src/audit-log/audit-log.service.ts`

## Acceptance Criteria
- Notification jobs store template key/version used at enqueue time.
- Rendering fails fast with clear error when required variables are missing.
- Operator can roll active template version forward/backward safely.

## Labels
`feature` `backend` `email` `maintainability`

## How To Test
1. Register two template versions and switch active version.
2. Send notification and confirm metadata records selected version.
3. Trigger missing-variable case and verify actionable validation error.
