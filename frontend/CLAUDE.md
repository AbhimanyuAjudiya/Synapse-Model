# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install       # Install dependencies
pnpm dev           # Start dev server at http://localhost:5173
pnpm build         # Production build (outputs to dist/)
pnpm preview       # Preview production build
pnpm lint          # Run ESLint (--max-warnings 0, strict)
```

## Architecture

**Synapse Model** is an AI model marketplace on the Sui blockchain. Users upload model files to Walrus (decentralized storage), then register them on-chain via a Sui smart contract.

### Entry Points

- `src/main.tsx` → `src/App.tsx` — BrowserRouter with `Web3Provider` wrapping all routes
- Routes: `/` (Home), `/models` (Models), `/models/:id/playground` (Playground), `/upload` (Upload), `/about` (About)
- Pages live in `src/pages/`, feature components in `components/`, shadcn primitives in `components/ui/`

### Blockchain Layer

- **`lib/sui.ts`** — Network config (testnet/mainnet). Contains the deployed contract addresses (`modelRegistryPackageId`, `modelRegistryObjectId`). Update here when redeploying the contract.
- **`lib/suiClient.ts`** — All Sui RPC calls: `registerModelOnChain`, `getAllModelsFromBlockchain`, `modelExists`. Uses `devInspectTransactionBlock` for read-only queries and manually parses BCS-encoded struct bytes.
- **`components/Web3Provider.tsx`** — Wraps app with `@tanstack/react-query`, `SuiClientProvider` (defaultNetwork: testnet), and `WalletProvider` (autoConnect).
- **`hooks/useSuiWallet.ts`** — Thin wrapper over `@mysten/dapp-kit` hooks; exposes `address`, `isConnected`, `packageId`, `registryObjectId`, `signAndExecuteTransaction`.
- **`hooks/useBlockchainModels.ts`** — Fetches all models from the registry on mount; returns `{ models, loading, error, refetch }`.

### Upload Flow

1. User selects a `.zip` file (max 10MB) — upload to Walrus publisher (`https://publisher.walrus-testnet.walrus.space`) starts immediately via `PUT /v1/blobs?epochs=3&deletable=true`
2. On form submit, checks if `blobId` already exists on-chain via `registry::exists`
3. Calls `registry::upload_model` move function with `blobId`, `objectId`, `name`, `description`, and the Sui Clock object

### Key Contracts

The Sui Move contract is in `../contracts/`. The registry's shared object stores a `blob_ids` vector. Model metadata is read by calling `registry::get_metadata` per blob ID and manually deserializing the returned BCS bytes (32-byte address, 8-byte u64 timestamp, length-prefixed strings).

### Type System

`types/model.ts` defines `ModelManifest` (the frontend model shape) and `ModelType`, `PricingMode`, `PlaygroundSession`, `ChatMessage`, `SessionSettings`.

### UI

- shadcn/ui components ("new-york" style, neutral base) — add new components with `pnpm dlx shadcn@latest add <component>`
- All colors use CSS variables (`hsl(var(--primary))` etc.)
- Path alias `@/` maps to the project root
- Animations via Framer Motion; icons via `lucide-react`

### Contract Configuration

Testnet contract addresses are hardcoded in multiple places as fallback when `networkConfig` returns `0x0`:
- `lib/sui.ts` (canonical source)
- `lib/suiClient.ts` (fallback)
- `hooks/useBlockchainModels.ts` (fallback)
- `components/UploadForm.tsx` (fallback)

When updating contract addresses, update all four locations.
