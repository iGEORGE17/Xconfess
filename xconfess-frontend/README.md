# xConfess Frontend

A modern, high-performance web application for **xConfess**, an anonymous confession platform.

## 🚀 Overview

The frontend is built with **Next.js 16** and **React 19**, providing a fast, responsive, and intuitive interface for anonymous sharing. it leverages TailwindCSS 4 for a design-first approach and connects seamlessly with the Stellar blockchain.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: React 19
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/)
- **State Management**: Zustand & React Query
- **Icons**: Lucide React
- **Blockchain**: Stellar SDK & Freighter Wallet
- **Real-time**: Socket.io Client

## ⚙️ Development Setup

### Prerequisites

- Node.js (v18+)
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

### Run Project

```bash
# development
pnpm dev

# build for production
pnpm build

# start production
pnpm start
```

## 📁 Key Features

- **Anonymous Posting**: Share thoughts without identity.
- **Real-time Reactions**: Watch emoji reactions happen live.
- **Stellar Anchoring**: Cryptographically prove confessions on the Stellar blockchain.
- **Micro-Tipping**: Send XLM tips using Freighter wallet.
- **Responsive Design**: Optimized for both mobile and desktop experiences.

## 🧪 Testing

```bash
# run tests
pnpm test
```

## 📄 License

This project is licensed under the same license as the main xConfess project. See [LICENSE](../LICENSE) for details.
