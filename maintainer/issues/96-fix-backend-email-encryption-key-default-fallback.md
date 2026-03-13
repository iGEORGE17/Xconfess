# [96] fix(backend): remove default email encryption key fallback and enforce strict key validation

## Summary
Eliminate insecure hardcoded encryption key fallback and require explicit key configuration.

## Problem
Crypto utility currently falls back to a static default key, creating deterministic encryption risk if env configuration is missing.

## Scope
- Remove fallback default from `EMAIL_ENCRYPTION_KEY` resolution.
- Validate key presence/length at startup and fail fast on invalid config.
- Document key generation/rotation expectations in backend env docs.

## Files
- `xconfess-backend/src/common/crypto.util.ts`
- `xconfess-backend/src/main.ts`
- `xconfess-backend/.env.sample`
- `xconfess-backend/README.md`

## Acceptance Criteria
- Application does not boot without valid encryption key configuration.
- Encryption/decryption functions reject malformed keys with clear errors.
- No hardcoded default key remains in source.

## Labels
`bug` `backend` `security` `configuration`

## How To Test
1. Start backend without `EMAIL_ENCRYPTION_KEY` and verify fail-fast error.
2. Start with invalid-length key and verify explicit validation error.
3. Start with valid key and confirm auth/email flows still work.
