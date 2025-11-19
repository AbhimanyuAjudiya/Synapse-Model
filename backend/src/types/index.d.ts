export enum JobStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  VERIFIED = 'VERIFIED',
}

export interface Job {
  id: string;
  userId: string;
  modelId: string;
  inputData: any;
  inputHash: string;
  status: JobStatus;
  result?: InferenceResult;
  teeSignature?: string;
  enclavePublicKey?: string;
  timestamp?: number;
  createdAt: Date;
  updatedAt: Date;
  verificationTxHash?: string;
  error?: string;
}

export interface InferenceResult {
  prediction?: number | string;
  confidence?: number;
  probabilities?: number[];
  metadata?: {
    modelVersion?: string;
    inferenceTimeMs?: number;
  };
}

export interface JobSubmitRequest {
  modelId: string;
  inputData: any;
  walletAddress?: string;
  timestamp?: number;
}

export interface TEERequest {
  jobId: string;
  modelId: string;
  inputData: any;
}

export interface TEEResponse {
  response: {
    intent: number;
    timestamp_ms: number;
    data: {
      job_id: string;
      model_id: string;
      result: any;
      input_hash: string;
      computation_metadata: {
        timestamp: number;
        model_version: string;
        inference_time_ms: number;
      };
    };
  };
  signature: string;
}

export interface VerificationRequest {
  jobId: string;
  signature: string;
  result: any;
  inputHash: string;
  timestamp: number;
  modelVersion: string;
  inferenceTimeMs: number;
}

export interface VerificationResponse {
  success: boolean;
  verified: boolean;
  txHash?: string;
  certificateId?: string;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QueueJob {
  jobId: string;
  modelId: string;
  inputData: any;
  inputHash: string;
  walletAddress: string;
}
