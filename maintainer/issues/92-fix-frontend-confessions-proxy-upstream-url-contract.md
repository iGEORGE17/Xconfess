# [92] fix(frontend): harden confessions proxy upstream URL contract and fail-fast behavior

## Summary
Use a dedicated server-side backend URL for the confessions proxy and fail explicitly when it is missing/misconfigured.

## Problem
`/api/confessions` currently falls back to `http://localhost:3000`, which can target the frontend app instead of backend and hide integration errors.

## Scope
- Replace `NEXT_PUBLIC_API_URL` usage in server route with backend-only env (`BACKEND_API_URL` or equivalent).
- Validate upstream URL at request time and return actionable 5xx when absent.
- Document required env variables for frontend proxy in README/env sample.

## Files
- `xconfess-frontend/app/api/confessions/route.ts`
- `xconfess-frontend/README.md`
- `xconfess-frontend/.env.example` (new)

## Acceptance Criteria
- Confessions proxy never defaults to frontend origin for backend calls.
- Missing/invalid backend URL returns explicit error response with clear message.
- Local and deployed environments document exact proxy env contract.

## Labels
`bug` `frontend` `api` `configuration`

## How To Test
1. Run frontend without backend URL env and call `/api/confessions`.
2. Confirm route returns explicit configuration error (not fake data).
3. Set valid backend URL and verify upstream request succeeds.
