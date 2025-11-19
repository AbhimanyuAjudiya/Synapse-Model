# 🎯 SynapseModel - Quick Start (3 Commands)

**Verifiable AI Inference Platform on Sui Blockchain**

---

## ⚡ Start Everything NOW

### Option 1: Quick Check (Run This First)

```bash
./check.sh
```

This shows what's running and what needs to be started.

---

### Option 2: Start All Services (3 Terminals)

Open **3 terminal windows** and run:

#### Terminal 1 - TEE Server
```bash
cd tee-server && ./start.sh
```

#### Terminal 2 - Backend
```bash
cd backend && ./start.sh
```

#### Terminal 3 - Frontend
```bash
cd frontend && ./start.sh
```

**That's it!** Open http://localhost:3001 in your browser.

---

## ✅ What You Have

- ✅ **MongoDB & Redis** - Running in Docker
- ✅ **Smart Contracts** - Deployed to Sui Testnet
- ✅ **3 Startup Scripts** - One command to start each service
- ✅ **No AWS Needed** - Everything runs locally for development

---

## 📖 Documentation

| File | Purpose |
|------|---------|
| **START.md** | Complete step-by-step guide |
| **DEPLOYMENT.md** | Advanced deployment & configuration |
| **check.sh** | System status checker |
| **tee-server/start.sh** | Start TEE server |
| **backend/start.sh** | Start backend API |
| **frontend/start.sh** | Start frontend |

---

## 🏗️ Architecture

```
User Browser (localhost:3001)
      ↓
Frontend (Next.js + Sui Wallet)
      ↓
Backend API (localhost:4000)
      ↓
TEE Server (localhost:3000)
      ↓
Sui Testnet (Smart Contracts)
```

**Storage**: MongoDB + Redis (Docker containers)

---

## 🧪 Test Commands

```bash
# Check system status
./check.sh

# Test each service
curl http://localhost:3000/health_check  # TEE
curl http://localhost:4000/api/v1/health # Backend
open http://localhost:3001               # Frontend

# View Docker services
docker ps | grep synapsemodel
```

---

## 🚀 Smart Contracts (Deployed)

```
Network:     Sui Testnet
Package:     0x870b6a8a841e69a56795877ae9461ba715a4100f6e1a218ff9734c7bf8732e9f
Job Registry: 0xba83e185b6e2c164294aeeb12ea74cdb5d7387192f96fb8ba13d07ad152a0411
```

[View on Explorer](https://suiscan.xyz/testnet/object/0x870b6a8a841e69a56795877ae9461ba715a4100f6e1a218ff9734c7bf8732e9f)

---

## 🎮 Usage

1. **Start all 3 services** (see above)
2. **Open** http://localhost:3001
3. **Install** [Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet)
4. **Switch** wallet to Testnet
5. **Connect** wallet on website
6. **Submit** your first ML inference job!

---

## 🛑 Stop Everything

Press `Ctrl+C` in each terminal, or:

```bash
pkill -f synapsemodel-tee-server
pkill -f "node.*backend"  
pkill -f "next dev"
```

---

## 💡 Tips

- **First start is slow** (compiling Rust, installing npm packages)
- **Next starts are instant** (everything is cached)
- **Check logs** in each terminal window for errors
- **Need testnet SUI?** Use the [Discord faucet](https://discord.com/channels/916379725201563759/971488439931392130)

---

## 📁 Project Structure

```
SynapseModel-sui/
├── contracts/        # Sui Move smart contracts
├── backend/          # Node.js API server
├── frontend/         # Next.js web app
├── tee-server/       # Rust TEE inference server
├── check.sh          # System status checker
├── START.md          # Detailed instructions
└── DEPLOYMENT.md     # Advanced deployment guide
```

---

**Ready to build verifiable AI on Sui!** 🎉

For detailed help, see **START.md**
