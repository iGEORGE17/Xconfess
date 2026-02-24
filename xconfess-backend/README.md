# xConfess Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

> NestJS-based backend for the xConfess anonymous confession platform.

## Active Modules

| Module | Path | Description |
|--------|------|-------------|
| Auth | `src/auth/` | JWT authentication, guards, decorators |
| User | `src/user/` | User + anonymous user management |
| Confession | `src/confession/` | Confession CRUD, search, tags, encryption |
| Reaction | `src/reaction/` | Emoji reactions with WebSocket |
| Comment | `src/comment/` | Nested commenting system |
| Messages | `src/messages/` | Anonymous messaging (author-reply) |
| Report | `src/report/` | Report creation & resolution |
| Admin | `src/admin/` | Admin panel with RBAC |
| Moderation | `src/moderation/` | AI content moderation (OpenAI) |
| Audit Log | `src/audit-log/` | Comprehensive audit trail |
| Logger | `src/logger/` | Structured logging with PII masking |
| Stellar | `src/stellar/` | Stellar blockchain integration |
| Tipping | `src/tipping/` | XLM micro-tipping |
| Encryption | `src/encryption/` | Field-level confession encryption |
| Cache | `src/cache/` | Redis/in-memory caching |
| Analytics | `src/analytics/` | View counts, trending |
| Data Export | `src/data-export/` | GDPR data export |
| WebSocket | `src/websocket/` | Real-time event gateway |
| Notifications | `src/notifications/` | Notification system (Bull/Redis — disabled by default) |

## Project Setup

```bash
npm install
```

## Compile and Run

```bash
# development
npm run start:dev

# production mode
npm run build
npm run start:prod
```

## Run Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=xconfess
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
APP_ENV=local
TYPEORM_SYNCHRONIZE=false
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

### TypeORM Synchronize Policy

- Default is `false` in all environments.
- Sync is enabled only when both conditions are true:
  - environment is local/dev (`NODE_ENV` or `APP_ENV` is `local`/`dev`/`development`)
  - `TYPEORM_SYNCHRONIZE=true`
- In non-dev environments, schema sync remains disabled even if the flag is set.

## Database Migrations

Migrations are the authoritative schema-evolution mechanism for non-dev environments.

```bash
# generate a migration from local entity changes
npm run migration:generate -- ./migrations/<migration-name>

# apply pending migrations
npm run migration:run

# revert the latest migration (if needed)
npm run migration:revert
```

## API Documentation

When running locally, Swagger docs are available at `/api/api-docs`.

## 📄 License

[MIT licensed](../LICENSE)
