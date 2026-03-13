# [103] fix(backend): harden notification worker lifecycle for startup and graceful shutdown

## Summary
Stabilize queue worker initialization and teardown to avoid lost jobs during deploy/restart cycles.

## Problem
Worker is constructed inline in service constructor, which can create race conditions and unclean shutdown behavior under process restarts.

## Scope
- Move worker/queue initialization into explicit lifecycle hooks (`onModuleInit`).
- Ensure graceful close/drain handling in `onModuleDestroy` and process shutdown.
- Add startup and shutdown logs/health signals for worker readiness.

## Files
- `xconfess-backend/src/notification/notification.queue.ts`
- `xconfess-backend/src/notification/notification.module.ts`
- `xconfess-backend/src/main.ts`
- `xconfess-backend/src/logger/logger.service.ts`

## Acceptance Criteria
- Worker registers after app bootstrap and reports ready state.
- Shutdown closes worker/queue cleanly without hanging process.
- In-flight job behavior on shutdown is deterministic and documented.

## Labels
`bug` `backend` `queue` `reliability`

## How To Test
1. Start backend and verify worker readiness log is emitted once.
2. Enqueue jobs, then trigger graceful shutdown.
3. Confirm process exits cleanly and jobs are not silently lost.
