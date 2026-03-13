# [81] docs(fullstack): add contract-backend integration runbook for local and CI

## Summary
Document complete developer workflow for contract deployment, event sync, and API validation.

## Problem
Contributors cannot reliably reproduce contract-integrated backend flows without a runbook.

## Scope
- Add local setup guide for contract toolchain and dev network.
- Document deploy -> seed -> index -> API verify sequence.
- Add CI notes for deterministic contract test and indexer jobs.

## Files
- `README.md`
- `xconfess-backend/README.md`
- `xconfess-contract/README.md`
- `docs/contract-backend-runbook.md` (new)

## Acceptance Criteria
- Fresh contributor can follow steps from clone to validated API response.
- Required env vars and scripts are documented with examples.
- Runbook includes common failure modes and recovery steps.

## Labels
`documentation` `backend` `contract` `onboarding`

## How To Test
1. Execute runbook steps on clean environment.
2. Confirm contract tests, deploy, indexer, and API checks succeed.
3. Validate CI job references align with documented commands.