import { Job, JobStatus } from '../types';
import { createLogger } from '../utils/logger';
import { computeInputHash } from '../utils/helpers';
import storageService from './storageService';

const logger = createLogger('jobService');

export class JobService {
  /**
   * Compute input hash
   */
  computeInputHash(inputData: any): string {
    return computeInputHash(inputData);
  }

  /**
   * Validate job input
   */
  validateJobInput(modelId: string, inputData: any): void {
    if (!modelId) {
      throw new Error('Model ID is required');
    }

    if (!inputData) {
      throw new Error('Input data is required');
    }

    // Model-specific validation
    switch (modelId) {
      case 'mnist-classifier':
        this.validateMNISTInput(inputData);
        break;
      case 'sentiment-analysis':
        this.validateSentimentInput(inputData);
        break;
      default:
        // Generic validation
        if (typeof inputData !== 'object') {
          throw new Error('Input data must be an object');
        }
    }
  }

  /**
   * Validate MNIST input
   */
  private validateMNISTInput(inputData: any): void {
    if (!inputData.pixels && !inputData.data) {
      throw new Error('MNIST input must contain pixels or data array');
    }

    const pixels = inputData.pixels || inputData.data;
    if (!Array.isArray(pixels)) {
      throw new Error('Pixels must be an array');
    }

    if (pixels.length !== 784) {
      throw new Error('MNIST input must contain exactly 784 pixels (28x28)');
    }

    // Validate pixel values are in valid range
    const allValid = pixels.every((p: number) => p >= 0 && p <= 255);
    if (!allValid) {
      throw new Error('Pixel values must be between 0 and 255');
    }
  }

  /**
   * Validate sentiment analysis input
   */
  private validateSentimentInput(inputData: any): void {
    if (!inputData.text) {
      throw new Error('Sentiment analysis input must contain text');
    }

    if (typeof inputData.text !== 'string') {
      throw new Error('Text must be a string');
    }

    if (inputData.text.length === 0) {
      throw new Error('Text cannot be empty');
    }

    if (inputData.text.length > 5000) {
      throw new Error('Text is too long (max 5000 characters)');
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats(userId?: string) {
    try {
      const jobs = await storageService.getRecentJobs(1000);

      const stats = {
        total: jobs.length,
        pending: jobs.filter((j) => j.status === JobStatus.PENDING).length,
        queued: jobs.filter((j) => j.status === JobStatus.QUEUED).length,
        processing: jobs.filter((j) => j.status === JobStatus.PROCESSING).length,
        completed: jobs.filter((j) => j.status === JobStatus.COMPLETED).length,
        failed: jobs.filter((j) => j.status === JobStatus.FAILED).length,
        verified: jobs.filter((j) => j.status === JobStatus.VERIFIED).length,
      };

      return stats;
    } catch (error) {
      logger.error({ error }, 'Failed to get job stats');
      throw error;
    }
  }
}

export default new JobService();
