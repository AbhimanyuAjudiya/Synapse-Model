export type ModelType = "text" | "image" | "audio" | "embedding" | "multimodal"

export type PricingMode = "free" | "hourly" | "custom"

export interface ModelPricing {
  mode: PricingMode
  pricePerHour?: number
}

export interface ModelManifest {
  id: string
  name: string
  about: string
  type: ModelType
  tags: string[]
  thumbnailUrl?: string
  pricing?: ModelPricing
  framework?: "PyTorch" | "TensorFlow" | "ONNX" | "Custom"
  createdAt?: string
  author?: string
  // Blockchain-specific fields
  blobId?: string
  objectId?: string
  uploader?: string
}

export interface PlaygroundSession {
  id: string
  modelId: string
  messages: ChatMessage[]
  settings: SessionSettings
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface SessionSettings {
  temperature: number
  maxTokens: number
  topP: number
}
