# [68] test(backend): add auth e2e coverage for password reset lifecycle

## Summary
Expand auth e2e tests for forgot/reset token flow and invalid token handling.

## Problem
Password reset path is security-sensitive but under-tested at API boundary.

## Scope
- Add e2e cases for forgot-password request, token use, and expiration.
- Add negative tests for invalid/reused tokens.
- Verify login behavior before and after successful reset.

## Files
- `xconfess-backend/test/*.e2e-spec.ts`
- `xconfess-backend/src/auth/**/*.ts`

## Acceptance Criteria
- Successful reset updates credentials and invalidates old password.
- Expired/invalid tokens return expected error codes.
- Reused token attempts are rejected.

## Labels
`test` `backend` `auth` `security`

## How To Test
1. Run backend e2e test suite.
2. Confirm password reset scenarios pass in CI and local.
3. Review coverage for auth reset services/controllers.