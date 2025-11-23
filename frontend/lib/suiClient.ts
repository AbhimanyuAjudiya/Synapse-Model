import { SuiClient } from "@mysten/sui/client"
import { Transaction } from "@mysten/sui/transactions"
import { SUI_CLOCK_OBJECT_ID } from "./sui"
import type { ModelManifest } from "@/types/model"

// Sui client instance
const suiClient = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" })

export interface RegisterModelParams {
  blobId: string
  objectId: string
  name: string
  description: string
}

export interface RegistrationResult {
  success: boolean
  transactionHash: string
  error?: string
}

export interface ModelData {
  uploader: string
  uploadedAt: string
  name: string
  description: string
  blobId: string
  objectId: string
}

/**
 * Register a model on the Sui blockchain
 */
export async function registerModelOnChain(
  params: RegisterModelParams,
  packageId: string,
  registryObjectId: string,
  signAndExecute: any
): Promise<RegistrationResult> {
  try {
    // console.log("📝 Registering model on Sui blockchain...")
    // console.log("Package ID:", packageId)
    // console.log("Registry Object ID:", registryObjectId)
    // console.log("Params:", params)

    const tx = new Transaction()

    // Call upload_model function
    tx.moveCall({
      target: `${packageId}::registry::upload_model`,
      arguments: [
        tx.object(registryObjectId), // registry: &mut ModelRegistry
        tx.pure.string(params.blobId), // blob_id: String
        tx.pure.string(params.objectId), // object_id: String
        tx.pure.string(params.name), // name: String
        tx.pure.string(params.description), // description: String
        tx.object(SUI_CLOCK_OBJECT_ID), // clock: &Clock
      ],
    })

    // Execute transaction
    const result = await signAndExecute({
      transaction: tx,
    })

    // console.log("✅ Transaction executed:", result)

    return {
      success: true,
      transactionHash: result.digest,
    }
  } catch (error) {
    console.error("❌ Failed to register model on blockchain:", error)
    return {
      success: false,
      transactionHash: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Get all models from the blockchain
 */
export async function getAllModelsFromBlockchain(
  packageId: string,
  registryObjectId: string
): Promise<ModelData[]> {
  try {
    // Use hardcoded testnet values if needed
    const TESTNET_PACKAGE_ID = "0x0ad1816684996d1e44fce381f0b0f5f9d09223c70c29a0111e8f77cf5cf59bb2"
    const TESTNET_REGISTRY_ID = "0xce6abe2a425d06478dcf685faf827260ec7888041c63c2f107672007de7bfd0f"
    
    const actualPackageId = (packageId && packageId !== "0x0") ? packageId : TESTNET_PACKAGE_ID
    const actualRegistryId = (registryObjectId && registryObjectId !== "0x0") ? registryObjectId : TESTNET_REGISTRY_ID

    // Get the registry object to access blob_ids
    const registryObject = await suiClient.getObject({
      id: actualRegistryId,
      options: {
        showContent: true,
      },
    })

    if (!registryObject.data?.content || registryObject.data.content.dataType !== "moveObject") {
      // console.log("❌ Invalid registry object")
      return []
    }

    const fields = registryObject.data.content.fields as any
    const blobIds = fields.blob_ids || []

    if (blobIds.length === 0) {
      return []
    }

    // Fetch metadata for each blob ID
    const models: ModelData[] = []
    
    for (const blobId of blobIds) {
      try {
        const result = await suiClient.devInspectTransactionBlock({
          sender: "0x0000000000000000000000000000000000000000000000000000000000000000",
          transactionBlock: (() => {
            const tx = new Transaction()
            tx.moveCall({
              target: `${actualPackageId}::registry::get_metadata`,
              arguments: [
                tx.object(actualRegistryId),
                tx.pure.string(blobId),
              ],
            })
            return tx
          })(),
        })

        // Parse the returned model data
        if (result.results && result.results[0] && result.results[0].returnValues) {
          const returnValues = result.results[0].returnValues
          
          // The return is a single Model struct, not individual fields
          if (returnValues[0] && returnValues[0][0]) {
            const structBytes = new Uint8Array(returnValues[0][0])
            
            // Helper function to decode UTF8 from Uint8Array
            const decodeUTF8 = (bytes: Uint8Array): string => {
              return new TextDecoder().decode(bytes)
            }
            
            // Helper function to read string with length prefix
            const readString = (bytes: Uint8Array, offset: number): { value: string; newOffset: number } => {
              const length = bytes[offset]
              const stringBytes = bytes.slice(offset + 1, offset + 1 + length)
              return {
                value: decodeUTF8(stringBytes),
                newOffset: offset + 1 + length
              }
            }
            
            let offset = 0
            
            // Parse uploader (32 bytes address)
            const uploaderBytes = structBytes.slice(offset, offset + 32)
            const uploader = `0x${Array.from(uploaderBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`
            offset += 32
            
            // Parse timestamp (8 bytes u64, little endian)
            let uploadedAtValue = 0n
            for (let i = 0; i < 8; i++) {
              uploadedAtValue |= BigInt(structBytes[offset + i]) << BigInt(i * 8)
            }
            const uploadedAt = uploadedAtValue.toString()
            offset += 8
            
            // Parse name (length-prefixed string)
            const nameResult = readString(structBytes, offset)
            const name = nameResult.value
            offset = nameResult.newOffset
            
            // Parse description (length-prefixed string)
            const descResult = readString(structBytes, offset)
            const description = descResult.value
            offset = descResult.newOffset
            
            // Parse blob_id (length-prefixed string)
            const blobIdResult = readString(structBytes, offset)
            const returnedBlobId = blobIdResult.value
            offset = blobIdResult.newOffset
            
            // Parse object_id (length-prefixed string)
            const objectIdResult = readString(structBytes, offset)
            const objectId = objectIdResult.value

            const modelData: ModelData = {
              uploader,
              uploadedAt,
              name,
              description,
              blobId: returnedBlobId,
              objectId,
            }

            models.push(modelData)
          }
        }
      } catch (err) {
        console.error(`❌ Error fetching metadata for blob ${blobId}:`, err)
      }
    }

    return models
  } catch (error) {
    console.error("❌ Error fetching models from blockchain:", error)
    return []
  }
}

/**
 * Get metadata for a specific model
 */
export async function getModelMetadata(
  blobId: string,
  packageId: string,
  registryObjectId: string
): Promise<ModelData | null> {
  try {
    const result = await suiClient.devInspectTransactionBlock({
      sender: "0x0000000000000000000000000000000000000000000000000000000000000000",
      transactionBlock: (() => {
        const tx = new Transaction()
        tx.moveCall({
          target: `${packageId}::registry::get_metadata`,
          arguments: [tx.object(registryObjectId), tx.pure.string(blobId)],
        })
        return tx
      })(),
    })

    // Parse the result - this requires proper BCS deserialization
    // console.log("Model metadata result:", result)

    return null // Placeholder
  } catch (error) {
    console.error("Error fetching model metadata:", error)
    return null
  }
}

/**
 * Check if a model exists
 */
export async function modelExists(
  blobId: string,
  packageId: string,
  registryObjectId: string
): Promise<boolean> {
  try {
    // Use hardcoded testnet values if needed
    const TESTNET_PACKAGE_ID = "0x0ad1816684996d1e44fce381f0b0f5f9d09223c70c29a0111e8f77cf5cf59bb2"
    const TESTNET_REGISTRY_ID = "0xce6abe2a425d06478dcf685faf827260ec7888041c63c2f107672007de7bfd0f"
    
    const actualPackageId = (packageId && packageId !== "0x0") ? packageId : TESTNET_PACKAGE_ID
    const actualRegistryId = (registryObjectId && registryObjectId !== "0x0") ? registryObjectId : TESTNET_REGISTRY_ID

    const result = await suiClient.devInspectTransactionBlock({
      sender: "0x0000000000000000000000000000000000000000000000000000000000000000",
      transactionBlock: (() => {
        const tx = new Transaction()
        tx.moveCall({
          target: `${actualPackageId}::registry::exists`,
          arguments: [tx.object(actualRegistryId), tx.pure.string(blobId)],
        })
        return tx
      })(),
    })

    // Check if the function returned true
    if (result.results && result.results[0] && result.results[0].returnValues) {
      const exists = result.results[0].returnValues[0][0][0] === 1
      return exists
    }
    
    return false
  } catch (error) {
    console.error("Error checking model existence:", error)
    return false
  }
}

/**
 * Get total number of models
 */
export async function getTotalModels(
  packageId: string,
  registryObjectId: string
): Promise<number> {
  try {
    const result = await suiClient.devInspectTransactionBlock({
      sender: "0x0000000000000000000000000000000000000000000000000000000000000000",
      transactionBlock: (() => {
        const tx = new Transaction()
        tx.moveCall({
          target: `${packageId}::registry::total_models`,
          arguments: [tx.object(registryObjectId)],
        })
        return tx
      })(),
    })

    // console.log("Total models result:", result)
    return 0 // Placeholder
  } catch (error) {
    console.error("Error fetching total models:", error)
    return 0
  }
}

/**
 * Convert blockchain model data to frontend format
 */
export function convertToModelManifest(data: ModelData): ModelManifest {
  // Convert timestamp from milliseconds to ISO string
  const uploadedAtMs = parseInt(data.uploadedAt)
  const createdAt = new Date(uploadedAtMs).toISOString()
  
  return {
    id: data.blobId,
    name: data.name || "Unnamed Model",
    about: data.description || "No description provided",
    type: "text", // Default type, can be enhanced later
    author: data.uploader,
    uploader: data.uploader,
    createdAt: createdAt,
    blobId: data.blobId,
    objectId: data.objectId,
    tags: [], // Can be enhanced later
    framework: "Custom",
    pricing: { mode: "free" }, // Default pricing
  }
}

export { suiClient }
