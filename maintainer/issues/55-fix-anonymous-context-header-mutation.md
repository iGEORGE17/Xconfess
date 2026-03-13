# [55] fix(backend): avoid mutating request headers in anonymous context middleware

## Summary
Middleware writes generated anonymous context IDs directly into `req.headers`.

## Problem
Mutating inbound headers blurs trust boundaries and can interfere with downstream middleware expectations.

## Scope
- Stop writing server-generated context into `req.headers`.
- Store context in dedicated request property or scoped context service.
- Keep behavior compatible for consumers.

## Files
- `xconfess-backend/src/middleware/anonymous-context.middleware.ts`
- `xconfess-backend/src/middleware/anonymous-context.module.ts`

## Acceptance Criteria
- Anonymous context exists on request context, not inbound header map.
- Downstream consumers can still read generated context.
- No client header spoofing confusion in logs/logic.

## Labels
`bug` `backend` `security` `middleware`

## How To Test
1. Call confession endpoints with and without client-provided context header.
2. Confirm server-generated context is internal only.
3. Verify middleware consumers still work.
