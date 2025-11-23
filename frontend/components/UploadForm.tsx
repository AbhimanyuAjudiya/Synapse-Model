import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { Upload, X, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileDropzone } from "@/components/FileDropzone"
import { registerModelOnChain, modelExists } from "@/lib/suiClient"
import { useSuiWallet } from "@/hooks/useSuiWallet"

interface UploadFormData {
  name: string
  description: string
}

interface WalrusUploadResult {
  success: boolean
  fileName: string
  size: number
  type: string
  epochs: number
  deletable: boolean
  timestamp: string
  blobId?: string
  suiObjectId?: string
  objectId?: string
  registeredEpoch?: string
  endEpoch?: string
  storageSize?: number
  cost?: string
  status?: string
  message?: string
  txDigest?: string
}

export function UploadForm() {
  const { address, isConnected, packageId, registryObjectId, signAndExecuteTransaction } = useSuiWallet()
  
  // Testnet contract addresses (hardcoded fallback)
  const PACKAGE_ID = "0x0ad1816684996d1e44fce381f0b0f5f9d09223c70c29a0111e8f77cf5cf59bb2"
  const REGISTRY_ID = "0xce6abe2a425d06478dcf685faf827260ec7888041c63c2f107672007de7bfd0f"
  
  // Use hardcoded values if network config returns 0x0
  const actualPackageId = (packageId && packageId !== "0x0") ? packageId : PACKAGE_ID
  const actualRegistryId = (registryObjectId && registryObjectId !== "0x0") ? registryObjectId : REGISTRY_ID
  
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string>("")
  const [uploadError, setUploadError] = useState("")
  const [currentStep, setCurrentStep] = useState<"upload" | "register" | "complete">("upload")
  const [walrusUploadResult, setWalrusUploadResult] = useState<any>(null)
  const [isFileUploaded, setIsFileUploaded] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ progress: number; stage: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormData>()

  // Walrus constants
  const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space"
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Walrus upload function
  const uploadToWalrus = async (file: File): Promise<WalrusUploadResult> => {
    if (!file) throw new Error("No file provided")

    // Validate file size
    if (file.size > MAX_SIZE) {
      throw new Error(
        `File too large! Size: ${(file.size / 1024 / 1024).toFixed(
          1
        )}MB, Maximum: 10MB`
      )
    }

    if (file.size === 0) {
      throw new Error("Empty file selected")
    }

    // console.log(
    //   `📁 Uploading file - Size: ${file.size} bytes, Type: ${file.type}`
    // )

    const walrusResponse = await fetch(
      `${WALRUS_PUBLISHER}/v1/blobs?epochs=3&deletable=true`,
      {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      }
    )

    // console.log(`📡 Walrus response status: ${walrusResponse.status}`)

    if (!walrusResponse.ok) {
      const errorText = await walrusResponse.text()
      throw new Error(
        `Publisher returned error: ${walrusResponse.status} - ${errorText}`
      )
    }

    const walrusResult = await walrusResponse.json()
    // console.log("✅ Walrus upload successful!", walrusResult)

    let responseData: WalrusUploadResult = {
      success: true,
      fileName: file.name,
      size: file.size,
      type: file.type,
      epochs: 3,
      deletable: true,
      timestamp: new Date().toISOString(),
    }

    if (walrusResult.newlyCreated) {
      const blobObject = walrusResult.newlyCreated.blobObject
      responseData = {
        ...responseData,
        blobId: blobObject.blobId,
        suiObjectId: blobObject.id,
        objectId: blobObject.id, // For compatibility with blockchain registration
        registeredEpoch: blobObject.registeredEpoch,
        endEpoch: blobObject.storage.endEpoch,
        storageSize: blobObject.storage.storageSize,
        cost: walrusResult.newlyCreated.cost,
        status: "newly_created",
        message: "File uploaded successfully!",
      }
    } else if (walrusResult.alreadyCertified) {
      responseData = {
        ...responseData,
        blobId: walrusResult.alreadyCertified.blobId,
        objectId: walrusResult.alreadyCertified.blobId, // For compatibility with blockchain registration
        endEpoch: walrusResult.alreadyCertified.endEpoch,
        txDigest: walrusResult.alreadyCertified.event?.txDigest,
        status: "already_certified",
        message: "File already exists on Walrus!",
      }
    } else {
      throw new Error("Unexpected response format from Walrus publisher")
    }

    return responseData
  }

  // Function to handle file upload to Walrus
  const handleFileUpload = async (file: File) => {
    if (!file) return

    setUploadError("")
    setIsFileUploaded(false)
    setWalrusUploadResult(null)

    try {
      // console.log('Starting file upload to Walrus...')
      setUploadProgress({ progress: 5, stage: "preparing" })
      
      setUploadProgress({ progress: 50, stage: "uploading" })
      const uploadResult = await uploadToWalrus(file)
      
      // console.log('Full Walrus upload result:', uploadResult)
      setWalrusUploadResult(uploadResult)
      setIsFileUploaded(true)
      setUploadProgress(null)
      
    } catch (error) {
      console.error("File upload failed:", error)
      setUploadError(error instanceof Error ? error.message : "File upload failed")
      setUploadProgress(null)
      setIsFileUploaded(false)
      setWalrusUploadResult(null)
    }
  }

  // Handle file selection
  const handleFileChange = (files: File[]) => {
    const file = files[0] || null
    setModelFile(file)
    
    if (file) {
      // Start upload immediately when file is selected
      handleFileUpload(file)
    } else {
      setIsFileUploaded(false)
      setWalrusUploadResult(null)
      setUploadProgress(null)
    }
  }

  const onSubmit = async (data: UploadFormData) => {
    if (!modelFile) {
      setUploadError("Please select a model file")
      return
    }

    if (!isConnected) {
      setUploadError("Please connect your wallet")
      return
    }

    if (!isFileUploaded || !walrusUploadResult) {
      setUploadError("Please wait for file upload to complete")
      return
    }

    if (!walrusUploadResult.blobId) {
      setUploadError("Invalid upload result - missing blobId")
      return
    }

    setUploadError("")
    setUploadSuccess(false)

    try {
      // Step 1: File already uploaded to Walrus, use the stored result
      // Step 2: Check if model already exists on blockchain
      const exists = await modelExists(
        walrusUploadResult.blobId!,
        actualPackageId,
        actualRegistryId
      )
      
      if (exists) {
        throw new Error("This model has already been registered on the blockchain. Please upload a different file or refresh the page to upload again.")
      }

      // Step 3: Register model on smart contract
      setCurrentStep("register")
      setUploadProgress({ progress: 90, stage: "processing" })
      
      const registrationResult = await registerModelOnChain(
        {
          blobId: walrusUploadResult.blobId!,
          objectId: walrusUploadResult.objectId || walrusUploadResult.blobId!,
          name: data.name,
          description: data.description,
        },
        actualPackageId,
        actualRegistryId,
        signAndExecuteTransaction
      )

      if (!registrationResult.success) {
        const errorMsg = registrationResult.error || "Failed to register model on Sui blockchain"
        
        // Check if it's a duplicate blob ID error
        if (errorMsg.includes("EBlobIdAlreadyExists") || errorMsg.includes("error code: 2")) {
          throw new Error("This model has already been registered on the blockchain. Please upload a different file.")
        }
        
        throw new Error(errorMsg)
      }

      // console.log('✅ Model registered successfully on Sui blockchain!')
      // console.log('Transaction digest:', registrationResult.transactionHash)
      setTransactionHash(registrationResult.transactionHash)

      // Step 3: Complete
      setCurrentStep("complete")
      setUploadProgress({ progress: 100, stage: "complete" })
      setUploadSuccess(true)

      // Reset form after successful upload
      setTimeout(() => {
        window.location.href = "/models"
      }, 3000)
    } catch (error) {
      console.error("Registration failed:", error)
      setUploadError(error instanceof Error ? error.message : "Registration failed")
      setUploadProgress(null)
      setCurrentStep("register")
    }
  }

  if (uploadSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Model Published Successfully!</h2>
        <p className="text-muted-foreground mb-4">
          Your AI model has been uploaded to Walrus and registered on the Sui blockchain.
        </p>
        {transactionHash && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Transaction Digest:</p>
            <code className="text-xs break-all bg-background px-2 py-1 rounded">
              {transactionHash}
            </code>
          </div>
        )}
        <p className="text-sm text-muted-foreground">Redirecting to models page...</p>
      </motion.div>
    )
  }

  if (uploadProgress) {
    const getStepMessage = () => {
      switch (currentStep) {
        case "upload":
          return "Uploading model file to Walrus storage..."
        case "register":
          return "Registering model on Sui blockchain..."
        case "complete":
          return "Upload complete!"
        default:
          return "Processing..."
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Publishing Model</h2>
        <p className="text-muted-foreground mb-4 capitalize">{getStepMessage()}</p>
        <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress?.progress || 0}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">{Math.round(uploadProgress?.progress || 0)}% complete</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Wallet Connection Check */}
      {!isConnected && (
        <Alert variant="destructive">
          <AlertDescription>
            Please connect your wallet to upload models. The connected wallet will be registered as the model owner.
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Model Name *</label>
            <Input
              {...register("name", { required: "Model name is required" })}
              placeholder="e.g., GPT-4 Turbo"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description *</label>
            <Textarea
              {...register("description", { required: "Description is required" })}
              placeholder="Describe your AI model, its capabilities, and use cases..."
              rows={4}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Model File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Model File (.zip) *</label>
            <FileDropzone
              files={modelFile ? [modelFile] : []}
              onFilesChange={handleFileChange}
              accept=".zip"
              maxFiles={1}
              maxSize={10 * 1024 * 1024} // 10MB
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload your model as a single .zip file containing all model assets. Maximum size: 10MB. Upload starts automatically when you select a file.
            </p>
            
            {/* File Upload Status */}
            {modelFile && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{modelFile.name}</span>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(modelFile.size)} • {modelFile.type || "Unknown type"}
                    </p>
                  </div>
                  {isFileUploaded ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : uploadProgress ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : uploadError ? (
                    <X className="w-4 h-4 text-red-500" />
                  ) : null}
                </div>
                {uploadProgress && (
                  <div className="mt-2">
                    <div className="w-full bg-background rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(uploadProgress as { progress: number; stage: string }).progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {(uploadProgress as { progress: number; stage: string }).stage} - {Math.round((uploadProgress as { progress: number; stage: string }).progress)}% complete
                    </p>
                  </div>
                )}
                {isFileUploaded && walrusUploadResult && (
                  <div className="mt-2 text-xs text-green-600">
                    ✓ File uploaded successfully to Walrus
                    <br />
                    Status: {walrusUploadResult.status?.replace("_", " ") || "uploaded"}
                    <br />
                    Blob ID: {walrusUploadResult.blobId}
                    <br />
                    Object ID: {walrusUploadResult.objectId}
                    {walrusUploadResult.cost && (
                      <>
                        <br />
                        Cost: {walrusUploadResult.cost}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !modelFile || !isConnected || !isFileUploaded} size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Publish Model
            </>
          )}
        </Button>
      </div>
    </form>
  )
}