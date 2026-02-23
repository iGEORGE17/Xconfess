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
DATABASE_URL=postgresql://user:pass@localhost:5432/xconfess
JWT_SECRET=your-secret-key
PORT=5000
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

## Database Migrations

```bash
npm run migration:run
```

## API Documentation

When running locally, Swagger docs are available at `/api/api-docs`.

## License

[MIT licensed](../LICENSE)
