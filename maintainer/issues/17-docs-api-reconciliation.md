# [17] docs: reconcile API docs with actual backend routes

## Summary
`API_DOCUMENTATION.md` does not match controllers/entities in code.

## Problem
Contributors implement against outdated endpoints/payloads.

## Scope
- Update route list, payload examples, and auth flow docs.
- Remove legacy or incorrect endpoints.

## Files
- `xconfess-backend/API_DOCUMENTATION.md`
- `README.md`
- `xconfess-backend/README.md`

## Acceptance Criteria
- Documented routes match controller decorators exactly.
- Auth section reflects `/users/*` vs `/auth/*` split.
- Request/response examples compile with current DTOs.

## Labels
`documentation` `backend` `frontend`

## How To Test
### Verify documentation quality
1. Compare documented routes against controller decorators in backend.
2. Run each sample request and confirm payload/response correctness.
3. Ensure setup instructions match current workspace scripts.
4. Ask a contributor unfamiliar with the repo to follow docs and report gaps.

### Optional checks
- Markdown preview for formatting
- Link validation for internal references
