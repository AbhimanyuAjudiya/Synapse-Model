# SynapseModel Frontend

React/Next.js frontend for the SynapseModel verifiable AI inference platform.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Sui Wallet (browser extension)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_ENCLAVE_PACKAGE_ID=0x...
NEXT_PUBLIC_APP_PACKAGE_ID=0x...
NEXT_PUBLIC_ENCLAVE_CONFIG_ID=0x...
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

Build for production:

```bash
npm run build
npm start
```

## Features

- **Wallet Integration**: Connect Sui wallet for authentication
- **Job Submission**: Submit ML inference jobs to TEE server
- **Real-time Updates**: Auto-refresh job status with SWR
- **On-chain Verification**: Verify TEE proofs on Sui blockchain
- **Trust Certificates**: View and manage verification certificates

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries
├── pages/          # Next.js pages
├── styles/         # Global styles
└── types/          # TypeScript type definitions
```

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: SWR, Zustand
- **Blockchain**: Sui SDK (@mysten/sui.js)
- **Wallet**: Sui Wallet Kit

## License

MIT
