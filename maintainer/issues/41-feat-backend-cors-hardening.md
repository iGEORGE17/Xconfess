# [41] feat(backend): enable CORS and secure API boundary configuration

## Summary
Backend bootstrap does not explicitly configure CORS; frontend relies on cross-origin API access via `NEXT_PUBLIC_API_URL`.

## Problem
Without explicit CORS policy, browser requests can fail or be overly permissive depending on deployment defaults.

## Scope
- Add explicit CORS config in bootstrap with env-driven allowed origins.
- Support credentials policy intentionally (allow/deny by design).
- Document environment variables and local-dev defaults.

## Files
- `xconfess-backend/src/main.ts`
- `xconfess-backend/.env.example` (or docs equivalent)
- `xconfess-backend/README.md`

## Acceptance Criteria
- Browser calls from allowed frontend origins succeed.
- Disallowed origins are blocked.
- CORS behavior is documented for local and production setups.

## Labels
`feature` `backend` `security` `ops`

## How To Test
### Run
- Backend with configured `CORS_ORIGINS`
- Frontend from allowed origin

### Verify
1. Confirm successful preflight + request from allowed origin.
2. Confirm blocked behavior from non-allowed origin.
3. Confirm cookies/authorization behavior matches configured credentials policy.
