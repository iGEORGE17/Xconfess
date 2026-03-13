# [95] fix(frontend): repair auth page text mojibake and enforce UTF-8-safe literals

## Summary
Fix corrupted characters in login/register UI placeholders and labels.

## Problem
Auth pages contain mojibake sequences (`â€¢...`) that degrade UX and indicate encoding drift in source files.

## Scope
- Replace corrupted placeholder literals with ASCII-safe text or valid UTF-8 symbols.
- Ensure files are saved and committed with UTF-8 encoding.
- Add lint/check step to catch common mojibake sequences in TSX.

## Files
- `xconfess-frontend/app/(auth)/login/page.tsx`
- `xconfess-frontend/app/(auth)/register/page.tsx`
- `xconfess-frontend/package.json`

## Acceptance Criteria
- Password placeholders/labels render correctly across browsers.
- No mojibake sequences remain in auth page source.
- CI/lint guard fails on reintroduced corrupted literals.

## Labels
`bug` `frontend` `ui` `quality`

## How To Test
1. Run frontend and open login/register pages.
2. Verify placeholder text renders correctly (no corrupted glyphs).
3. Run lint/check command and confirm mojibake check passes.
