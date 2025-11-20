import { Router } from 'express';
import jobRoutes from './jobs';
import verificationRoutes from './verification';
import healthController from '../controllers/healthController';

const router = Router();

// Health check routes
router.get('/health', healthController.healthCheck);
router.get('/health/detailed', healthController.detailedHealthCheck);
router.get('/metrics', healthController.getMetrics);

// API routes
router.use('/jobs', jobRoutes);
router.use('/verification', verificationRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'SynapseModel API',
    version: '1.0.0',
    description: 'Backend API for verifiable AI inference',
    endpoints: {
      health: '/api/health',
      jobs: '/api/jobs',
      verification: '/api/verification',
    },
  });
});

export default router;
