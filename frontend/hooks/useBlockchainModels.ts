import { useState, useEffect } from 'react'
import { getAllModelsFromBlockchain, convertToModelManifest, type ModelData } from '@/lib/suiClient'
import type { ModelManifest } from '@/types/model'
import { useSuiWallet } from './useSuiWallet'

export function useBlockchainModels() {
  const [models, setModels] = useState<ModelManifest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { packageId, registryObjectId } = useSuiWallet()
  
  // Hardcoded testnet values as fallback
  const TESTNET_PACKAGE_ID = "0x4d6b5e031d2eab0ea39ad6fb78bd3b30a24722b9d8c26fc2f0388a08aad39403"
  const TESTNET_REGISTRY_ID = "0x9dfc7009ec4b3c1ea6830f5333c150869a784295fdf49486e2e01edc5a3088dc"
  
  const actualPackageId = (packageId && packageId !== "0x0") ? packageId : TESTNET_PACKAGE_ID
  const actualRegistryId = (registryObjectId && registryObjectId !== "0x0") ? registryObjectId : TESTNET_REGISTRY_ID

  const fetchModels = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const blockchainModels = await getAllModelsFromBlockchain(actualPackageId, actualRegistryId)
      
      // Convert blockchain data to frontend format
      const convertedModels = blockchainModels.map(convertToModelManifest)
      
      setModels(convertedModels)
      
    } catch (err) {
      console.error('❌ Error fetching Sui blockchain models:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch models')
      setModels([]) // Fallback to empty array
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Always fetch models on mount, using fallback values if needed
    fetchModels()
  }, [actualPackageId, actualRegistryId])

  return {
    models,
    loading,
    error,
    refetch: fetchModels
  }
}