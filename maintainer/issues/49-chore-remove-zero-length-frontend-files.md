# [49] chore(frontend): eliminate zero-length source files in app layer

## Summary
Multiple frontend source files are zero bytes (pages, components, utils, stores, types).

## Problem
Empty tracked files increase maintenance cost and hide unfinished runtime paths.

## Scope
- Delete truly unused files.
- Implement minimal scaffold in files that are part of active routes/imports.
- Ensure no broken imports remain.

## Files
- `xconfess-frontend/app/**` (zero-length files only)

## Acceptance Criteria
- No zero-length TypeScript/TSX source files remain under app layer.
- Build and lint pass without unresolved imports.
- Active routes render non-empty content.

## Labels
`chore` `frontend` `repo hygiene` `devex`

## How To Test
1. Run `npm run build --workspace=xconfess-frontend`.
2. Run `npm run lint --workspace=xconfess-frontend`.
3. Verify all routes/import paths resolve.
