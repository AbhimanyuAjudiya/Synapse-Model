import axios, { AxiosInstance } from 'axios';
import { TEERequest, TEEResponse } from '../types';
import { createLogger } from '../utils/logger';
import { TEEError } from '../utils/errors';
import { retry } from '../utils/helpers';

const logger = createLogger('teeService');

const TEE_SERVER_URL = process.env.TEE_SERVER_URL || 'http://localhost:3000';
const TEE_SERVER_TIMEOUT = parseInt(process.env.TEE_SERVER_TIMEOUT || '30000', 10);

export class TEEService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: TEE_SERVER_URL,
      timeout: TEE_SERVER_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info({ url: TEE_SERVER_URL }, 'TEE service initialized');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health_check');
      return response.status === 200;
    } catch (error) {
      logger.error({ error }, 'TEE health check failed');
      return false;
    }
  }

  /**
   * Get attestation from TEE
   */
  async getAttestation(): Promise<string> {
    try {
      const response = await this.client.get('/get_attestation');
      return response.data.attestation;
    } catch (error) {
      logger.error({ error }, 'Failed to get attestation');
      throw new TEEError('Failed to get attestation from TEE');
    }
  }

  /**
   * Get enclave public key
   */
  async getPublicKey(): Promise<string> {
    try {
      const response = await this.client.get('/get_pk');
      return response.data.public_key;
    } catch (error) {
      logger.error({ error }, 'Failed to get public key');
      throw new TEEError('Failed to get public key from TEE');
    }
  }

  /**
   * Process inference in TEE
   */
  async processInference(request: TEERequest): Promise<TEEResponse> {
    try {
      logger.info({ jobId: request.jobId, modelId: request.modelId }, 'Sending job to TEE');

      const response = await retry(
        async () => {
          return await this.client.post<TEEResponse>('/process_data', {
            payload: {
              job_id: request.jobId,
              model_id: request.modelId,
              input_data: request.inputData,
            },
          });
        },
        3,
        2000
      );

      if (!response.data || !response.data.signature) {
        throw new TEEError('Invalid response from TEE - missing signature');
      }

      logger.info(
        { jobId: request.jobId, hasSignature: !!response.data.signature },
        'Received TEE response'
      );

      return {
        ...response.data,
        enclavePublicKey: await this.getPublicKey(),
      } as any;
    } catch (error) {
      logger.error({ error, request }, 'Failed to process inference in TEE');

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new TEEError('TEE server is not reachable');
        }
        if (error.code === 'ETIMEDOUT') {
          throw new TEEError('TEE request timed out');
        }
        throw new TEEError(error.response?.data?.error || 'TEE request failed');
      }

      throw new TEEError('Unexpected error during TEE processing');
    }
  }

  /**
   * Verify TEE server is ready
   */
  async isReady(): Promise<boolean> {
    try {
      const [healthOk, hasAttestation] = await Promise.all([
        this.healthCheck(),
        this.getAttestation().then(() => true).catch(() => false),
      ]);

      return healthOk && hasAttestation;
    } catch (error) {
      logger.error({ error }, 'TEE readiness check failed');
      return false;
    }
  }
}

export default new TEEService();
