// Job Types
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
	createdAt: Date | string;
	updatedAt: Date | string;
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

export interface JobSubmitResponse {
	success: boolean;
	job: Job;
}

export interface JobListResponse {
	success: boolean;
	jobs: Job[];
}

// Model Types
export interface Model {
	id: string;
	name: string;
	description: string;
	version: string;
	inputType: 'image' | 'text' | 'json';
	outputType: 'classification' | 'regression' | 'generation';
	enabled: boolean;
}

// Verification Types
export interface VerificationRequest {
	jobId: string;
	signature: string;
	result: any;
	inputHash: string;
	timestamp: number;
}

export interface VerificationResponse {
	success: boolean;
	verified: boolean;
	txHash?: string;
	certificateId?: string;
	error?: string;
}

// TEE Response Types
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

// Sui Wallet Types
export interface SuiWalletState {
	address: string | null;
	connected: boolean;
	connecting: boolean;
	error: string | null;
}

// Certificate Types
export interface TrustCertificate {
	id: string;
	jobId: string;
	modelId: string;
	inputHash: string;
	resultHash: string;
	enclaveId: string;
	timestampMs: number;
	verifiedAt: number;
	verifier: string;
}

// API Response Types
export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}
