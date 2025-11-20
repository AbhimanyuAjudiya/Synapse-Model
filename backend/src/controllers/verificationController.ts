import { Request, Response, NextFunction } from 'express';
import SuiService from '../services/suiService';
import StorageService from '../services/storageService';
import { VerificationRequest, JobStatus } from '../types';
import { createLogger } from '../utils/logger';
import { ValidationError, NotFoundError, BlockchainError } from '../utils/errors';

const logger = createLogger('verificationController');

class VerificationController {
  /**
   * Verify job on-chain and issue certificate
   * POST /api/verification/verify
   */
  async verifyJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const verificationRequest: VerificationRequest = req.body;

      // Validate request
      if (!verificationRequest.jobId) {
        throw new ValidationError('Job ID is required');
      }

      // Fetch job
      const job = await StorageService.getJobById(verificationRequest.jobId);
      if (!job) {
        throw new NotFoundError(`Job ${verificationRequest.jobId} not found`);
      }

      // Verify job is completed
      if (job.status !== JobStatus.COMPLETED) {
        throw new ValidationError(`Job must be completed before verification. Current status: ${job.status}`);
      }

      // Check if already verified
      if (job.verificationTxHash) {
        res.status(200).json({
          success: true,
          verified: true,
          message: 'Job already verified',
          txHash: job.verificationTxHash,
        });
        return;
      }

      // Ensure we have signature and result
      if (!job.teeSignature || !job.result) {
        throw new ValidationError('Job is missing TEE signature or result');
      }

      // Build verification transaction
      const tx = await SuiService.buildVerificationTransaction(
        job.id,
        job.modelId,
        job.result,
        job.inputHash,
        job.timestamp || Date.now(),
        job.result.metadata?.modelVersion || 'v1.0.0',
        job.result.metadata?.inferenceTimeMs || 0,
        job.teeSignature
      );

      logger.info({ jobId: job.id }, 'Verification transaction built - ready for signing');

      // Note: In production, the frontend should sign and execute this transaction
      // For now, we return the transaction for the frontend to sign

      res.status(200).json({
        success: true,
        message: 'Verification transaction prepared',
        transaction: {
          jobId: job.id,
          // Transaction data that frontend can use
          data: {
            packageId: process.env.SUI_PACKAGE_ID,
            enclaveId: process.env.SUI_ENCLAVE_ID,
            configId: process.env.SUI_ENCLAVE_CONFIG_ID,
            jobId: job.id,
            modelId: job.modelId,
            result: job.result,
            inputHash: job.inputHash,
            timestamp: job.timestamp,
            signature: job.teeSignature,
          },
        },
      });
    } catch (error) {
      logger.error({ error }, 'Verification failed');
      next(error);
    }
  }

  /**
   * Update job with verification transaction hash
   * POST /api/verification/update
   */
  async updateVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId, txHash, certificateId } = req.body;

      if (!jobId || !txHash) {
        throw new ValidationError('Job ID and transaction hash are required');
      }

      // Fetch job
      const job = await StorageService.getJobById(jobId);
      if (!job) {
        throw new NotFoundError(`Job ${jobId} not found`);
      }

      // Wait for transaction confirmation
      logger.info({ txHash, jobId }, 'Waiting for transaction confirmation');
      const txResult = await SuiService.waitForTransaction(txHash, 30000);

      if (txResult.effects?.status?.status !== 'success') {
        throw new BlockchainError('Verification transaction failed');
      }

      // Parse certificate from events
      const certificate = SuiService.parseCertificateFromEvents(txResult.events || []);

      // Update job
      await StorageService.updateJob(jobId, {
        status: JobStatus.VERIFIED,
        verificationTxHash: txHash,
      });

      // Create verification record
      await StorageService.createVerification({
        jobId,
        txHash,
        certificateId: certificateId || certificate?.certificate_id,
        verified: true,
        verifier: job.userId,
      });

      logger.info({ jobId, txHash }, 'Job verified successfully');

      res.status(200).json({
        success: true,
        verified: true,
        txHash,
        certificateId: certificateId || certificate?.certificate_id,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to update verification');
      next(error);
    }
  }

  /**
   * Get verification status for a job
   * GET /api/verification/status/:jobId
   */
  async getVerificationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;

      const job = await StorageService.getJobById(jobId);
      if (!job) {
        throw new NotFoundError(`Job ${jobId} not found`);
      }

      const verification = await StorageService.getVerificationByJobId(jobId);

      res.status(200).json({
        success: true,
        verified: !!job.verificationTxHash,
        status: job.status,
        verificationTxHash: job.verificationTxHash,
        verification: verification || null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transaction details
   * GET /api/verification/transaction/:txHash
   */
  async getTransactionDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { txHash } = req.params;

      const txDetails = await SuiService.getTransactionStatus(txHash);

      res.status(200).json({
        success: true,
        transaction: txDetails,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new VerificationController();
