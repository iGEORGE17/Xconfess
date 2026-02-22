# xConfess Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

The robust NestJS-based backend for **xConfess**, an anonymous confession platform built on the Stellar blockchain.

## 🚀 Overview

The backend handles the core business logic, real-time interactions, and blockchain integration for the xConfess ecosystem. It provides a secure, scalable API for managing anonymous confessions, reactions, and micro-tips.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://github.com/nestjs/nest) (v10+)
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Real-time**: Socket.io (WebSockets)
- **Caching**: Redis
- **Blockchain**: Stellar SDK & Soroban Integration
- **Validation**: Zod / Class-validator

## 📁 Key Modules

- **`confession`**: Manages the creation and retrieval of anonymous confessions.
- **`reaction`**: Handles real-time emoji reactions to confessions.
- **`stellar`**: Core service for Stellar blockchain and Soroban contract interactions.
- **`tipping`**: Manages XLM tipping logic and on-chain verification.
- **`admin`**: Secure dashboard for community moderation.
- **`data-export`**: GDPR-compliant personal data export with secure signed URLs.
- **`report`**: Community reporting system for content moderation.

## ⚙️ Development Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- Redis (optional, for caching)

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/xconfess
JWT_SECRET=your-secret
PORT=5000

# Stellar
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

### Run Project

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e
```

## 📜 API Documentation

Once the server is running, access the Swagger documentation at:
`http://localhost:5000/api/docs`

## 📄 License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
