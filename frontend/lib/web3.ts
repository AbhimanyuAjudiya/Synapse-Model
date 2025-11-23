import { createConfig, http } from "wagmi"
import { defineChain } from "viem"
import { injected, walletConnect } from "wagmi/connectors"

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id"

// Define Polygon Amoy testnet
export const polygonAmoy = defineChain({
  id: 80002,
  name: 'Polygon Amoy',
  nativeCurrency: {
    decimals: 18,
    name: 'POL',
    symbol: 'POL',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-amoy.polygon.technology/'],
    },
  },
  blockExplorers: {
    default: { name: 'polygonscan', url: 'https://amoy.polygonscan.com/' },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [polygonAmoy],
  connectors: [injected(), walletConnect({ projectId })],
  transports: {
    [polygonAmoy.id]: http('https://polygon-amoy.g.alchemy.com/v2/MfgwMxE_nilnusAamn_chUxACP0N8o1C'),
  },
})

export const SUPPORTED_CHAINS = [polygonAmoy.id] as const

export function isSupportedChain(chainId: number): boolean {
  return (SUPPORTED_CHAINS as readonly number[]).includes(chainId)
}

export function getChainName(chainId: number): string {
  switch (chainId) {
    case polygonAmoy.id:
      return "Polygon Amoy"
    default:
      return "Unknown Network"
  }
}

export function getExplorerUrl(chainId: number): string {
  switch (chainId) {
    case polygonAmoy.id:
      return "https://www.oklink.com/amoy"
    default:
      return ""
  }
}
