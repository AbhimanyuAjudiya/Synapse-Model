import { getFullnodeUrl } from "@mysten/sui/client"
import { createNetworkConfig } from "@mysten/dapp-kit"

// Sui Network Configuration
const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  testnet: {
    url: getFullnodeUrl("testnet"),
    variables: {
      // Replace with your deployed package ID after deployment
      modelRegistryPackageId: "0x4d6b5e031d2eab0ea39ad6fb78bd3b30a24722b9d8c26fc2f0388a08aad39403",
      // Replace with your ModelRegistry shared object ID
      modelRegistryObjectId: "0x9dfc7009ec4b3c1ea6830f5333c150869a784295fdf49486e2e01edc5a3088dc",
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
