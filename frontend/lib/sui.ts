import { getFullnodeUrl } from "@mysten/sui/client"
import { createNetworkConfig } from "@mysten/dapp-kit"

// Sui Network Configuration
const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  testnet: {
    url: getFullnodeUrl("testnet"),
    variables: {
      // Replace with your deployed package ID after deployment
      modelRegistryPackageId: "0x0ad1816684996d1e44fce381f0b0f5f9d09223c70c29a0111e8f77cf5cf59bb2",
      // Replace with your ModelRegistry shared object ID
      modelRegistryObjectId: "0xce6abe2a425d06478dcf685faf827260ec7888041c63c2f107672007de7bfd0f",
    },
  },
  mainnet: {
    url: getFullnodeUrl("mainnet"),
    variables: {
      modelRegistryPackageId: "0x0",
      modelRegistryObjectId: "0x0",
    },
  },
})

export { useNetworkVariable, useNetworkVariables, networkConfig }

// Sui Clock object (shared object available on all networks)
export const SUI_CLOCK_OBJECT_ID = "0x6"
