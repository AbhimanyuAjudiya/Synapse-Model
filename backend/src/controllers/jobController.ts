import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import JobService from '../services/jobService';
import QueueService from '../services/queueService';
import TEEService from '../services/teeService';
import StorageService from '../services/storageService';
import { JobStatus, JobSubmitRequest, Job } from '../types';
import { createLogger } from '../utils/logger';
import { ValidationError, NotFoundError } from '../utils/errors';

const logger = createLogger('jobController');

class JobController {
  /**
   * Submit a new job for processing
   * POST /api/jobs
   */
  async submitJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jobRequest: JobSubmitRequest = req.body;

      // Validate input
      if (!jobRequest.modelId || !jobRequest.inputData) {
        throw new ValidationError('Missing required fields: modelId, inputData');
      }

      if (!jobRequest.walletAddress) {
        throw new ValidationError('Wallet address required');
      }

      // Validate job input based on model
      JobService.validateJobInput(jobRequest.modelId, jobRequest.inputData);

      // Generate job ID
      const jobId = uuidv4();

      // Compute input hash for verification
      const inputHash = JobService.computeInputHash(jobRequest.inputData);

      // Create job record
      const job = await StorageService.createJob({
        id: jobId,
        userId: jobRequest.walletAddress,
        modelId: jobRequest.modelId,
        inputData: jobRequest.inputData,
        inputHash,
        status: JobStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Enqueue job for processing
      await QueueService.enqueueJob({
        jobId,
        modelId: job.modelId,
        inputData: job.inputData,
        inputHash,
        walletAddress: job.userId,
      });

      // Update status to queued
      await StorageService.updateJobStatus(jobId, JobStatus.QUEUED);

      logger.info(
        {
          jobId,
          userId: job.userId,
          modelId: job.modelId,
        },
        'Job submitted and enqueued'
      );

      res.status(201).json({
        success: true,
        job: {
          id: job.id,
          status: JobStatus.QUEUED,
          inputHash: job.inputHash,
          modelId: job.modelId,
          createdAt: job.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get job status and results
   * GET /api/jobs/:id
   */
  async getJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Fetch job from storage
      const job = await StorageService.getJobById(id);

      if (!job) {
        throw new NotFoundError(`Job ${id} not found`);
      }

      // Return job data including proof if completed
      res.status(200).json({
        success: true,
        job: {
          id: job.id,
          status: job.status,
          modelId: job.modelId,
          inputHash: job.inputHash,
          result: job.result,
          teeSignature: job.teeSignature,
          enclavePublicKey: job.enclavePublicKey,
          timestamp: job.timestamp,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          verificationTxHash: job.verificationTxHash,
          error: job.error,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent jobs for a user
   * GET /api/jobs?userId=<address>&limit=<number>
   */
  async getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, limit = '20' } = req.query;

      let jobs: Job[];

      if (userId) {
        jobs = await StorageService.getJobsByUser(
          userId as string,
          parseInt(limit as string, 10)
        );
      } else {
        jobs = await StorageService.getRecentJobs(parseInt(limit as string, 10));
      }

      res.status(200).json({
        success: true,
        jobs: jobs.map((job) => ({
          id: job.id,
          status: job.status,
          modelId: job.modelId,
          inputHash: job.inputHash,
          createdAt: job.createdAt,
          hasProof: !!job.teeSignature,
          isVerified: !!job.verificationTxHash,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manually trigger job processing (for testing/admin)
   * POST /api/jobs/:id/process
   */
  async processJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Fetch job
      const job = await StorageService.getJobById(id);
      if (!job) {
        throw new NotFoundError(`Job ${id} not found`);
      }

      // Check if already processed
      if (job.status === JobStatus.COMPLETED || job.status === JobStatus.VERIFIED) {
        res.status(200).json({
          success: true,
          message: 'Job already processed',
          job: {
            id: job.id,
            status: job.status,
            result: job.result,
          },
        });
        return;
      }

      // Update status to processing
      await StorageService.updateJobStatus(id, JobStatus.PROCESSING);

      // Send to TEE server for inference
      const teeResponse = await TEEService.processInference({
        jobId: job.id,
        modelId: job.modelId,
        inputData: job.inputData,
      });

      // Update job with results
      const updatedJob = await StorageService.updateJob(id, {
        status: JobStatus.COMPLETED,
        result: teeResponse.response.data.result,
        teeSignature: teeResponse.signature,
        enclavePublicKey: teeResponse.enclavePublicKey,
        timestamp: teeResponse.response.timestamp_ms,
        updatedAt: new Date(),
      });

      logger.info(
        {
          jobId: id,
          hasSignature: !!teeResponse.signature,
        },
        'Job processed successfully'
      );

      res.status(200).json({
        success: true,
        job: {
          id: updatedJob.id,
          status: updatedJob.status,
          result: updatedJob.result,
          signature: updatedJob.teeSignature,
          timestamp: updatedJob.timestamp,
        },
      });
    } catch (error) {
      logger.error({ error, jobId: req.params.id }, 'Failed to process job');

      // Update job status to failed
      try {
        await StorageService.updateJob(req.params.id, {
          status: JobStatus.FAILED,
          error: error instanceof Error ? error.message : 'Processing failed',
        });
      } catch (updateError) {
        logger.error({ error: updateError }, 'Failed to update job status');
      }

      next(error);
    }
  }

  /**
   * Get job statistics
   * GET /api/jobs/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.query;

      const stats = await JobService.getJobStats(userId as string | undefined);

      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel a pending job
   * DELETE /api/jobs/:id
   */
  async cancelJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const job = await StorageService.getJobById(id);
      if (!job) {
        throw new NotFoundError(`Job ${id} not found`);
      }

      // Only allow cancellation of pending/queued jobs
      if (job.status !== JobStatus.PENDING && job.status !== JobStatus.QUEUED) {
        throw new ValidationError(`Cannot cancel job in ${job.status} status`);
      }

      await StorageService.updateJob(id, {
        status: JobStatus.FAILED,
        error: 'Cancelled by user',
      });

      logger.info({ jobId: id }, 'Job cancelled');

      res.status(200).json({
        success: true,
        message: 'Job cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new JobController();
