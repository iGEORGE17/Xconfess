# [141] docs(contract): publish contract threat model and security assumption document

## Summary
Document security boundaries, threat scenarios, and trust assumptions for the contract system.

## Problem
Security decisions are implicit, making audits and incident response slower and less consistent.

## Scope
- Add threat model covering privilege abuse, replay, griefing, and state corruption vectors.
- Document trust assumptions for admins, indexers, and off-chain services.
- Link mitigations to implemented controls (pause, timelock, dedupe, invariants).

## Files
- `docs/contract-threat-model.md` (new)
- `xconfess-contract/README.md`
- `maintainer/issues/117-feat-contract-emergency-pause-guard.md`
- `maintainer/issues/123-feat-contract-admin-role-transfer-timelock.md`

## Acceptance Criteria
- Threat model lists prioritized risks with mitigation status.
- Security assumptions are explicit and reviewable by contributors.
- Document is actionable for audits and release sign-off.

## Labels
`documentation` `contract` `security` `ops`

## How To Test
1. Run security review walkthrough using the new threat model.
2. Validate each listed mitigation maps to code or backlog issue.
3. Confirm reviewers can derive release security checklist from document.
