# xConfess

<div align="center">

![xConfess Banner](https://img.shields.io/badge/xConfess-Anonymous%20Confessions-blueviolet?style=for-the-badge)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Stellar](https://img.shields.io/badge/Built%20on-Stellar-7D00FF?style=for-the-badge&logo=stellar)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-00ADD8?style=for-the-badge)](https://soroban.stellar.org)

**A privacy-first anonymous confession platform leveraging Stellar blockchain for immutability, transparency, and trustless verification.**

[💬 Community](https://t.me/xconfess_Community) • [🐛 Report Bug](https://github.com/Godsmiracle001/Xconfess/issues)

</div>

---

## 🌟 What is xConfess?

xConfess is an anonymous confession platform where users can share their thoughts, react to confessions, and engage privately—all while maintaining complete anonymity. By integrating Stellar blockchain technology, we ensure confessions are verifiable, immutable, and censorship-resistant.

### ✨ Feature Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| 🔐 Anonymous Confession Posting | ✅ Implemented | Core module with full CRUD |
| 🎭 Anonymous User Identity | ✅ Implemented | Session-based anonymous users |
| 😂 Emoji Reactions | ✅ Implemented | Reaction module with WebSocket support |
| 💬 Commenting System | ✅ Implemented | Nested comments with parent-child |
| 🔍 Search (Hybrid + Full-text) | ✅ Implemented | Encrypted search support |
| 🛡️ AI Content Moderation | ✅ Implemented | OpenAI-based moderation pipeline |
| 📊 Admin Dashboard & RBAC | ✅ Implemented | Role-based access control |
| 📝 Report System | ✅ Implemented | Report + moderation workflow |
| 📨 Anonymous Messaging | ✅ Implemented | Author-reply model with constraints |
| ⛓️ Confession Anchoring (Stellar) | ✅ Implemented | Hash anchoring on Stellar testnet |
| 🏷️ Tag System | ✅ Implemented | Multi-tag confessions |
| 🔒 Encryption | ✅ Implemented | Field-level confession encryption |
| 📋 Audit Logging | ✅ Implemented | Comprehensive audit trail |
| 💰 XLM Tipping | ✅ Implemented | Stellar-based micro-tipping |
| 📈 Analytics | ✅ Implemented | View counts, trending |
| 📦 Data Export | ✅ Implemented | User data export |
| 🔄 Real-time Updates | ✅ Implemented | WebSocket gateway |
| 🎨 Frontend (Next.js) | ✅ Implemented | App router with modern UI |
| 🏆 NFT Badge System | 🗺️ Roadmap | Soroban contract placeholder exists |
| 📱 Mobile App | 🗺️ Roadmap | Not started |
| 🌍 Multi-language Support | 🗺️ Roadmap | Not started |
| 🏛️ Community Governance | 🗺️ Roadmap | Not started |

---

## 🛠️ Tech Stack

### Backend (xconfess-backend)
- **NestJS**: Robust, scalable Node.js framework
- **PostgreSQL**: Reliable relational database with JSONB support
- **TypeORM**: Database ORM with migrations
- **WebSockets**: Real-time communication (Socket.IO)
- **JWT + Passport**: Secure session management
- **Redis/In-memory Cache**: Response caching
- **Swagger/OpenAPI**: API documentation

### Frontend (xconfess-frontend)
- **Next.js 14**: React framework with App Router
- **TailwindCSS**: Utility-first styling
- **Stellar SDK**: Blockchain interactions

### Blockchain (xconfess-contracts)
- **Soroban**: Stellar smart contract platform
- **Rust**: Smart contract development language
- **Stellar SDK**: JavaScript/TypeScript integration

---

## 📁 Project Structure

```
xconfess/
├── README.md                    # This file
├── package.json                 # Root workspace config
├── PERFORMANCE_RESULTS.md       # Benchmark results
├── PERFORMANCE_BASELINE.md      # Performance baselines
├── PERFORMANCE_GUIDELINES.md    # Performance guidelines
│
├── xconfess-backend/            # NestJS backend
│   ├── src/
│   │   ├── main.ts              # App bootstrap
│   │   ├── app.module.ts        # Root module
│   │   ├── auth/                # Authentication (JWT, guards)
│   │   ├── user/                # User management
│   │   ├── confession/          # Confession CRUD + tags
│   │   ├── reaction/            # Emoji reactions
│   │   ├── comment/             # Comments
│   │   ├── messages/            # Anonymous messaging
│   │   ├── report/              # Report system
│   │   ├── admin/               # Admin panel + RBAC
│   │   ├── moderation/          # AI content moderation
│   │   ├── audit-log/           # Audit logging
│   │   ├── logger/              # Structured logging
│   │   ├── middleware/          # Express middleware
│   │   ├── stellar/             # Stellar blockchain integration
│   │   ├── tipping/             # XLM micro-tipping
│   │   ├── encryption/          # Field-level encryption
│   │   ├── cache/               # Cache service
│   │   ├── analytics/           # Analytics module
│   │   ├── data-export/         # Data export
│   │   ├── notifications/       # Notification system
│   │   ├── websocket/           # WebSocket gateway
│   │   └── config/              # Configuration
│   ├── test/                    # E2E tests
│   ├── e2e/                     # Additional E2E tests
│   └── migrations/              # Database migrations
│
├── xconfess-frontend/           # Next.js frontend
│   └── src/
│       ├── app/                 # App router pages
│       ├── components/          # React components
│       └── lib/                 # Utilities
│
├── xconfess-contracts/          # Soroban smart contracts
│   ├── Cargo.toml               # Workspace config
│   └── contracts/
│       ├── confession-anchor/   # ✅ Confession hash anchoring
│       ├── reputation-badges/   # 🗺️ NFT badges (placeholder)
│       └── anonymous-tipping/   # 🗺️ On-chain tipping (placeholder)
│
├── docs/                        # Additional documentation
├── scripts/                     # Build/deploy scripts
└── deployments/                 # Deployment configs
```

---

## ⚙️ Installation

### Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (v14+)
- **pnpm** or **npm**
- **Rust** (for Soroban contract development)
- **Stellar CLI** (optional, for contract deployment)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Godsmiracle001/xconfess.git
   cd xconfess
   ```

2. **Install backend dependencies**
   ```bash
   cd xconfess-backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../xconfess-frontend
   npm install
   ```

4. **Set up environment variables**

   Create a `.env` file in `xconfess-backend` (see `.env.example`):

   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/xconfess
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000

   # Stellar Configuration
   STELLAR_NETWORK=testnet
   STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
   CONFESSION_ANCHOR_CONTRACT=<contract-id>
   ```

5. **Set up the database**
   ```bash
   cd xconfess-backend
   npm run migration:run
   ```

6. **Start the backend**
   ```bash
   npm run start:dev
   ```

7. **Start the frontend** (in a new terminal)
   ```bash
   cd xconfess-frontend
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Docs: http://localhost:5000/api/api-docs

---

## 🔗 Stellar Smart Contracts

### Quick Start

```bash
# 1. Install Stellar CLI
cargo install --locked stellar-cli --features opt

# 2. Add WebAssembly target
rustup target add wasm32-unknown-unknown

# 3. Navigate to contracts
cd xconfess-contracts

# 4. Build contracts
cargo build --release --target wasm32-unknown-unknown

# 5. Run tests
cargo test
```

### Contract Architecture

The `xconfess-contracts/` workspace contains Soroban smart contracts:

| Contract | Status | Description |
|----------|--------|-------------|
| `confession-anchor` | ✅ Implemented | Stores 32-byte confession hashes on-chain with timestamps |
| `reputation-badges` | 🗺️ Placeholder | NFT badge system (contract scaffolded, logic pending) |
| `anonymous-tipping` | 🗺️ Placeholder | On-chain tipping (contract scaffolded, logic pending) |

### Contract Interaction Examples

**Anchor a Confession (JavaScript)**
```javascript
import * as StellarSDK from '@stellar/stellar-sdk';

const contract = new StellarSDK.Contract(CONFESSION_ANCHOR_CONTRACT_ID);

// Create confession hash
const confessionHash = hashConfession(confessionText);

// Anchor on Stellar
const tx = await contract.call(
  'anchor_confession',
  StellarSDK.nativeToScVal(confessionHash, { type: 'bytes' }),
  StellarSDK.nativeToScVal(Date.now(), { type: 'u64' })
);
```

**Verify a Confession (JavaScript)**
```javascript
const timestamp = await contract.call(
  'verify_confession',
  StellarSDK.nativeToScVal(confessionHash, { type: 'bytes' })
);
```

---

## ⚡ Performance

xConfess is optimized for speed and scalability. See our [Performance Results](PERFORMANCE_RESULTS.md) for detailed metrics.

### Key Metrics

| Metric | Value | Status |
|--------|-------|--------|
| API Response Time | < 100ms avg | ✅ |
| Page Load Time | < 2s | ✅ |
| Lighthouse Score | 94/100 | ✅ |
| Database Queries | < 100ms | ✅ |
| Cache Hit Rate | 82% | ✅ |

📊 **Full Report**: [PERFORMANCE_RESULTS.md](PERFORMANCE_RESULTS.md)

---

## 🤝 Contributing

We welcome contributions from the community! xConfess is participating in the **Stellar Wave Program** 🌊

### How to Contribute

1. **Find an Issue**
   - Browse [open issues](https://github.com/Godsmiracle001/Xconfess/issues)
   - Look for `good first issue`, `help wanted`, or `Stellar Wave` labels
   - Comment to get assigned

2. **Fork & Branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Make Your Changes**
   - Write clean, tested code
   - Follow existing code style
   - Update documentation if needed

4. **Commit & Push**
   ```bash
   git commit -m "feat: add stellar wallet connection"
   git push origin feat/your-feature-name
   ```

5. **Submit a Pull Request**
   - Include `Closes #<issue-number>` in description
   - Fill out the PR template
   - Wait for review

### 📋 Contribution Guidelines

✅ **Before Submitting:**
- Join our [Telegram community](https://t.me/xconfess_Community)
- Get assigned to the issue first
- Ensure all tests pass
- Update documentation

✅ **Code Quality:**
- Write unit tests for new features
- Follow TypeScript/Rust best practices
- Use meaningful variable names
- Comment complex logic

✅ **Commit Messages:**
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Keep messages clear and concise
- Reference issue numbers

---

## 🌊 Stellar Wave Program

xConfess is proud to participate in the **Stellar Development Foundation's Wave Program**!

### How to Participate

1. **Browse Wave Issues**: Look for issues tagged with `Stellar Wave`
2. **Apply to Work**: Comment on the issue to express interest
3. **Get Assigned**: Maintainers will review and assign you
4. **Submit Quality Work**: Create a PR that meets acceptance criteria
5. **Earn Rewards**: Get points and rewards from the Stellar Development Foundation

### Wave Resources

- [Stellar Wave Documentation](https://docs.drips.network/wave)
- [Drips Wave App](https://www.drips.network/wave)
- [Soroban Documentation](https://soroban.stellar.org/docs)

---

## 🗺️ Roadmap

### ✅ Phase 1: Core Platform (Complete)
- [x] Anonymous confession posting with encryption
- [x] Emoji reactions with WebSocket updates
- [x] Commenting system
- [x] Anonymous messaging (author-reply model)
- [x] AI content moderation
- [x] Admin dashboard with RBAC
- [x] Report system
- [x] Tag system
- [x] Search (hybrid + full-text)
- [x] Audit logging
- [x] Data export

### ✅ Phase 2: Stellar Integration (Complete)
- [x] Soroban confession-anchor contract
- [x] Backend anchoring + verification endpoints
- [x] XLM tipping module
- [x] Stellar service integration
- [ ] Freighter wallet frontend integration (in progress)

### 🚧 Phase 3: Advanced Features (Q2 2026)
- [ ] NFT badge system (Soroban contract)
- [ ] E2E encrypted messaging upgrade
- [ ] Advanced analytics dashboard
- [ ] Content recommendation engine
- [ ] Mobile app (React Native)

### 🔮 Phase 4: Mainnet & Scale (Q3 2026)
- [ ] Deploy to Stellar Mainnet
- [ ] Community governance
- [ ] Multi-language support
- [ ] Premium features

---

## 📊 Statistics

- 🚀 **Contributors**: 10+
- ⭐ **GitHub Stars**: Growing daily
- 🔧 **Open Issues**: [View Issues](https://github.com/Godsmiracle001/Xconfess/issues)
- 📦 **Pull Requests**: [View PRs](https://github.com/Godsmiracle001/Xconfess/pulls)

---

## 🤝 Community & Support

### Join the Conversation

- 💬 **Discord**: [xConfess Community](https://discord.gg/5qVnXvzd)
- 💬 **Telegram**: [xConfess Community](https://t.me/xconfess_Community)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Godsmiracle001/Xconfess/issues)

### Get Help

- Check existing [issues](https://github.com/Godsmiracle001/Xconfess/issues) and [discussions](https://github.com/Godsmiracle001/Xconfess/discussions)
- Join our Telegram for real-time support

---

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Stellar Development Foundation** for supporting this project through the Wave Program
- All our amazing **contributors** and **community members**
- The **Soroban** team for excellent smart contract tooling

---

## 🌟 Star History

If you find xConfess valuable, please give us a ⭐ on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=Godsmiracle001/Xconfess&type=Date)](https://star-history.com/#Godsmiracle001/Xconfess&Date)

---

<div align="center">

**Built with ❤️ for the Stellar ecosystem**

[Community](https://t.me/xconfess_Community) • [Contribute](https://github.com/Godsmiracle001/Xconfess/issues)

</div>
