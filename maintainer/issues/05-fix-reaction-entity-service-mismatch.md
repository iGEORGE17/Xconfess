# [05] fix(backend): align ReactionService with Reaction entity schema

## Summary
Reaction service uses fields/relations that do not match the `Reaction` entity.

## Problem
Entity expects `anonymousUser`; service references `user` and `confession.user`.

## Scope
- Make service use valid entity relations.
- Remove invalid `confession.user` assumptions.
- Adjust related notifications logic.

## Files
- `xconfess-backend/src/reaction/reaction.service.ts`
- `xconfess-backend/src/reaction/entities/reaction.entity.ts`
- `xconfess-backend/src/confession/entities/confession.entity.ts`

## Acceptance Criteria
- Reaction creation works against current schema.
- No runtime relation errors.
- Unit tests cover happy path + invalid confession path.

## Labels
`bug` `backend` `typeorm` `high priority`

## How To Test
### Prerequisites
- From repo root: `npm install`
- Configure backend env in `xconfess-backend/.env` (DB, JWT, required keys)
- Start PostgreSQL and ensure connection values are valid

### Run
- `npm run dev:backend`

### Verify
1. Exercise affected endpoint(s) with Postman/curl.
2. Confirm success path matches Acceptance Criteria.
3. Confirm failure paths return correct status codes/messages.
4. Validate no runtime Nest DI/entity relation errors in logs.

### Optional checks
- `npm run test --workspace=xconfess-backend`
- `npm run lint --workspace=xconfess-backend`
