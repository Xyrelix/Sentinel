# 🛡️ Sentinel

> **Your AI Shield Against Crypto Scams**
>
> Real-time transaction security and scam detection agent built for **X Layer** + **OKX Wallet**.

---

## 📖 Overview

**Sentinel** is an intelligent **Agent Service Provider (ASP)** developed for the **OKX.AI Genesis Hackathon**.

The platform acts as a personal on-chain security assistant, analyzing every transaction before it is signed. By inspecting smart contracts, wallet interactions, token risks, approvals, and known scam patterns, ScamGuard AI helps users avoid phishing attacks, rug pulls, malicious contracts, and wallet-draining exploits.

Instead of expecting users to understand complex blockchain data, Sentinel explains risks in simple language and recommends the safest action.

## ✨ Features

- 🔍 **Pre-Signature Transaction Scanner**
- 📊 **AI Risk Score**
- 👛 **Wallet Health Monitor**
- 🤖 **Autonomous Protection**
- 🌐 **Community Intelligence**
- 📄 **Educational Security Reports**
- ⚡ **One-Click Approval Revoke**

## ⚙️ How It Works

1. Connect your **OKX Wallet**.
2. Initiate a transaction.
3. Sentinel analyzes contracts, wallets, tokens, permissions, liquidity, and known scam patterns.
4. Receive an instant risk score and recommendation.
5. Proceed safely or cancel.

## 🏗️ Tech Stack

| Category        | Technology             |
| --------------- | ---------------------- |
| Blockchain      | X Layer (EVM)          |
| Wallet          | OKX Wallet SDK         |
| AI Agent        | LangGraph / CrewAI     |
| AI Models       | OpenAI / Grok / Claude |
| Frontend        | Next.js + Tailwind CSS |
| Smart Contracts | Solidity               |
| Database        | PostgreSQL / Supabase  |
| Hosting         | Vercel + IPFS          |

## 🚀 Getting Started

```bash
git clone https://github.com/yourusername/sentinel.git
cd sentinel
npm install
```

Create environment files for the frontend and backend:

```env
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# backend/.env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OKX_WALLET_API_KEY=
OKX_WALLET_SECRET=
X_LAYER_RPC_URL=
```

Run the app from the workspace root:

```bash
npm run dev
```

Open http://localhost:3000

## 📂 Project Structure

```text
sentinel/
├── frontend/                     # Next.js app, routes, UI components
│   ├── app/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── .env.local
├── backend/                      # API handlers, agents, and service wrappers
│   ├── api/
│   ├── agents/
│   └── lib/
├── contracts/                    # Solidity smart contracts
├── shared/                       # Shared types used by frontend + backend
├── .env.example
├── .gitignore
└── README.md
```

## 🎯 Use Cases

- Prevent phishing attacks
- Detect rug pulls
- Identify malicious contracts
- Review token approvals
- Monitor wallet security

## 🔮 Roadmap

- Browser Extension
- Telegram Bot
- Cross-chain protection
- Portfolio monitoring
- NFT scam detection

## 🤝 Contributing

Commit → Pull Request.

## 📜 License

MIT License.

## ❤️ Built For

**OKX.AI Genesis Hackathon**
