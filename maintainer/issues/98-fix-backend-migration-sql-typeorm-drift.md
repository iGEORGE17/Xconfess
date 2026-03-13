# [98] fix(backend): reconcile SQL migration files with TypeORM migration pipeline and table names

## Summary
Align migration strategy so schema changes for confessions/search/view count are actually applied in managed environments.

## Problem
Current SQL migration files use table names that drift from entities and are not loaded by TypeORM migration config (`*.ts,*.js` only).

## Scope
- Decide canonical migration format (TypeORM class migrations or SQL runner integration).
- Port/repair SQL migrations to correct table names and active migration pipeline.
- Add migration verification check in CI/startup for expected columns/indexes.

## Files
- `xconfess-backend/data-source.ts`
- `xconfess-backend/migrations/add-fulltext-search.sql`
- `xconfess-backend/migrations/add-view-count-to-confessions.sql`
- `xconfess-backend/src/config/database.config.ts`

## Acceptance Criteria
- Migration runner applies confession search/view-count schema changes deterministically.
- Table/column names in migrations match entity mappings.
- New environment bootstrap yields schema required by repository queries.

## Labels
`bug` `backend` `database` `migrations`

## How To Test
1. Bootstrap fresh DB and run migrations from clean state.
2. Verify expected confession columns/indexes exist.
3. Run app search/view-count paths without SQL column errors.
