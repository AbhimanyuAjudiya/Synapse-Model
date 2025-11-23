# Synapse Model - Sui Frontend

AI Model Marketplace powered by Sui blockchain and Walrus storage.

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Sui wallet (Sui Wallet browser extension)

### Installation

```bash
cd frontend
pnpm install
```

### Configuration

1. Deploy the Sui contract (see `../contracts/README.md`)
2. Update `lib/sui.ts` with your deployed contract addresses:

```typescript
testnet: {
  variables: {
    modelRegistryPackageId: "0xYOUR_PACKAGE_ID",
    modelRegistryObjectId: "0xYOUR_REGISTRY_OBJECT_ID",
  },
},
```

### Development

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build

```bash
pnpm build
```

## Features

- 🔗 **Sui Blockchain Integration**: On-chain model registry
- 📦 **Walrus Storage**: Decentralized file storage for AI models
- 💼 **Wallet Management**: Connect with Sui wallet
- 📤 **Model Upload**: Upload and register AI models
- 🔍 **Model Discovery**: Browse and search uploaded models
- 🎨 **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Blockchain**: Sui (@mysten/dapp-kit, @mysten/sui)
- **Storage**: Walrus (@mysten/walrus)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form + Zod
- **Build Tool**: Vite

## Project Structure

```
frontend/
├── components/        # React components
│   ├── ui/           # Reusable UI components
│   ├── Navbar.tsx    # Navigation bar
│   ├── UploadForm.tsx # Model upload form
│   └── ...
├── hooks/            # Custom React hooks
│   ├── useSuiWallet.ts
│   └── useBlockchainModels.ts
├── lib/              # Utilities and clients
│   ├── sui.ts        # Sui configuration
│   ├── suiClient.ts  # Sui blockchain client
│   └── utils.ts      # Helper functions
├── pages/            # Page components
├── types/            # TypeScript type definitions
└── src/
    ├── App.tsx       # Main app component
    └── main.tsx      # Entry point
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Migration from Polygon

This project was migrated from Polygon to Sui. See [MIGRATION.md](./MIGRATION.md) for details.

## Deployment

### Deploy Contract First
```bash
cd ../contracts
sui client publish --gas-budget 100000000
```

### Update Configuration
Copy the Package ID and Registry Object ID to `lib/sui.ts`.

### Deploy Frontend
```bash
pnpm build
# Deploy the dist/ folder to your hosting service
```

## License

MIT
