# 🚀 SynapseModel - Complete Startup Guide

## ✅ What's Already Done

1. ✅ **MongoDB & Redis** - Running in Docker
2. ✅ **Smart Contracts** - Deployed to Sui Testnet
3. ✅ **Configuration** - Backend .env updated with contract addresses

---

## 🎯 How to Run Everything (3 Simple Steps)

You need **3 separate terminal windows**. No AWS needed for development!

### 📟 Terminal 1: Start TEE Server

```bash
cd /Users/abhimanyu/Documents/Programming/SynapseModel-sui/tee-server
./start.sh
```

**First time**: Will compile Rust code (~5-10 minutes)  
**Next times**: Starts immediately

**Expected output:**
```
Starting SynapseModel TEE Server
Generated ephemeral keypair
Public key: abc123def456...
Server listening on 0.0.0.0:3000
```

**✓ Ready when you see**: `Server listening on 0.0.0.0:3000`

---

### 📟 Terminal 2: Start Backend

```bash
cd /Users/abhimanyu/Documents/Programming/SynapseModel-sui/backend
./start.sh
```

**First time**: Will install npm packages (~2-3 minutes)  
**Next times**: Starts immediately

**Expected output:**
```
Server running on port 4000
MongoDB connected successfully
Redis connected successfully
```

**✓ Ready when you see**: `Server running on port 4000`

---

### 📟 Terminal 3: Start Frontend

```bash
cd /Users/abhimanyu/Documents/Programming/SynapseModel-sui/frontend
./start.sh
```

**First time**: Will install npm packages (~2-3 minutes)  
**Next times**: Starts immediately

**Expected output:**
```
Next.js 14.1.0
- Local: http://localhost:3001
✓ Ready in 1.5s
```

**✓ Ready when you see**: `Ready in X.Xs`

---

## 🧪 Test Everything Works

After all 3 services are running, test each one:

### Test 1: TEE Server
```bash
curl http://localhost:3000/health_check
```
**Expected**: `{"status":"healthy","timestamp":...}`

### Test 2: Backend API
```bash
curl http://localhost:4000/api/v1/health
```
**Expected**: `{"status":"ok","timestamp":...}`

### Test 3: Frontend
Open in browser: **http://localhost:3001**

**Expected**: SynapseModel homepage with "Connect Wallet" button

---

## 🎨 Using the Application

### Step 1: Connect Wallet
1. Install [Sui Wallet Extension](https://chrome.google.com/webstore/detail/sui-wallet)
2. Switch wallet to **Testnet** (Settings → Network → Testnet)
3. Click "Connect Wallet" on the website
4. Get testnet SUI from [faucet](https://discord.com/channels/916379725201563759/971488439931392130)

### Step 2: Submit a Job
1. Click "Submit New Job"
2. Select model: "MNIST Classifier"
3. Enter test input (or upload image)
4. Click "Submit Job"
5. Sign transaction in wallet

### Step 3: View Results
1. Go to "My Jobs"
2. See processing status
3. View inference result
4. Check verification certificate (NFT)

---

## 🛑 How to Stop Everything

Press `Ctrl+C` in each terminal window, or:

```bash
# Kill all services
pkill -f synapsemodel-tee-server
pkill -f "node.*backend"
pkill -f "next dev"
```

---

## 🔍 Service URLs Reference

| Service | URL | Purpose |
|---------|-----|---------|
| **TEE Server** | http://localhost:3000 | Secure ML inference |
| **Backend API** | http://localhost:4000 | Job orchestration |
| **Frontend** | http://localhost:3001 | User interface |
| **MongoDB** | localhost:27017 | Job database |
| **Redis** | localhost:6379 | Job queue |

---

## 📦 Smart Contract Info (Testnet)

```bash
Package ID:      0x870b6a8a841e69a56795877ae9461ba715a4100f6e1a218ff9734c7bf8732e9f
Job Registry ID: 0xba83e185b6e2c164294aeeb12ea74cdb5d7387192f96fb8ba13d07ad152a0411
Network:         Sui Testnet
Explorer:        https://suiscan.xyz/testnet
```

---

## ⚠️ Common Issues & Fixes

### Issue: TEE Server won't compile

**Error**: `fastcrypto dependency failed`

**Fix**:
```bash
cd tee-server
cargo clean
cargo update
./start.sh
```

---

### Issue: Backend can't connect to MongoDB

**Check if running**:
```bash
docker ps | grep mongodb
```

**Restart if needed**:
```bash
docker restart synapsemodel-mongodb
```

---

### Issue: Frontend port 3001 in use

**Find process**:
```bash
lsof -ti:3001
```

**Kill it**:
```bash
kill -9 $(lsof -ti:3001)
```

---

### Issue: Wallet not connecting

1. Make sure Sui Wallet extension is installed
2. Switch to **Testnet** in wallet settings
3. Refresh the page
4. Try "Connect Wallet" again

---

## 🔐 Development Mode (Current Setup)

Currently running in **development mode**:

- ✅ TEE server runs locally (no AWS Nitro needed)
- ✅ Uses placeholder attestation
- ✅ Ephemeral keys generated on startup
- ✅ Full functionality for testing

**For Production**: You'll need AWS Nitro Enclaves (see DEPLOYMENT.md)

---

## 🎓 Next Steps

1. **Test the full flow**:
   - Submit job → Process → Verify certificate

2. **Check the blockchain**:
   - View transactions on [Sui Explorer](https://suiscan.xyz/testnet)
   - See your certificate NFTs

3. **Customize**:
   - Add your own ML models
   - Modify the UI
   - Configure custom workflows

---

## 📞 Quick Commands Cheat Sheet

```bash
# Start everything (3 terminals needed)
Terminal 1: cd tee-server && ./start.sh
Terminal 2: cd backend && ./start.sh
Terminal 3: cd frontend && ./start.sh

# Test everything
curl http://localhost:3000/health_check
curl http://localhost:4000/api/v1/health
open http://localhost:3001

# Stop everything
Ctrl+C in each terminal

# View logs
tail -f backend/logs/app.log
tail -f tee-server/logs/*.log

# Restart Docker services
docker restart synapsemodel-mongodb synapsemodel-redis

# Check Docker status
docker ps | grep synapsemodel
```

---

## 🎉 You're Ready!

Your complete verifiable AI platform is ready to use:

1. Open **3 terminal windows**
2. Run `./start.sh` in each directory (tee-server, backend, frontend)
3. Open **http://localhost:3001** in your browser
4. Connect your Sui wallet
5. Submit your first job!

**No AWS, no cloud deployment needed for development!** 🚀

---

**Need Help?**
- Check DEPLOYMENT.md for advanced setup
- View logs in each terminal window
- Test API endpoints with curl commands above

**Built with ❤️ by @AbhimanyuAjudiya**  
**Deployed**: November 22, 2025
