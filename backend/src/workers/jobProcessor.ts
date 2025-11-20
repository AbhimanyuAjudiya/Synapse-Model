import { Worker, Job as BullJob } from 'bullmq';
import { QueueJob } from '../types';
import { createLogger } from '../utils/logger';
import redis from '../config/redis';
import storageService from '../services/storageService';
import teeService from '../services/teeService';
import suiService from '../services/suiService';
import { computeInputHash } from '../utils/helpers';
import { JobStatus } from '../types';

const logger = createLogger('jobProcessor');

const QUEUE_NAME = process.env.JOB_QUEUE_NAME || 'synapsemodel-jobs';

export class JobProcessor {
  private worker: Worker<QueueJob>;

  constructor() {
    this.worker = new Worker<QueueJob>(
      QUEUE_NAME,
      async (job: BullJob<QueueJob>) => {
        return await this.processJob(job);
      },
      {
        connection: redis as any,
        concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
        limiter: {
          max: parseInt(process.env.WORKER_MAX_JOBS_PER_INTERVAL || '10', 10),
          duration: parseInt(process.env.WORKER_INTERVAL_MS || '1000', 10),
        },
      }
    );

    // Worker event listeners
    this.worker.on('completed', (job: BullJob<QueueJob>) => {
      logger.info({ jobId: job.data.jobId }, 'Job completed successfully');
    });

    this.worker.on('failed', (job: BullJob<QueueJob> | undefined, error: Error) => {
      if (job) {
        logger.error(
          { jobId: job.data.jobId, error },
          'Job failed'
        );
      } else {
        logger.error({ error }, 'Job failed without job data');
      }
    });

    this.worker.on('error', (error: Error) => {
      logger.error({ error }, 'Worker error');
    });

    logger.info({ queueName: QUEUE_NAME }, 'Job processor worker started');
  }

  /**
   * Process a job
   */
  private async processJob(job: BullJob<QueueJob>): Promise<void> {
    const { jobId, modelId, inputData, userId } = job.data;

    try {
      logger.info({ jobId, modelId }, 'Processing job');

      // Update status to processing
      await storageService.updateJobStatus(jobId, JobStatus.PROCESSING);

      // Compute input hash
      const inputHash = computeInputHash(inputData);

      // Process inference on TEE
      const teeResponse = await teeService.processInference({
        jobId,
        modelId,
        inputData,
        timestamp: Date.now(),
      });

      // Validate TEE response
      if (!teeResponse.success) {
        throw new Error(teeResponse.error || 'TEE processing failed');
      }

      // Update job with TEE result
      await storageService.updateJob(jobId, {
        status: JobStatus.COMPLETED,
        result: teeResponse.result,
        teeSignature: teeResponse.signature,
        attestation: teeResponse.attestation,
        completedAt: new Date(),
      });

      logger.info({ jobId, result: teeResponse.result }, 'Job processing completed');

      // Optionally trigger verification
      if (process.env.AUTO_VERIFY === 'true') {
        await this.triggerVerification(jobId, modelId, teeResponse, inputHash);
      }
    } catch (error: any) {
      logger.error({ error, jobId }, 'Job processing failed');

      // Update job status to failed
      await storageService.updateJob(jobId, {
        status: JobStatus.FAILED,
        error: error.message,
        completedAt: new Date(),
      });

      throw error;
    }
  }

  /**
   * Trigger blockchain verification
   */
  private async triggerVerification(
    jobId: string,
    modelId: string,
    teeResponse: any,
    inputHash: string
  ): Promise<void> {
    try {
      logger.info({ jobId }, 'Triggering blockchain verification');

      // Build verification transaction
      const tx = await suiService.buildVerificationTransaction(
        jobId,
        modelId,
        teeResponse.result,
        inputHash,
        teeResponse.timestamp,
        teeResponse.modelVersion || 'v1',
        teeResponse.inferenceTimeMs || 0,
        teeResponse.signature
      );

      // Note: In production, this would be signed by a backend wallet
      // For now, we just log that verification is ready
      logger.info({ jobId }, 'Verification transaction ready (requires signing)');

      // Update job with verification transaction
      await storageService.updateJob(jobId, {
        verificationReady: true,
        verificationTransaction: tx.serialize(),
      });
    } catch (error) {
      logger.error({ error, jobId }, 'Failed to trigger verification');
      // Don't throw - job completed successfully even if verification failed
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down job processor');
    await this.worker.close();
  }
}

export default new JobProcessor();
