# [74] feat(contract): bootstrap dedicated smart contract workspace in monorepo

## Summary
Create a first-class contract workspace with build/test scripts integrated into root tooling.

## Problem
Contract development is blocked by missing workspace structure and standardized commands.

## Scope
- Add `xconfess-contract/` workspace scaffold.
- Add root scripts for contract build/test/lint.
- Document toolchain prerequisites in root and contract README.

## Files
- `package.json`
- `xconfess-contract/package.json` (new)
- `xconfess-contract/README.md` (new)
- `README.md`

## Acceptance Criteria
- Contract workspace installs via root `npm install`.
- `npm run test --workspace=xconfess-contract` executes successfully.
- README documents setup steps and expected outputs.

## Labels
`feature` `contract` `monorepo` `tooling`

## How To Test
1. Clone repo on clean machine and run `npm install`.
2. Execute contract workspace build/test scripts.
3. Verify root docs include contract workflow.