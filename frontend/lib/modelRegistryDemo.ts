// Demo functions to test the Model Registry integration
import { 
  registerModelOnChain, 
  getModelMetadata, 
  getAllModelBlobIds, 
  modelExists, 
  getTotalModels,
  type ModelMetadata 
} from './modelRegistryClient'

/**
 * Demo function to register a model on the blockchain
 */
export async function demoRegisterModel() {
  const sampleModel: ModelMetadata = {
    blobId: "demo-blob-" + Date.now(),
    objectId: "demo-object-" + Date.now(),
    name: "Sample AI Model",
    description: "This is a demo AI model for testing"
  }

  console.log("🚀 Registering model:", sampleModel)
  
  const result = await registerModelOnChain(sampleModel)
  
  if (result.success) {
    console.log("✅ Model registered successfully!")
    console.log("📝 Transaction hash:", result.transactionHash)
    return sampleModel.blobId
  } else {
    console.error("❌ Registration failed:", result.error)
    return null
  }
}

/**
 * Demo function to fetch model data
 */
export async function demoFetchModelData(blobId: string) {
  console.log("🔍 Fetching model data for blobId:", blobId)
  
  // Check if model exists
  const exists = await modelExists(blobId)
  console.log("🔗 Model exists:", exists)
  
  if (exists) {
    // Get model metadata
    const metadata = await getModelMetadata(blobId)
    console.log("📊 Model metadata:", metadata)
    return metadata
  }
  
  return null
}

/**
 * Demo function to list all models
 */
export async function demoListAllModels() {
  console.log("📋 Fetching all models...")
  
  // Get total count
  const totalModels = await getTotalModels()
  console.log("📊 Total models:", totalModels)
  
  // Get all blob IDs
  const blobIds = await getAllModelBlobIds()
  console.log("🗂️ All blob IDs:", blobIds)
  
  // Fetch metadata for each model
  const allModels = []
  for (const blobId of blobIds.slice(0, 5)) { // Limit to first 5 for demo
    const metadata = await getModelMetadata(blobId)
    if (metadata) {
      allModels.push({ blobId, ...metadata })
    }
  }
  
  console.log("📦 Sample models:", allModels)
  return allModels
}

/**
 * Complete demo workflow
 */
export async function runCompleteDemo() {
  try {
    console.log("🎯 Starting complete Model Registry demo...")
    
    // Step 1: List existing models
    console.log("\n--- Step 1: List existing models ---")
    await demoListAllModels()
    
    // Step 2: Register a new model
    console.log("\n--- Step 2: Register new model ---")
    const newBlobId = await demoRegisterModel()
    
    if (newBlobId) {
      // Wait a bit for the transaction to be processed
      console.log("⏳ Waiting for transaction to be processed...")
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Step 3: Fetch the newly registered model
      console.log("\n--- Step 3: Fetch newly registered model ---")
      await demoFetchModelData(newBlobId)
      
      // Step 4: List all models again to see the new one
      console.log("\n--- Step 4: List all models (including new one) ---")
      await demoListAllModels()
    }
    
    console.log("\n✅ Demo completed!")
    
  } catch (error) {
    console.error("❌ Demo failed:", error)
  }
}