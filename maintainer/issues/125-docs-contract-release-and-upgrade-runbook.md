# [125] docs(contract): publish release and upgrade runbook with rollback criteria

## Summary
Document production-grade release flow for contract deployment, verification, and rollback.

## Problem
Contract release steps are fragmented, increasing operational risk during upgrades.

## Scope
- Create runbook covering preflight checks, deploy, verify, and post-deploy smoke tests.
- Define rollback criteria and emergency response procedure.
- Add artifact/version checklist for reproducible releases.

## Files
- `xconfess-contract/README.md`
- `docs/contract-release-upgrade-runbook.md` (new)
- `.github/workflows/contract-release.yml` (if applicable)

## Acceptance Criteria
- On-call can execute release flow from runbook without tribal knowledge.
- Rollback triggers and verification checkpoints are explicit.
- Runbook references current scripts/commands in repository.

## Labels
`documentation` `contract` `release` `ops`

## How To Test
1. Execute a staged dry-run using the runbook steps.
2. Validate every command/link resolves in the repository.
3. Simulate rollback decision path and verify checklist completeness.
