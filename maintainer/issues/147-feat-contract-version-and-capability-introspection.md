# [147] feat(contract): add contract version and capability introspection interface

## Summary
Expose explicit version and capability metadata for safer client/indexer compatibility handling.

## Problem
Off-chain consumers currently infer behavior from deployment context instead of querying authoritative capability flags.

## Scope
- Add read methods returning semantic version, build metadata, and supported feature flags.
- Include compatibility markers for event schema and error-code registry versions.
- Ensure metadata updates are controlled and auditable.

## Files
- `xconfess-contract/src/lib.*`
- `xconfess-contract/src/events.*`
- `xconfess-contract/src/errors.*`
- `xconfess-contract/test/*`
- `xconfess-contract/README.md`

## Acceptance Criteria
- Clients can query contract version/capabilities via stable read interface.
- Version metadata aligns with release artifacts and docs.
- Tests fail on accidental capability/metadata drift.

## Labels
`feature` `contract` `integration` `maintainability`

## How To Test
1. Query version/capability methods in test/deployed environment.
2. Validate returned values match release metadata.
3. Verify consumers can branch behavior using capability flags.
