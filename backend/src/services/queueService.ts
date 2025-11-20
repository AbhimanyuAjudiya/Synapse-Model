import { Queue, Worker, Job as BullJob } from 'bullmq';
import { QueueJob } from '../types';
import { createLogger } from '../utils/logger';
import redis from '../config/redis';

const logger = createLogger('queueService');

const QUEUE_NAME = process.env.JOB_QUEUE_NAME || 'synapsemodel-jobs';
const RETRY_ATTEMPTS = parseInt(process.env.JOB_RETRY_ATTEMPTS || '3', 10);
const RETRY_DELAY = parseInt(process.env.JOB_RETRY_DELAY || '5000', 10);

export class QueueService {
  private queue: Queue<QueueJob>;

  constructor() {
    this.queue = new Queue<QueueJob>(QUEUE_NAME, {
      connection: redis as any,
      defaultJobOptions: {
        attempts: RETRY_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: RETRY_DELAY,
        },
        removeOnComplete: {
          count: 100,
          age: 24 * 3600, // 24 hours
        },
        removeOnFail: {
          count: 500,
          age: 7 * 24 * 3600, // 7 days
        },
      },
    });

    logger.info({ queueName: QUEUE_NAME }, 'Queue service initialized');

    // Queue event listeners
    this.queue.on('error', (error) => {
      logger.error({ error }, 'Queue error');
    });
  }

  /**
   * Add job to queue
   */
  async enqueueJob(job: QueueJob): Promise<void> {
    try {
      await this.queue.add('process-job', job, {
        jobId: job.jobId,
        priority: 1,
      });

      logger.info({ jobId: job.jobId }, 'Job enqueued');
    } catch (error) {
      logger.error({ error, job }, 'Failed to enqueue job');
      throw error;
    }
  }

  /**
   * Get job status from queue
   */
  async getJobStatus(jobId: string): Promise<string | null> {
    try {
      const job = await this.queue.getJob(jobId);
      if (!job) return null;

      const state = await job.getState();
      return state;
    } catch (error) {
      logger.error({ error, jobId }, 'Failed to get job status');
      return null;
    }
  }

  /**
   * Get queue metrics
   */
  async getMetrics() {
    try {
      const [waiting, active, completed, failed] = await Promise.all([
        this.queue.getWaitingCount(),
        this.queue.getActiveCount(),
        this.queue.getCompletedCount(),
        this.queue.getFailedCount(),
      ]);

      return {
        waiting,
        active,
        completed,
        failed,
        total: waiting + active + completed + failed,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get queue metrics');
      throw error;
    }
  }

  /**
   * Clean old jobs
   */
  async cleanOldJobs(): Promise<void> {
    try {
      await this.queue.clean(24 * 3600 * 1000, 100, 'completed'); // 24 hours
      await this.queue.clean(7 * 24 * 3600 * 1000, 500, 'failed'); // 7 days
      logger.info('Old jobs cleaned from queue');
    } catch (error) {
      logger.error({ error }, 'Failed to clean old jobs');
    }
  }

  /**
   * Pause queue
   */
  async pause(): Promise<void> {
    await this.queue.pause();
    logger.info('Queue paused');
  }

  /**
   * Resume queue
   */
  async resume(): Promise<void> {
    await this.queue.resume();
    logger.info('Queue resumed');
  }

  /**
   * Get queue instance
   */
  getQueue(): Queue<QueueJob> {
    return this.queue;
  }
}

export default new QueueService();
