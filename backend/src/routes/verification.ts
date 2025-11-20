import { Router } from 'express';
import verificationController from '../controllers/verificationController';
import { verificationValidation } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/verification/verify
 * @desc    Verify job on-chain and issue certificate
 * @access  Public
 */
router.post('/verify', verificationValidation, verificationController.verifyJob);

/**
 * @route   POST /api/verification/update
 * @desc    Update verification status with transaction hash
 * @access  Public
 */
router.post('/update', verificationController.updateVerification);

/**
 * @route   GET /api/verification/status/:jobId
 * @desc    Get verification status for a job
 * @access  Public
 */
router.get('/status/:jobId', verificationController.getVerificationStatus);

/**
 * @route   GET /api/verification/transaction/:txHash
 * @desc    Get transaction details
 * @access  Public
 */
router.get('/transaction/:txHash', verificationController.getTransactionDetails);

export default router;
