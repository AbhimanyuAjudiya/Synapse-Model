"use client"

import { useAccount, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { isSupportedChain, getChainName } from "@/lib/web3"
import { polygonAmoy } from "@/lib/web3"

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isOnSupportedChain = isSupportedChain(chainId)
  const currentChainName = getChainName(chainId)

  const connectWallet = async () => {
    try {
      await open()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const disconnectWallet = async () => {
    try {
      disconnect()
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const switchToPolygon = async () => {
    try {
      await switchChain({ chainId: polygonAmoy.id })
    } catch (error) {
      console.error("Failed to switch to Polygon Amoy:", error)
    }
  }

  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    isOnSupportedChain,
    currentChainName,
    connectWallet,
    disconnectWallet,
    switchToPolygon,
    formatAddress: () => formatAddress(address || ""),
  }
}
