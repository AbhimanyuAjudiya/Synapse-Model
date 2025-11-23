import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { createWeb3Modal } from "@web3modal/wagmi/react"
import { config } from "@/lib/web3"

const queryClient = new QueryClient()

const projectId = process.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id"

// Create Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: "dark",
  themeVariables: {
    "--w3m-font-family": "Inter, sans-serif",
    "--w3m-accent": "hsl(var(--primary))",
  },
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
