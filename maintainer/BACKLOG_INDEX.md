# Maintainer Backlog Index

This index groups issue specs in [`maintainer/issues/`](./issues/) by primary subsystem so maintainers can triage related work without scanning the full directory.

Use this file as the first stop when deciding where a new issue belongs, who should pick up initial triage, and which neighboring specs should be reviewed together.

## Ownership Map

| Area | Primary paths | Default triage owner |
| --- | --- | --- |
| Frontend | `xconfess-frontend/app`, `xconfess-frontend/components`, `xconfess-frontend/app/lib` | Frontend maintainers |
| Backend | `xconfess-backend/src`, `xconfess-backend/test`, `xconfess-backend/e2e` | Backend maintainers |
| Contracts | `xconfess-contracts/contracts`, `xconfess-contracts/contracts/tests`, `deployments` | Contract maintainers |
| Operations | `xconfess-backend/migrations`, notification delivery, rate limiting, env/config, runbooks, CI/release docs | Operations maintainers |
| Shared platform | Auth contracts, request/response schemas, anonymous session behavior, shared validation/types | Primary owner is the area with the user-facing change; add a secondary reviewer from the adjacent area |
| Repo/docs | `README.md`, `docs/`, `.github/`, `maintainer/`, workspace scripts | Repo maintainers |

## Triage Rules

1. Pick the subsystem that owns the first code change required to unblock the issue.
2. If an issue spans multiple areas, file it once under the primary owner and cross-reference neighboring issues in the description.
3. Keep filenames in `maintainer/issues/` as `NNN-type-area-short-slug.md`.
4. After adding a new issue file, add it to the matching section in this index during the same change.
5. If no single subsystem is clearly primary, place it under `Shared Cross-stack` and call out the expected reviewers.

## Frontend

Focus: Next.js routes, UI state, client API usage, dashboard flows, accessibility, and app-shell behavior.

Related paths: `xconfess-frontend/app`, `xconfess-frontend/app/lib`, `xconfess-frontend/app/components`

- [01-fix-frontend-auth-endpoints](./issues/01-fix-frontend-auth-endpoints.md)
- [04-feat-wire-react-route-to-backend](./issues/04-feat-wire-react-route-to-backend.md)
- [09-feat-dashboard-landing-page](./issues/09-feat-dashboard-landing-page.md)
- [10-feat-profile-page](./issues/10-feat-profile-page.md)
- [11-feat-messages-page](./issues/11-feat-messages-page.md)
- [12-feat-confession-detail-page](./issues/12-feat-confession-detail-page.md)
- [14-refactor-frontend-api-modules](./issues/14-refactor-frontend-api-modules.md)
- [15-feat-use-reactions-hook](./issues/15-feat-use-reactions-hook.md)
- [16-chore-ui-primitives](./issues/16-chore-ui-primitives.md)
- [29-fix-next-route-param-typing](./issues/29-fix-next-route-param-typing.md)
- [38-feat-implement-dashboard-empty-pages](./issues/38-feat-implement-dashboard-empty-pages.md)
- [39-feat-complete-frontend-data-layer](./issues/39-feat-complete-frontend-data-layer.md)
- [40-fix-reaction-route-remove-mock](./issues/40-fix-reaction-route-remove-mock.md)
- [48-feat-nextauth-route-resolution](./issues/48-feat-nextauth-route-resolution.md)
- [49-chore-remove-zero-length-frontend-files](./issues/49-chore-remove-zero-length-frontend-files.md)
- [89-feat-frontend-admin-notification-failures-page](./issues/89-feat-frontend-admin-notification-failures-page.md)
- [93-fix-frontend-confessions-proxy-error-propagation](./issues/93-fix-frontend-confessions-proxy-error-propagation.md)
- [94-fix-frontend-feed-pagination-hasmore-calculation](./issues/94-fix-frontend-feed-pagination-hasmore-calculation.md)
- [95-fix-frontend-auth-page-encoding-corruption](./issues/95-fix-frontend-auth-page-encoding-corruption.md)
- [105-test-frontend-admin-notification-failures-workflow](./issues/105-test-frontend-admin-notification-failures-workflow.md)
- [112-feat-frontend-admin-template-rollout-console](./issues/112-feat-frontend-admin-template-rollout-console.md)
- [115-test-frontend-admin-template-console-workflow](./issues/115-test-frontend-admin-template-console-workflow.md)
- [126-fix-frontend-auth-token-storage-secure-session](./issues/126-fix-frontend-auth-token-storage-secure-session.md)
- [127-feat-frontend-admin-rbac-route-guards](./issues/127-feat-frontend-admin-rbac-route-guards.md)
- [128-feat-frontend-request-correlation-observability](./issues/128-feat-frontend-request-correlation-observability.md)
- [129-refactor-frontend-error-boundary-unification](./issues/129-refactor-frontend-error-boundary-unification.md)
- [130-feat-frontend-openapi-generated-client-adoption](./issues/130-feat-frontend-openapi-generated-client-adoption.md)
- [131-test-frontend-accessibility-keyboard-flow](./issues/131-test-frontend-accessibility-keyboard-flow.md)

## Backend

Focus: NestJS modules, DTOs, request validation, auth flows, moderation logic, and domain APIs.

Related paths: `xconfess-backend/src`, `xconfess-backend/test`, `xconfess-backend/e2e`

- [05-fix-reaction-entity-service-mismatch](./issues/05-fix-reaction-entity-service-mismatch.md)
- [08-fix-confession-di-module-wiring](./issues/08-fix-confession-di-module-wiring.md)
- [20-feat-report-admin-workflow](./issues/20-feat-report-admin-workflow.md)
- [21-fix-confession-route-order](./issues/21-fix-confession-route-order.md)
- [22-feat-report-status-migration](./issues/22-feat-report-status-migration.md)
- [23-feat-admin-reports-list-endpoint](./issues/23-feat-admin-reports-list-endpoint.md)
- [24-feat-admin-report-resolution-endpoint](./issues/24-feat-admin-report-resolution-endpoint.md)
- [25-feat-report-audit-logging](./issues/25-feat-report-audit-logging.md)
- [26-fix-report-dto-validation](./issues/26-fix-report-dto-validation.md)
- [27-fix-report-dedupe-db-constraint](./issues/27-fix-report-dedupe-db-constraint.md)
- [28-fix-report-create-auth-policy](./issues/28-fix-report-create-auth-policy.md)
- [30-fix-confession-response-mapping](./issues/30-fix-confession-response-mapping.md)
- [33-feat-backend-health-endpoint](./issues/33-feat-backend-health-endpoint.md)
- [36-fix-report-module-entity-wiring](./issues/36-fix-report-module-entity-wiring.md)
- [57-fix-report-controller-validation-typing](./issues/57-fix-report-controller-validation-typing.md)
- [58-feat-report-reason-taxonomy](./issues/58-feat-report-reason-taxonomy.md)
- [59-test-report-e2e-dedupe-auth](./issues/59-test-report-e2e-dedupe-auth.md)
- [62-feat-backend-openapi-spec](./issues/62-feat-backend-openapi-spec.md)
- [63-fix-backend-global-validation-pipe](./issues/63-fix-backend-global-validation-pipe.md)
- [65-feat-backend-confession-soft-delete](./issues/65-feat-backend-confession-soft-delete.md)
- [66-fix-backend-pagination-limit-guards](./issues/66-fix-backend-pagination-limit-guards.md)
- [67-feat-backend-idempotency-key-report-create](./issues/67-feat-backend-idempotency-key-report-create.md)
- [68-test-backend-auth-password-reset-e2e](./issues/68-test-backend-auth-password-reset-e2e.md)
- [72-feat-backend-user-deactivation-flow](./issues/72-feat-backend-user-deactivation-flow.md)
- [96-fix-backend-email-encryption-key-default-fallback](./issues/96-fix-backend-email-encryption-key-default-fallback.md)
- [97-fix-backend-password-reset-expiry-cleanup-query](./issues/97-fix-backend-password-reset-expiry-cleanup-query.md)
- [100-feat-backend-moderation-event-escalation-workflow](./issues/100-feat-backend-moderation-event-escalation-workflow.md)
- [101-refactor-backend-confession-model-contract-alignment](./issues/101-refactor-backend-confession-model-contract-alignment.md)
- [106-feat-backend-template-version-canary-rollout](./issues/106-feat-backend-template-version-canary-rollout.md)
- [107-test-backend-template-canary-routing-e2e](./issues/107-test-backend-template-canary-routing-e2e.md)
- [108-fix-backend-template-bucketing-hash-stability](./issues/108-fix-backend-template-bucketing-hash-stability.md)
- [109-feat-backend-template-emergency-kill-switch](./issues/109-feat-backend-template-emergency-kill-switch.md)
- [110-feat-backend-template-lifecycle-state-machine](./issues/110-feat-backend-template-lifecycle-state-machine.md)
- [111-fix-backend-template-variable-schema-enforcement](./issues/111-fix-backend-template-variable-schema-enforcement.md)
- [113-feat-backend-template-version-slo-alerting](./issues/113-feat-backend-template-version-slo-alerting.md)
- [116-chore-backend-template-rollout-audit-diff-history](./issues/116-chore-backend-template-rollout-audit-diff-history.md)

## Contracts

Focus: Soroban contracts, contract test suites, event schemas, governance, access control, and indexer-facing contract surfaces.

Related paths: `xconfess-contracts/contracts`, `xconfess-contracts/contracts/tests`, `deployments`

- [74-feat-contract-workspace-bootstrap](./issues/74-feat-contract-workspace-bootstrap.md)
- [75-feat-contract-confession-registry-model](./issues/75-feat-contract-confession-registry-model.md)
- [76-feat-contract-reaction-counters](./issues/76-feat-contract-reaction-counters.md)
- [77-feat-contract-report-flagging](./issues/77-feat-contract-report-flagging.md)
- [78-feat-contract-admin-role-guard](./issues/78-feat-contract-admin-role-guard.md)
- [79-test-contract-core-flow](./issues/79-test-contract-core-flow.md)
- [80-feat-contract-backend-indexer-sync](./issues/80-feat-contract-backend-indexer-sync.md)
- [81-docs-contract-backend-integration-runbook](./issues/81-docs-contract-backend-integration-runbook.md)
- [117-feat-contract-emergency-pause-guard](./issues/117-feat-contract-emergency-pause-guard.md)
- [118-fix-contract-report-dedupe-and-cooldown](./issues/118-fix-contract-report-dedupe-and-cooldown.md)
- [119-chore-contract-gas-snapshot-ci-budget](./issues/119-chore-contract-gas-snapshot-ci-budget.md)
- [120-test-contract-invariant-property-suite](./issues/120-test-contract-invariant-property-suite.md)
- [121-feat-contract-event-schema-versioning](./issues/121-feat-contract-event-schema-versioning.md)
- [122-fix-contract-pagination-order-cursor-stability](./issues/122-fix-contract-pagination-order-cursor-stability.md)
- [123-feat-contract-admin-role-transfer-timelock](./issues/123-feat-contract-admin-role-transfer-timelock.md)
- [124-test-contract-event-fixture-compatibility](./issues/124-test-contract-event-fixture-compatibility.md)
- [125-docs-contract-release-and-upgrade-runbook](./issues/125-docs-contract-release-and-upgrade-runbook.md)
- [135-fix-contract-admin-revocation-minimum-invariant](./issues/135-fix-contract-admin-revocation-minimum-invariant.md)
- [136-feat-contract-governed-config-parameters](./issues/136-feat-contract-governed-config-parameters.md)
- [137-feat-contract-state-snapshot-checkpoint-reads](./issues/137-feat-contract-state-snapshot-checkpoint-reads.md)
- [138-test-contract-storage-compatibility-regression-suite](./issues/138-test-contract-storage-compatibility-regression-suite.md)
- [139-chore-contract-standardized-error-code-registry](./issues/139-chore-contract-standardized-error-code-registry.md)
- [140-feat-contract-event-correlation-metadata](./issues/140-feat-contract-event-correlation-metadata.md)
- [141-docs-contract-threat-model-and-security-assumptions](./issues/141-docs-contract-threat-model-and-security-assumptions.md)
- [142-feat-contract-entity-event-nonce-ordering](./issues/142-feat-contract-entity-event-nonce-ordering.md)
- [143-test-contract-adversarial-abuse-griefing-suite](./issues/143-test-contract-adversarial-abuse-griefing-suite.md)
- [144-feat-contract-governance-quorum-critical-actions](./issues/144-feat-contract-governance-quorum-critical-actions.md)
- [145-fix-contract-bounded-event-payload-and-string-lengths](./issues/145-fix-contract-bounded-event-payload-and-string-lengths.md)
- [146-test-contract-model-based-state-machine-suite](./issues/146-test-contract-model-based-state-machine-suite.md)
- [147-feat-contract-version-and-capability-introspection](./issues/147-feat-contract-version-and-capability-introspection.md)
- [148-docs-contract-signer-rotation-breakglass-runbook](./issues/148-docs-contract-signer-rotation-breakglass-runbook.md)

## Operations

Focus: deployability, migrations, notification delivery, rate limiting, observability, environment safety, and runbooks.

Related paths: `xconfess-backend/migrations`, backend notification modules, `docs/`, root scripts, release docs

- [34-fix-typeorm-synchronize-env-gating](./issues/34-fix-typeorm-synchronize-env-gating.md)
- [41-feat-backend-cors-hardening](./issues/41-feat-backend-cors-hardening.md)
- [46-fix-notification-recipient-resolution](./issues/46-fix-notification-recipient-resolution.md)
- [47-refactor-structured-logging-services](./issues/47-refactor-structured-logging-services.md)
- [52-fix-rate-limit-interval-lifecycle](./issues/52-fix-rate-limit-interval-lifecycle.md)
- [53-feat-distributed-rate-limiting](./issues/53-feat-distributed-rate-limiting.md)
- [54-feat-endpoint-rate-limit-overrides](./issues/54-feat-endpoint-rate-limit-overrides.md)
- [64-feat-backend-request-id-correlation-logging](./issues/64-feat-backend-request-id-correlation-logging.md)
- [69-feat-backend-notification-retry-dlq](./issues/69-feat-backend-notification-retry-dlq.md)
- [70-chore-backend-migration-startup-check](./issues/70-chore-backend-migration-startup-check.md)
- [71-fix-backend-moderation-webhook-signature](./issues/71-fix-backend-moderation-webhook-signature.md)
- [82-feat-backend-notification-dlq-replay-endpoint](./issues/82-feat-backend-notification-dlq-replay-endpoint.md)
- [83-feat-backend-notification-delivery-metrics](./issues/83-feat-backend-notification-delivery-metrics.md)
- [84-fix-backend-notification-enqueue-idempotency](./issues/84-fix-backend-notification-enqueue-idempotency.md)
- [85-feat-backend-email-provider-fallback-circuit-breaker](./issues/85-feat-backend-email-provider-fallback-circuit-breaker.md)
- [86-test-backend-notification-retry-dlq-e2e](./issues/86-test-backend-notification-retry-dlq-e2e.md)
- [87-chore-backend-notification-log-redaction](./issues/87-chore-backend-notification-log-redaction.md)
- [88-feat-backend-notification-template-versioning](./issues/88-feat-backend-notification-template-versioning.md)
- [90-docs-backend-notification-operations-runbook](./issues/90-docs-backend-notification-operations-runbook.md)
- [91-chore-backend-dlq-retention-cleanup](./issues/91-chore-backend-dlq-retention-cleanup.md)
- [98-fix-backend-migration-sql-typeorm-drift](./issues/98-fix-backend-migration-sql-typeorm-drift.md)
- [102-feat-backend-notification-template-preview-endpoint](./issues/102-feat-backend-notification-template-preview-endpoint.md)
- [103-fix-backend-notification-worker-lifecycle-startup-shutdown](./issues/103-fix-backend-notification-worker-lifecycle-startup-shutdown.md)
- [104-feat-backend-user-notification-preferences-enforcement](./issues/104-feat-backend-user-notification-preferences-enforcement.md)
- [114-docs-backend-template-rollout-runbook](./issues/114-docs-backend-template-rollout-runbook.md)
- [132-chore-backend-centralized-env-schema-validation](./issues/132-chore-backend-centralized-env-schema-validation.md)
- [133-feat-backend-transactional-outbox-notifications](./issues/133-feat-backend-transactional-outbox-notifications.md)

## Shared Cross-stack

Focus: issues that change contracts between frontend, backend, auth, messaging, anonymous context, or shared validation/types.

Default routing: assign a primary owner based on the first required code change and request review from the adjacent subsystem.

- [02-refactor-token-key-standardization](./issues/02-refactor-token-key-standardization.md)
- [03-refactor-unify-useauth](./issues/03-refactor-unify-useauth.md)
- [06-fix-messages-anonymous-ownership](./issues/06-fix-messages-anonymous-ownership.md)
- [07-fix-jwt-user-payload-contract](./issues/07-fix-jwt-user-payload-contract.md)
- [13-feat-confession-form](./issues/13-feat-confession-form.md)
- [17-docs-api-reconciliation](./issues/17-docs-api-reconciliation.md)
- [18-test-core-e2e-flow](./issues/18-test-core-e2e-flow.md)
- [31-refactor-centralize-confession-types](./issues/31-refactor-centralize-confession-types.md)
- [32-chore-fix-emoji-encoding](./issues/32-chore-fix-emoji-encoding.md)
- [37-fix-auth-contract-token-unification](./issues/37-fix-auth-contract-token-unification.md)
- [42-fix-messages-confession-id-type-consistency](./issues/42-fix-messages-confession-id-type-consistency.md)
- [43-fix-confession-owner-relation-alias](./issues/43-fix-confession-owner-relation-alias.md)
- [44-fix-jwt-request-user-shape](./issues/44-fix-jwt-request-user-shape.md)
- [45-fix-auth-log-email-field-usage](./issues/45-fix-auth-log-email-field-usage.md)
- [50-feat-shared-validation-utils](./issues/50-feat-shared-validation-utils.md)
- [51-fix-auth-redirect-flow](./issues/51-fix-auth-redirect-flow.md)
- [55-fix-anonymous-context-header-mutation](./issues/55-fix-anonymous-context-header-mutation.md)
- [56-feat-stable-anonymous-context-session](./issues/56-feat-stable-anonymous-context-session.md)
- [60-test-messages-e2e-ownership-reply](./issues/60-test-messages-e2e-ownership-reply.md)
- [92-fix-frontend-confessions-proxy-upstream-url-contract](./issues/92-fix-frontend-confessions-proxy-upstream-url-contract.md)
- [99-fix-backend-confession-fulltext-search-schema-contract](./issues/99-fix-backend-confession-fulltext-search-schema-contract.md)
- [134-test-backend-api-error-contract-conformance](./issues/134-test-backend-api-error-contract-conformance.md)

## Repo And Docs

Focus: maintainer workflow, contributor onboarding, workspace hygiene, and root-level documentation quality.

Related paths: `README.md`, `docs/`, `.github/`, `maintainer/`, root workspace scripts

- [19-chore-repo-hygiene-node-modules](./issues/19-chore-repo-hygiene-node-modules.md)
- [35-docs-issue-templates-triage](./issues/35-docs-issue-templates-triage.md)
- [61-docs-readme-reality-check](./issues/61-docs-readme-reality-check.md)

## When Adding A New Issue

1. Create the issue file in [`maintainer/issues/`](./issues/) using the next available number.
2. Choose one primary section in this index based on the first subsystem that must change.
3. Add the issue link to that section in the same PR.
4. If it has a strong secondary dependency, mention the related issue numbers in the new file's summary or problem section.
5. If the work changes process or ownership expectations, update the `Ownership Map` above as part of the same change.
