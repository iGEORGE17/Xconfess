# [33] feat(backend): add health and readiness endpoint

## Summary
Add runtime health visibility for backend services.

## Problem
No easy way to confirm app, DB, and Redis readiness.

## Scope
- Add `/health` endpoint.
- Include component statuses for app/database/redis.

## Files
- `xconfess-backend/src/app.controller.ts`
- `xconfess-backend/src/app.module.ts`
- related health service files

## Acceptance Criteria
- `/health` returns structured status JSON.
- Degraded dependency surfaces non-healthy status.
- Endpoint documented.

## Labels
`feature` `backend` `ops`

## How To Test
### Prerequisites
- `npm install`
- Backend dependencies configured

### Run
- `npm run dev:backend`

### Verify
1. Call `/health` with all services up.
2. Stop one dependency (e.g., redis) and re-check response.
3. Confirm response indicates degraded/not-ready state.
