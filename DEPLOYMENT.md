# SynapseModel - Complete Deployment Guide (Testnet)

## 🎯 Deployment Summary

Your SynapseModel platform has been successfully set up! Here's what's deployed:

### ✅ Infrastructure
- **MongoDB**: Running on `localhost:27017`
- **Redis**: Running on `localhost:6379`

### ✅ Smart Contracts (Sui Testnet)
- **Package ID**: `0x870b6a8a841e69a56795877ae9461ba715a4100f6e1a218ff9734c7bf8732e9f`
- **Job Registry ID**: `0xba83e185b6e2c164294aeeb12ea74cdb5d7387192f96fb8ba13d07ad152a0411`
- **Network**: Sui Testnet
- **Transaction**: [View on Explorer](https://suiscan.xyz/testnet/tx/A5FNT8y4sGQGrMcWkRoRJSnzRuq5JD16onzBqqHFiD44)

---

## 🚀 Quick Start (Manual Steps)

### 1. Start TEE Server

```bash
cd tee-server

# Build (first time only - may take 5-10 minutes)
cargo build --release

# Run
cargo run --release
# Or: ./target/release/synapsemodel-tee-server
```

**Expected Output:**
```
Starting SynapseModel TEE Server
Generated ephemeral keypair
Public key: a1b2c3d4e5f6...
Server listening on 0.0.0.0:3000
```

**Test:**
```bash
curl http://localhost:3000/health_check
curl http://localhost:3000/get_pk
```

---

### 2. Start Backend API

```bash
cd backend

# Install dependencies (first time only)
pnpm install

# Start server
pnpm run dev
```

**Expected Output:**
```
Server running on port 4000
MongoDB connected successfully
Redis connected successfully
```

**Test:**
```bash
curl http://localhost:4000/api/v1/health
```

---

### 3. Start Frontend

```bash
cd frontend

# Install dependencies (first time only)
pnpm install

# Start on port 3001 (to avoid conflict with TEE server)
PORT=3001 pnpm run dev
```

**Expected Output:**
```
Next.js ready on http://localhost:3001
```

**Open in browser:** `http://localhost:3001`

---

## 📝 Step 4: Register Enclave (One-time Setup)

After TEE server is running, you need to register its public key on-chain:

### 4.1 Get TEE Public Key

```bash
curl http://localhost:3000/get_pk
```

Save the `public_key` value (e.g., `a1b2c3d4...`).

### 4.2 Create Enclave Config

```bash
# Set environment variables
export PACKAGE_ID=0x870b6a8a841e69a56795877ae9461ba715a4100f6e1a218ff9734c7bf8732e9f
export ADMIN_CAP=<YOUR_ADMIN_CAP_ID>  # From deployment output

# Create enclave configuration
sui client call \
  --package $PACKAGE_ID \
  --module enclave_registry \
  --function create_enclave_config \
  --args $ADMIN_CAP \
    "SynapseModel TEE v1" \
    "0x0000000000000000000000000000000000000000000000000000000000000000" \
    "0x0000000000000000000000000000000000000000000000000000000000000000" \
    "0x0000000000000000000000000000000000000000000000000000000000000000" \
  --gas-budget 100000000
```

### 4.3 Register Enclave

```bash
export ENCLAVE_CONFIG_ID=<CONFIG_ID_FROM_ABOVE>
export TEE_PUBLIC_KEY=<PUBLIC_KEY_FROM_STEP_4.1>

sui client call \
  --package $PACKAGE_ID \
  --module enclave_registry \
  --function register_enclave \
  --args $ENCLAVE_CONFIG_ID \
    "0x$TEE_PUBLIC_KEY" \
  --gas-budget 100000000
```

### 4.4 Update Backend .env

Add the enclave IDs to `backend/.env`:

```bash
SUI_ENCLAVE_CONFIG_ID=<CONFIG_ID>
SUI_ENCLAVE_ID=<ENCLAVE_ID>
```

Restart the backend server.

---

## 🎨 Using the Platform

### Submit a Job via Frontend

1. **Open Frontend**: `http://localhost:3001`
2. **Connect Wallet**: Click "Connect Wallet" and select Sui Wallet
3. **Submit Job**:
   - Select model: "MNIST Classifier"
   - Upload image or use test data
   - Click "Submit Job"
4. **View Results**: Navigate to "My Jobs" to see processing status

### Submit a Job via API

```bash
curl -X POST http://localhost:4000/api/v1/jobs \
  -H 'Content-Type: application/json' \
  -d '{
    "wallet_address": "0xYOUR_WALLET_ADDRESS",
    "model_id": "mnist-classifier",
    "input_data": {
      "pixels": [0.5, 0.5, ..., 0.5]
    }
  }'
```

---

## 🔍 Verification Flow

```
User → Frontend → Backend → TEE Server → Sui Blockchain
  ↓         ↓         ↓          ↓             ↓
Submit   Wallet   Create     Compute      Verify
  Job    Sign      Job      +Sign        Certificate
                           Result         (NFT)
```

1. **User submits job** via frontend
2. **Backend creates job** in MongoDB
3. **Backend sends to TEE** for processing
4. **TEE computes result** and signs with ephemeral key
5. **Backend submits to Sui** for verification
6. **Smart contract verifies** signature and mints certificate NFT
7. **User receives** verifiable certificate

---

## 🛠️ Troubleshooting

### TEE Server Build Issues

**Error**: `fastcrypto dependency failed`
```bash
# Update Cargo.toml with working revision
cargo update
cargo build --release
```

### MongoDB Connection Failed

```bash
# Check if container is running
docker ps | grep mongodb

# Restart if needed
docker restart synapsemodel-mongodb
```

### Backend API Errors

```bash
# Check logs
tail -f backend/logs/app.log

# Verify environment variables
cat backend/.env
```

### Frontend Wallet Connection Issues

**Issue**: "Wallet not detected"
- Install [Sui Wallet Extension](https://chrome.google.com/webstore/detail/sui-wallet)
- Ensure you're on Testnet in wallet settings

---

## 📊 Service Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| TEE Server | `http://localhost:3000` | Secure ML inference |
| Backend API | `http://localhost:4000` | Job orchestration |
| Frontend | `http://localhost:3001` | User interface |
| MongoDB | `localhost:27017` | Job database |
| Redis | `localhost:6379` | Job queue |

---

## 🔐 Security Notes

### Development Mode
- TEE server runs **without actual enclave** (uses placeholder attestation)
- Ephemeral keys are **generated on startup**
- PCR values are **placeholder zeros**

### Production Mode
1. Build Nitro enclave: `make enclave`
2. Extract real PCR values: `make pcrs`
3. Update smart contract with real PCRs
4. Deploy to EC2 with Nitro support

---

## 🎓 Next Steps

1. **Test End-to-End Flow**:
   - Submit a job via frontend
   - Watch it process through the system
   - Verify certificate on Sui Explorer

2. **Add Real ML Models**:
   - Convert models to ONNX format
   - Place in `tee-server/models/`
   - Update model registry

3. **Production Deployment**:
   - Set up AWS Nitro Enclave
   - Deploy backend to cloud
   - Configure domain and SSL

4. **Monitoring**:
   - Set up Grafana dashboards
   - Configure log aggregation
   - Enable alerting

---

## 📞 Support

**Smart Contracts**: `contracts/`
**Backend**: `backend/`
**Frontend**: `frontend/`
**TEE Server**: `tee-server/`

**Network**: Sui Testnet
**Package**: `0x870b6a8a841e69a56795877ae9461ba715a4100f6e1a218ff9734c7bf8732e9f`

---

**Deployed on**: November 22, 2025
**Built by**: @AbhimanyuAjudiya
