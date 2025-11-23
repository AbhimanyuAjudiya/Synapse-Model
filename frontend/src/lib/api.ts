import axios, { AxiosInstance, AxiosError } from 'axios';
import {
	Job,
	JobSubmitRequest,
	JobSubmitResponse,
	JobListResponse,
	VerificationRequest,
	VerificationResponse,
	ApiResponse,
} from '@/types';
import { API_BASE_URL } from './constants';

class ApiClient {
	private client: AxiosInstance;

	constructor() {
		this.client = axios.create({
			baseURL: API_BASE_URL,
			timeout: 30000,
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// Request interceptor
		this.client.interceptors.request.use(
			(config) => {
				// Add auth token if available
				const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		// Response interceptor
		this.client.interceptors.response.use(
			(response) => response,
			(error: AxiosError) => {
				console.error('API Error:', error.response?.data || error.message);
				return Promise.reject(error);
			}
		);
	}

	// Health check
	async healthCheck(): Promise<boolean> {
		try {
			const response = await this.client.get('/health');
			return response.status === 200;
		} catch (error) {
			return false;
		}
	}

	// Submit new job
	async submitJob(jobRequest: JobSubmitRequest): Promise<Job> {
		const response = await this.client.post<JobSubmitResponse>('/api/jobs', jobRequest);
		return response.data.job;
	}

	// Get job by ID
	async getJob(jobId: string): Promise<Job> {
		const response = await this.client.get<ApiResponse<{ job: Job }>>(`/api/jobs/${jobId}`);
		if (!response.data.success) {
			throw new Error(response.data.error || 'Failed to fetch job');
		}
		return response.data.data!.job;
	}

	// Get jobs list (optionally filtered by user)
	async getJobs(userId?: string, limit: number = 20): Promise<Job[]> {
		const params: Record<string, string | number> = { limit };
		if (userId) {
			params.userId = userId;
		}

		const response = await this.client.get<JobListResponse>('/api/jobs', { params });
		return response.data.jobs;
	}

	// Get recent jobs
	async getRecentJobs(limit: number = 10): Promise<Job[]> {
		const response = await this.client.get<JobListResponse>('/api/jobs', {
			params: { limit },
		});
		return response.data.jobs;
	}

	// Trigger job processing (for testing)
	async processJob(jobId: string): Promise<Job> {
		const response = await this.client.post<ApiResponse<{ job: Job }>>(
			`/api/jobs/${jobId}/process`
		);
		if (!response.data.success) {
			throw new Error(response.data.error || 'Failed to process job');
		}
		return response.data.data!.job;
	}

	// Verify job on-chain
	async verifyJob(verificationRequest: VerificationRequest): Promise<VerificationResponse> {
		const response = await this.client.post<VerificationResponse>(
			'/api/verification/verify',
			verificationRequest
		);
		return response.data;
	}

	// Get verification status
	async getVerificationStatus(jobId: string): Promise<ApiResponse> {
		const response = await this.client.get<ApiResponse>(
			`/api/verification/status/${jobId}`
		);
		return response.data;
	}
}

// Export singleton instance
export const api = new ApiClient();

// Export helper functions
export const submitJob = (request: JobSubmitRequest) => api.submitJob(request);
export const getJob = (jobId: string) => api.getJob(jobId);
export const getJobs = (userId?: string, limit?: number) => api.getJobs(userId, limit);
export const getRecentJobs = (limit?: number) => api.getRecentJobs(limit ?? 10);
export const processJob = (jobId: string) => api.processJob(jobId);
export const verifyJob = (request: VerificationRequest) => api.verifyJob(request);
export const getVerificationStatus = (jobId: string) => api.getVerificationStatus(jobId);
