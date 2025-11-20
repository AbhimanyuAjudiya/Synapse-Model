import { Request, Response } from 'express';
import mongoose from 'mongoose';
import redis from '../config/redis';
import teeService from '../services/teeService';
import queueService from '../services/queueService';
import { createLogger } from '../utils/logger';

const logger = createLogger('healthController');

export class HealthController {
  /**
   * Basic health check
   */
  async healthCheck(req: Request, res: Response) {
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    });
  }

  /**
   * Detailed health check
   */
  async detailedHealthCheck(req: Request, res: Response) {
    const checks: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {},
    };

    // Check MongoDB
    try {
      const mongoState = mongoose.connection.readyState;
      checks.services.mongodb = {
        status: mongoState === 1 ? 'healthy' : 'unhealthy',
        state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoState],
      };
    } catch (error: any) {
      checks.services.mongodb = {
        status: 'unhealthy',
        error: error.message,
      };
      checks.status = 'degraded';
    }

    // Check Redis
    try {
      await redis.ping();
      checks.services.redis = {
        status: 'healthy',
      };
    } catch (error: any) {
      checks.services.redis = {
        status: 'unhealthy',
        error: error.message,
      };
      checks.status = 'degraded';
    }

    // Check TEE service
    try {
      const teeHealth = await teeService.healthCheck();
      checks.services.tee = {
        status: teeHealth ? 'healthy' : 'unhealthy',
      };
    } catch (error: any) {
      checks.services.tee = {
        status: 'unhealthy',
        error: error.message,
      };
      checks.status = 'degraded';
    }

    // Check Queue
    try {
      const metrics = await queueService.getMetrics();
      checks.services.queue = {
        status: 'healthy',
        metrics,
      };
    } catch (error: any) {
      checks.services.queue = {
        status: 'unhealthy',
        error: error.message,
      };
      checks.status = 'degraded';
    }

    const statusCode = checks.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({
      success: checks.status !== 'unhealthy',
      data: checks,
    });
  }

  /**
   * Readiness check
   */
  async readinessCheck(req: Request, res: Response) {
    try {
      // Check critical services
      const mongoReady = mongoose.connection.readyState === 1;
      await redis.ping();

      if (!mongoReady) {
        throw new Error('MongoDB not ready');
      }

      res.json({
        success: true,
        status: 'ready',
      });
    } catch (error: any) {
      logger.error({ error }, 'Readiness check failed');
      res.status(503).json({
        success: false,
        status: 'not ready',
        error: error.message,
      });
    }
  }

  /**
   * Liveness check
   */
  async livenessCheck(req: Request, res: Response) {
    res.json({
      success: true,
      status: 'alive',
    });
  }

  /**
   * Get system metrics
   */
  async getMetrics(req: Request, res: Response) {
    try {
      const queueMetrics = await queueService.getMetrics();

      res.json({
        success: true,
        metrics: {
          queue: queueMetrics,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      logger.error({ error }, 'Failed to get metrics');
      res.status(500).json({
        success: false,
        error: 'Failed to get metrics',
      });
    }
  }
}

export default new HealthController();
