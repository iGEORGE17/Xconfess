# xConfess

xConfess is a privacy-first anonymous confession platform where users can share their thoughts, react to confessions, and engage in private messaging. Built with NestJS (backend), Next.js (frontend), and integrating smart contracts on Starknet (using Cairo), xConfess emphasizes high security, real-time interactions, and an intuitive, anonymous experience.

📣 Join the Community  
→ Telegram: https://t.me/xconfess_Community

---

## 🌐 Ecosystem

- Backend: NestJS + PostgreSQL  
- Frontend: Next.js + TailwindCSS  
- Smart Contracts: Starknet (Cairo v2)  
- Deployment Targets: PostgreSQL, Vercel (Next.js), Starknet Testnet

---

## 📁 Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Smart Contract Setup](#smart-contract-setup)
- [Contributing](#contributing)
- [License](#license)

---

## ⚙️ Installation

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- Nest CLI: npm install -g @nestjs/cli
- Scarb (for Starknet contracts)
- Cairo v2 toolchain

### Clone & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Godsmiracle001/xconfess.git
   cd xconfess
   ```

2. Install backend dependencies:
   ```bash
   cd xconfess-backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../xconfess-frontend
   npm install
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` and configure:
     ```env
     DATABASE_URL=postgresql://username:password@localhost:5432/xconfess
     JWT_SECRET=your-secret-key
     ```

5. Start backend:
   ```bash
   cd ../xconfess-backend
   npm run start:dev
   ```

6. Start frontend:
   ```bash
   cd ../xconfess-frontend
   npm run dev
   ```

App will be accessible at: http://localhost:3000  
API runs on: http://localhost:5000

---

## 🧲 Usage

When running locally, users can:

- Submit anonymous confessions
- React with emojis (Funny, Sad, Love, etc.)
- Send anonymous or direct messages (WIP)
- View confessions with aggregate reaction stats

Confession hashes may also be anchored to Starknet for optional verifiability (see Smart Contract section).

---

## 💻 Smart Contract Setup (Starknet)

Smart contracts are written in Cairo v2 and located in:

```bash
contracts/cairo-xconfess/
```

Each contract focuses on anonymous feature tracking:

- ConfessionAnchor.cairo – anchor confession hashes on Starknet
- ReactionTracker.cairo – store emoji counts per confession hash
- zkBadge.cairo – badge system (e.g. "Confession Starter", "Most Reacted")

To build and test contracts:

1. Install Scarb & Cairo v2
2. Run:
   ```bash
   cd contracts/cairo-xconfess
   scarb build
   ```
3. Run tests:
   ```bash
   pytest
   ```

Contracts will soon be deployed to Starknet Sepolia testnet. Addresses will be published in /deployments/testnet.json.

---

## 🤝 Contributing

We welcome contributions via GitHub and OnlyDust!

1. Fork this repo
2. Create a branch:
   ```bash
   git checkout -b feat/my-feature
   ```
3. Make your changes
4. Commit:
   ```bash
   git commit -m "feat: add new confession badge system"
   ```
5. Push & submit a Pull Request

Before submitting:

✅ Be assigned to the issue on OnlyDust  
✅ Join our Telegram for coordination  
✅ Include Close #[issue_id] in your PR description

Explore our open tasks in the Issues tab →  
🔗 https://github.com/Godsmiracle001/Xconfess/issues

---

## 📜 License

This project is licensed under the MIT License. See LICENSE for details.
