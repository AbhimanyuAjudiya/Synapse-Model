import { writeContract, waitForTransactionReceipt, readContract } from "wagmi/actions"
import { config } from "./web3"
import { Address } from "viem"
import type { ModelManifest } from "@/types/model"

// Model Registry Contract ABI (Updated to match your contract)
const MODEL_REGISTRY_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "blobId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "objectId", 
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "uploadModel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "blobId",
        "type": "string"
      }
    ],
    "name": "getMetadata",
    "outputs": [
      {
        "internalType": "address",
        "name": "uploader",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "uploadedAt",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "modelBlobId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "objectId",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllBlobIds",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "blobId",
        "type": "string"
      }
    ],
    "name": "exists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalModels",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "blobId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "uploader",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "uploadedAt",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "objectId",
        "type": "string"
      }
    ],
    "name": "ModelUploaded",
    "type": "event"
  }
] as const

// Contract address from deployment
const CONTRACT_ADDRESS = "0x4c6b95942a79b03275b1f54cb2994db9a923d23a" as Address

export interface ModelMetadata {
  blobId: string
  objectId: string
  name: string
  description: string
}

export interface ModelRegistryResult {
  transactionHash: string
  success: boolean
  error?: string
}

export interface ModelData {
  uploader: Address
  uploadedAt: bigint
  name: string
  description: string
  modelBlobId: string
  objectId: string
  originalBlobId?: string // The blob ID used to fetch this model from the registry
}

// Register a new model on the blockchain
export async function registerModelOnChain(metadata: ModelMetadata): Promise<ModelRegistryResult> {
  try {
    console.log("Registering model on chain with metadata:", metadata)
    
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESS,
      abi: MODEL_REGISTRY_ABI,
      functionName: "uploadModel",
      args: [
        metadata.blobId,
        metadata.objectId,
        metadata.name,
        metadata.description,
      ],
    })

    console.log("Transaction hash:", hash)
    
    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(config, { hash })
    
    console.log("Transaction confirmed:", receipt)

    return {
      transactionHash: hash,
      success: true,
    }
  } catch (error) {
    console.error("Model registration failed:", error)
    return {
      transactionHash: "",
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    }
  }
}

// Get model metadata by blobId
export async function getModelMetadata(blobId: string): Promise<ModelData | null> {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: MODEL_REGISTRY_ABI,
      functionName: "getMetadata",
      args: [blobId],
    })

    return {
      uploader: result[0] as Address,
      uploadedAt: result[1] as bigint,
      name: result[2] as string,
      description: result[3] as string,
      modelBlobId: result[4] as string,
      objectId: result[5] as string,
    }
  } catch (error) {
    console.error("Failed to get model metadata:", error)
    return null
  }
}

// Get all model blob IDs
export async function getAllModelBlobIds(): Promise<string[]> {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: MODEL_REGISTRY_ABI,
      functionName: "getAllBlobIds",
    }) as string[]

    return result
  } catch (error) {
    console.error("Failed to get model blob IDs:", error)
    return []
  }
}

// Check if a model exists
export async function modelExists(blobId: string): Promise<boolean> {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: MODEL_REGISTRY_ABI,
      functionName: "exists",
      args: [blobId],
    }) as boolean

    return result
  } catch (error) {
    console.error("Failed to check if model exists:", error)
    return false
  }
}

// Get total number of models
export async function getTotalModels(): Promise<number> {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: MODEL_REGISTRY_ABI,
      functionName: "totalModels",
    }) as bigint

    return Number(result)
  } catch (error) {
    console.error("Failed to get total models:", error)
    return 0
  }
}

// Fetch all models from the blockchain
export async function getAllModelsFromBlockchain(): Promise<ModelData[]> {
  try {
    console.log("🔍 Fetching all models from blockchain...")
    
    // Get all blob IDs
    const blobIds = await getAllModelBlobIds()
    console.log("📋 Found blob IDs:", blobIds)
    
    if (blobIds.length === 0) {
      console.log("📭 No models found on blockchain")
      return []
    }
    
    // Fetch metadata for each model
    const allModels: ModelData[] = []
    
    for (const blobId of blobIds) {
      try {
        const metadata = await getModelMetadata(blobId)
        if (metadata) {
          // Add the original blobId to the metadata for tracking
          const modelWithBlobId: ModelData = {
            ...metadata,
            originalBlobId: blobId
          }
          allModels.push(modelWithBlobId)
          console.log(`✅ Retrieved model: ${metadata.name} with originalBlobId: ${blobId}, modelBlobId: ${metadata.modelBlobId}`)
        }
      } catch (error) {
        console.error(`❌ Failed to fetch metadata for blobId ${blobId}:`, error)
        // Continue with other models even if one fails
      }
    }
    
    console.log(`🎯 Successfully fetched ${allModels.length} models from blockchain`)
    return allModels
    
  } catch (error) {
    console.error("Failed to fetch all models from blockchain:", error)
    return []
  }
}

// Convert blockchain model data to frontend model format
export function convertToModelManifest(modelData: ModelData): ModelManifest {
  const finalBlobId = modelData.originalBlobId || modelData.modelBlobId
  console.log(`🔄 Converting model "${modelData.name}":`, {
    originalBlobId: modelData.originalBlobId,
    modelBlobId: modelData.modelBlobId,
    finalBlobId: finalBlobId
  })
  
  return {
    id: modelData.modelBlobId,
    name: modelData.name,
    about: modelData.description,
    type: "text" as const, // Default type, could be enhanced to store type in contract
    tags: ["blockchain", "uploaded"], // Default tags, could be enhanced to store tags in contract  
    thumbnailUrl: "/ai-brain-neural-network.jpg", // Default thumbnail
    pricing: { mode: "hourly" as const, pricePerHour: 0.05 }, // Default pricing
    framework: "Custom" as const, // Could be enhanced to store framework in contract
    author: `${modelData.uploader.slice(0, 6)}...${modelData.uploader.slice(-4)}`, // Shortened address
    createdAt: new Date(Number(modelData.uploadedAt) * 1000).toISOString().split('T')[0], // Convert timestamp
    // Blockchain-specific fields - these will now be preserved throughout the process
    uploader: modelData.uploader,
    blobId: finalBlobId, // Use original blobId for Walrus links
    objectId: modelData.objectId,
  }
}
