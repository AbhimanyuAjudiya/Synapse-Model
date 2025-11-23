"use client"

import { useCurrentAccount, useDisconnectWallet, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { useNetworkVariable } from "@/lib/sui"

export function useSuiWallet() {
  const currentAccount = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  
  const packageId = useNetworkVariable("modelRegistryPackageId")
  const registryObjectId = useNetworkVariable("modelRegistryObjectId")

  const isConnected = !!currentAccount
  const address = currentAccount?.address

  const formatAddress = (addr?: string) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return {
    address,
    isConnected,
    isConnecting: false,
    currentAccount,
    packageId,
    registryObjectId,
    disconnectWallet: disconnect,
    signAndExecuteTransaction,
    formatAddress: () => formatAddress(address),
  }
}
