import { JobModel } from '../models/Job';
import { VerificationModel } from '../models/Verification';
import { Job, JobStatus } from '../types';
import { createLogger } from '../utils/logger';
import { NotFoundError } from '../utils/errors';

const logger = createLogger('storageService');

export class StorageService {
  /**
   * Create a new job
   */
  async createJob(job: Partial<Job>): Promise<Job> {
    try {
      const newJob = await JobModel.create(job);
      logger.info({ jobId: newJob.id }, 'Job created in database');
      return newJob.toJSON() as Job;
    } catch (error) {
      logger.error({ error, job }, 'Failed to create job');
      throw error;
    }
  }

  /**
   * Get job by ID
   */
  async getJobById(jobId: string): Promise<Job | null> {
    try {
      const job = await JobModel.findById(jobId);
      return job ? (job.toJSON() as Job) : null;
    } catch (error) {
      logger.error({ error, jobId }, 'Failed to get job');
      throw error;
    }
  }

  /**
   * Get jobs by user
   */
  async getJobsByUser(userId: string, limit: number = 20): Promise<Job[]> {
    try {
      const jobs = await JobModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return jobs.map((job: any) => ({
        ...job,
        id: job._id.toString(),
        _id: undefined,
      })) as Job[];
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get jobs by user');
      throw error;
    }
  }

  /**
   * Get recent jobs
   */
  async getRecentJobs(limit: number = 10): Promise<Job[]> {
    try {
      const jobs = await JobModel.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return jobs.map((job: any) => ({
        ...job,
        id: job._id.toString(),
        _id: undefined,
      })) as Job[];
    } catch (error) {
      logger.error({ error }, 'Failed to get recent jobs');
      throw error;
    }
  }

  /**
   * Update job status
   */
  async updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
    try {
      const job = await JobModel.findByIdAndUpdate(
        jobId,
        { status, updatedAt: new Date() },
        { new: true }
      );

      if (!job) {
        throw new NotFoundError(`Job ${jobId} not found`);
      }

      logger.info({ jobId, status }, 'Job status updated');
      return job.toJSON() as Job;
    } catch (error) {
      logger.error({ error, jobId, status }, 'Failed to update job status');
      throw error;
    }
  }

  /**
   * Update job with results
   */
  async updateJob(jobId: string, updates: Partial<Job>): Promise<Job> {
    try {
      const job = await JobModel.findByIdAndUpdate(
        jobId,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!job) {
        throw new NotFoundError(`Job ${jobId} not found`);
      }

      logger.info({ jobId, updates: Object.keys(updates) }, 'Job updated');
      return job.toJSON() as Job;
    } catch (error) {
      logger.error({ error, jobId }, 'Failed to update job');
      throw error;
    }
  }

  /**
   * Get jobs by status
   */
  async getJobsByStatus(status: JobStatus, limit: number = 50): Promise<Job[]> {
    try {
      const jobs = await JobModel.find({ status })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return jobs.map((job: any) => ({
        ...job,
        id: job._id.toString(),
        _id: undefined,
      })) as Job[];
    } catch (error) {
      logger.error({ error, status }, 'Failed to get jobs by status');
      throw error;
    }
  }

  /**
   * Create verification record
   */
  async createVerification(data: {
    jobId: string;
    txHash: string;
    certificateId?: string;
    verified: boolean;
    verifier: string;
    error?: string;
  }): Promise<void> {
    try {
      await VerificationModel.create(data);
      logger.info({ jobId: data.jobId, txHash: data.txHash }, 'Verification record created');
    } catch (error) {
      logger.error({ error, data }, 'Failed to create verification record');
      throw error;
    }
  }

  /**
   * Get verification by job ID
   */
  async getVerificationByJobId(jobId: string) {
    try {
      return await VerificationModel.findOne({ jobId });
    } catch (error) {
      logger.error({ error, jobId }, 'Failed to get verification');
      throw error;
    }
  }

  /**
   * Delete old jobs (cleanup)
   */
  async deleteOldJobs(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await JobModel.deleteMany({
        createdAt: { $lt: cutoffDate },
        status: { $in: [JobStatus.COMPLETED, JobStatus.FAILED] },
      });

      logger.info({ deleted: result.deletedCount, daysOld }, 'Old jobs deleted');
      return result.deletedCount || 0;
    } catch (error) {
      logger.error({ error }, 'Failed to delete old jobs');
      throw error;
    }
  }
}

export default new StorageService();
