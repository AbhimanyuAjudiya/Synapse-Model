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
  const TESTNET_PACKAGE_ID = "0x0ad1816684996d1e44fce381f0b0f5f9d09223c70c29a0111e8f77cf5cf59bb2"
  const TESTNET_REGISTRY_ID = "0xce6abe2a425d06478dcf685faf827260ec7888041c63c2f107672007de7bfd0f"
  
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