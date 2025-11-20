import { Router } from 'express';
import jobController from '../controllers/jobController';
import { jobSubmitValidation, jobIdValidation } from '../middleware/validation';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/jobs
 * @desc    Submit a new inference job
 * @access  Public
 */
router.post('/', jobSubmitValidation, jobController.submitJob);

/**
 * @route   GET /api/jobs
 * @desc    Get jobs list (optionally filtered by user)
 * @access  Public
 * @query   userId - User wallet address (optional)
 * @query   limit - Number of jobs to return (default: 20)
 */
router.get('/', optionalAuth, jobController.getJobs);

/**
 * @route   GET /api/jobs/stats
 * @desc    Get job statistics
 * @access  Public
 * @query   userId - User wallet address (optional)
 */
router.get('/stats', jobController.getStats);

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job by ID
 * @access  Public
 */
router.get('/:id', jobIdValidation, jobController.getJob);

/**
 * @route   POST /api/jobs/:id/process
 * @desc    Manually trigger job processing
 * @access  Public (should be protected in production)
 */
router.post('/:id/process', jobIdValidation, jobController.processJob);

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Cancel a pending job
 * @access  Public
 */
router.delete('/:id', jobIdValidation, jobController.cancelJob);

export default router;
