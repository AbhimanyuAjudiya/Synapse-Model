<div align="center">

# 🧠 Synapse Model

### Decentralized AI Model Marketplace on Sui Blockchain

**Upload, Share, and Execute AI Models with Web3 Infrastructure**

[![Sui](https://img.shields.io/badge/Sui-Blockchain-4da2ff?style=for-the-badge&logo=sui)](https://sui.io)
[![Walrus](https://img.shields.io/badge/Walrus-Storage-00d4aa?style=for-the-badge)](https://walrus.site)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)

[Live Demo](#) • [Documentation](#-documentation) • [Video Demo](https://youtu.be/YVkswhpFN3Q?si=bZxv3DPLqBuc4M-p) • [Testnet Explorer](https://suiscan.xyz/testnet/object/0x0ad1816684996d1e44fce381f0b0f5f9d09223c70c29a0111e8f77cf5cf59bb2)

</div>

---

## 🎯 Problem Statement

Current AI model marketplaces face critical challenges:
- **Centralized Control**: Models hosted on centralized servers prone to censorship
- **High Costs**: Expensive cloud storage and inference fees
- **No Ownership**: Users don't truly own their uploaded models
- **Limited Access**: Geographic restrictions and platform lock-in
- **Trust Issues**: No transparent verification of model authenticity

---

## 💡 Our Solution

**Synapse Model** is a decentralized AI marketplace that combines:

- 🔗 **Sui Blockchain** - Immutable on-chain model registry with transparent ownership
- 📦 **Walrus Storage** - Decentralized, cost-effective storage for large AI models
- ⚡ **AWS EC2** - On-demand inference instances with auto-scaling
- 🎨 **Web3 UX** - Seamless wallet integration and modern interface

### How It Works

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Upload    │─────▶│    Walrus    │      │     Sui     │
│  AI Model   │      │   Storage    │      │  Blockchain │
└─────────────┘      └──────┬───────┘      └──────┬──────┘
                            │                     │
                            │ Blob ID             │ Register
                            │                     │ Metadata
                            ▼                     ▼
                     ┌──────────────────────────────┐
                     │   Model Registry Contract    │
                     │  • Owner Address             │
                     │  • Blob ID & Object ID       │
                     │  • Name & Description        │
                     │  • Upload Timestamp          │
                     └──────────────────────────────┘
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │   Playground (Try It Out)    │
                     │  1. Create EC2 Instance      │
                     │  2. Fetch Model from Walrus  │
                     │  3. Run Inference API        │
                     │  4. Auto-Delete After 30min  │
                     └──────────────────────────────┘
```

---

## ✨ Key Features

### 🚀 For Model Creators
- **One-Click Upload**: Upload models directly to Walrus storage
- **On-Chain Ownership**: Immutable proof of model authorship on Sui
- **Zero Lock-In**: Your models, your control, forever accessible
- **Global CDN**: Walrus provides fast access worldwide

### 🎮 For Model Users
- **Instant Discovery**: Browse all models from blockchain registry
- **Try Before Buy**: Interactive playground with 30-minute free instances
- **Real-Time Inference**: Execute models via REST API
- **Transparent Pricing**: See costs upfront (currently free tier)

### 🔐 Technical Excellence
- **BCS Parsing**: Efficient browser-compatible blockchain data decoding
- **Auto-Cleanup**: Instances automatically terminate after 30 minutes
- **SSM Integration**: Secure remote execution without SSH keys
- **Type-Safe**: Full TypeScript coverage with Zod validation

---

## 🏗️ Architecture

### Tech Stack

**Frontend** (React + TypeScript)
```
- React 19 with TypeScript
- Sui dApp Kit (@mysten/dapp-kit)
- Walrus Storage SDK
- Tailwind CSS + Radix UI
- Vite build system
```

**Backend** (Python FastAPI)
```
- FastAPI async framework
- AWS Boto3 (EC2, SSM)
- Synchronous instance provisioning
- JSON-based persistence
```

**Blockchain** (Sui Move)
```
- Model Registry Contract
- Upload/Get/Exists functions
- Event emissions
- Table-based storage
```

### System Flow

```
User Uploads Model
       ↓
Frontend → Walrus Publisher (PUT /v1/blobs)
       ↓
Get Blob ID & Object ID
       ↓
Frontend → Sui Wallet → Smart Contract
       ↓
Transaction: upload_model(blob_id, name, description)
       ↓
Model appears in marketplace
       ↓
User clicks "Try It Out"
       ↓
Backend creates EC2 instance
       ↓
EC2 fetches model from Walrus via SSM
       ↓
Model API ready at http://<IP>:8000/predict
       ↓
30-minute countdown starts
       ↓
Auto-delete instance when timer expires
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Sui Wallet browser extension
- AWS Account (for backend)
- pnpm or npm

### 1. Clone Repository

```bash
git clone https://github.com/AbhimanyuAjudiya/Synapse-Model.git
cd Synapse-Model
```

### 2. Deploy Smart Contract

```bash
cd contracts
sui client publish --gas-budget 100000000
```

Copy the **Package ID** and **Registry Object ID** from the output.

### 3. Setup Frontend

```bash
cd frontend
pnpm install

# Create .env file
echo "VITE_BACKEND_API_URL=http://localhost:8000" > .env

# Update lib/sui.ts with your contract addresses
# modelRegistryPackageId: "0xYOUR_PACKAGE_ID"
# modelRegistryObjectId: "0xYOUR_REGISTRY_ID"

pnpm dev
```

Frontend runs at `http://localhost:3000`

### 4. Setup Backend

```bash
cd backend
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_LAUNCH_TEMPLATE_ID=lt-xxxxx
EOF

python main.py
```

Backend runs at `http://localhost:8000`

### 5. Configure AWS Launch Template

Your Launch Template must include:
- AMI with SSM agent (Amazon Linux 2 or Ubuntu)
- IAM role with `AmazonSSMManagedInstanceCore` policy
- Security group allowing port 8000 (for model API)
- Python 3.12+ pre-installed

---

## 📖 Documentation

### API Endpoints

#### Backend REST API

**POST `/api/instances`**
```json
{
  "blob_id": "walrus-object-id"
}
```
Creates EC2 instance, fetches model, returns public IP (5-10 min wait)

**DELETE `/api/instances/{instance_id}`**

Terminates instance and cleanup

**GET `/api/instances`**

List all managed instances

**GET `/api/instances/{instance_id}`**

Get instance details with live AWS status

#### Smart Contract Functions

**`upload_model(registry, blob_id, object_id, name, description, clock)`**

Registers model on-chain

**`get_metadata(registry, blob_id) -> Model`**

Returns model metadata struct

**`exists(registry, blob_id) -> bool`**

Check if model is registered

**`get_all_blob_ids(registry) -> vector<String>`**

List all registered models

---

## 🎨 Screenshots

### Upload Flow
```
1. Connect Sui Wallet
2. Select model file (up to 10MB)
3. Automatic upload to Walrus
4. Sign transaction to register on-chain
5. Model appears in marketplace instantly
```

### Playground Experience
```
1. Browse models from blockchain
2. Click "Try It Out" on any model
3. Create Instance button (waits 5-10 min)
4. Instance Ready with countdown timer (30:00)
5. Enter input, click Run
6. See real-time results from model API
7. Manual delete or auto-delete on timeout
```

---

## 🔬 Technical Deep Dive

### BCS Parsing in Browser

We implemented custom BCS deserialization for the Sui Move `Model` struct:

```typescript
// Parse Model struct from blockchain
const structBytes = new Uint8Array(returnValues[0][0])
let offset = 0

// 32 bytes: address
const uploader = parseAddress(structBytes.slice(offset, offset + 32))
offset += 32

// 8 bytes: u64 timestamp (little endian)
const timestamp = parseLittleEndianU64(structBytes.slice(offset, offset + 8))
offset += 8

// Length-prefixed strings
const name = readString(structBytes, offset)
const description = readString(structBytes, offset)
const blobId = readString(structBytes, offset)
const objectId = readString(structBytes, offset)
```

### Instance Lifecycle Management

```python
# Synchronous instance creation (5-10 minutes)
1. Launch EC2 from template
2. Wait for "running" state (up to 300s)
3. Poll SSM agent until ready (up to 300s)
4. Execute fetch command via SSM:
   - Download blob from Walrus aggregator
   - Extract zip file
   - Run setup script in background
5. Return public IP to frontend

# Auto-cleanup on frontend
useEffect(() => {
  if (instanceCreatedAt) {
    const interval = setInterval(() => {
      if (timeRemaining <= 0) {
        handleDeleteInstance()
      }
    }, 1000)
  }
}, [instanceCreatedAt])
```

### Walrus Upload Flow

```javascript
// Upload to Walrus testnet publisher
const response = await fetch(
  `${WALRUS_PUBLISHER}/v1/blobs?epochs=3&deletable=true`,
  {
    method: "PUT",
    body: modelFile,
  }
)

// Extract blob details
if (result.newlyCreated) {
  blobId = result.newlyCreated.blobObject.blobId
  objectId = result.newlyCreated.blobObject.id
  cost = result.newlyCreated.cost
}

// Register on Sui blockchain
await registerModelOnChain({
  blobId,
  objectId,
  name,
  description
})
```

---

## 🎯 Use Cases

### 1. Open Source AI Distribution
Share your trained models with the community without platform fees

### 2. Model Monetization
List proprietary models with pricing (future feature)

### 3. Research Collaboration
Transparent model provenance for academic reproducibility

### 4. Edge AI Deployment
Deploy models to EC2 regions close to your users

### 5. Model Versioning
Upload multiple versions with immutable history

---

## 🛠️ Project Structure

```
Synapse-Model/
├── frontend/                 # React TypeScript application
│   ├── components/          # UI components
│   │   ├── UploadForm.tsx   # Model upload interface
│   │   ├── Navbar.tsx       # Navigation with wallet
│   │   └── ui/              # Radix UI primitives
│   ├── hooks/               # Custom React hooks
│   │   ├── useSuiWallet.ts  # Wallet connection
│   │   └── useBlockchainModels.ts
│   ├── lib/                 # Utilities
│   │   ├── suiClient.ts     # Blockchain interaction
│   │   └── sui.ts           # Network config
│   ├── pages/               # Route components
│   │   └── Playground.tsx   # Model testing interface
│   └── types/               # TypeScript definitions
│
├── backend/                  # Python FastAPI server
│   ├── main.py              # API endpoints
│   ├── instances_data.json  # Persistent storage
│   └── requirements.txt     # Python dependencies
│
├── contracts/                # Sui Move smart contracts
│   ├── sources/
│   │   └── model_registry.move
│   └── Move.toml            # Contract manifest
│
├── docs/                     # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
└── scripts/                  # Deployment scripts
    └── deploy-contracts.sh
```

---

## 🌟 What Makes This Special

### Innovation Points

1. **Browser-Native BCS Parsing**: No backend needed for blockchain data
2. **Zero-Config Walrus**: Direct PUT uploads without complex SDK
3. **Synchronous Provisioning**: API waits for complete setup
4. **Auto-Scaling**: Create instances only when needed
5. **Cost Optimization**: 30-minute timeout prevents runaway costs

### Hackathon Highlights

- ✅ **Fully Functional**: Upload, browse, and execute models end-to-end
- ✅ **Production Ready**: Error handling, loading states, validation
- ✅ **Well Documented**: Comprehensive README and code comments
- ✅ **Open Source**: MIT license, ready for community contributions
- ✅ **Scalable Design**: Can handle thousands of models and users

---

## 🚀 Deployed Contracts

**Sui Testnet**
```
Package ID:  0x0ad1816684996d1e44fce381f0b0f5f9d09223c70c29a0111e8f77cf5cf59bb2
Registry ID: 0xce6abe2a425d06478dcf685faf827260ec7888041c63c2f107672007de7bfd0f
Network:     https://fullnode.testnet.sui.io:443
```

[View on Sui Explorer →](https://suiscan.xyz/testnet/object/0x0ad1816684996d1e44fce381f0b0f5f9d09223c70c29a0111e8f77cf5cf59bb2)

**Walrus Testnet**
```
Publisher:   https://publisher.walrus-testnet.walrus.space
Aggregator:  https://aggregator.walrus-testnet.walrus.space
Max Size:    10 MB
Epochs:      3 (deletable)
```

---

## 🎬 Demo Video

[📺 Watch Demo Video on YouTube →](https://youtu.be/YVkswhpFN3Q?si=bZxv3DPLqBuc4M-p)

**Video Contents:**
1. Upload a sample AI model
2. View model in marketplace
3. Click "Try It Out" 
4. Create instance and wait
5. Run inference with sample input
6. See results and countdown timer
7. Manual deletion

---

## 📊 Metrics & Impact

### Current Stats
- 📦 Models Uploaded: Testing phase
- 👥 Unique Users: Hackathon demo
- ⚡ Instances Created: Dev environment
- 💰 Total Cost Saved: $0 (free testnet)

### Future Roadmap

**Phase 1: MVP** ✅
- [x] Smart contract deployment
- [x] Walrus integration
- [x] Basic upload/browse functionality
- [x] EC2 instance provisioning
- [x] 30-minute playground

**Phase 2: Mainnet Launch** (Q1 2026)
- [ ] Deploy to Sui Mainnet
- [ ] Implement payment system
- [ ] Add model versioning
- [ ] Build recommendation engine
- [ ] Launch token incentives

**Phase 3: Scale** (Q2 2026)
- [ ] Multi-region EC2 deployment
- [ ] CDN optimization
- [ ] Model categories & search
- [ ] User profiles & reviews
- [ ] API monetization

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md)

### Development Setup

```bash
# Install dependencies
cd frontend && pnpm install
cd backend && pip install -r requirements.txt

# Run tests
cd frontend && pnpm test
cd backend && pytest

# Format code
cd frontend && pnpm format
cd backend && black .
```

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)



---

## 🙏 Acknowledgments

- Sui Foundation for the amazing blockchain platform
- Mysten Labs for Walrus storage
- The open-source community


---

<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

[Report Bug](https://github.com/AbhimanyuAjudiya/Synapse-Model/issues) • [Request Feature](https://github.com/AbhimanyuAjudiya/Synapse-Model/issues) • [Ask Question](https://github.com/AbhimanyuAjudiya/Synapse-Model/discussions)

</div>
