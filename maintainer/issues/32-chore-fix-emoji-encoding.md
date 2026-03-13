# [32] chore(frontend): fix mojibake/corrupted emoji literals

## Summary
Some UI files contain corrupted emoji text encoding.

## Problem
Rendered text/icons look broken and inconsistent across environments.

## Scope
- Replace corrupted literals with valid UTF-8 emoji or icon components.
- Ensure files are saved with correct encoding.

## Files
- `xconfess-frontend/app/components/confession/ConfessionCard.tsx`
- `xconfess-frontend/app/components/confession/ReactionButtons.tsx`

## Acceptance Criteria
- Emojis/icons render correctly in UI.
- No corrupted sequences in source files.
- Lint/build pass.

## Labels
`chore` `frontend` `ui`

## How To Test
### Prerequisites
- `npm install`

### Run
- `npm run dev:frontend`

### Verify
1. Open confession feed.
2. Confirm view/comment/reaction icons render correctly.
3. Search source for corrupted sequences and confirm removal.
