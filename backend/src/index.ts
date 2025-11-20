import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { createLogger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import routes from './routes';
import createWorker from './workers/jobProcessor';

// Load environment variables
dotenv.config();

const logger = createLogger('server');

const PORT = parseInt(process.env.PORT || '4000', 10);
const API_VERSION = process.env.API_VERSION || 'v1';

class Server {
  private app: Express;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    // CORS
    const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
    this.app.use(
      cors({
        origin: corsOrigins,
        credentials: process.env.CORS_CREDENTIALS === 'true',
      })
    );

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    this.app.use(rateLimiter);

    // Request logging
    this.app.use((req, res, next) => {
      logger.info({
        method: req.method,
        path: req.path,
        ip: req.ip,
      }, 'Incoming request');
      next();
    });
  }

  private configureRoutes(): void {
    // API routes
    this.app.use(`/api/${API_VERSION}`, routes);
    this.app.use('/api', routes); // Also support without version

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        name: 'SynapseModel Backend',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private configureErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();
      logger.info('Database connected');

      // Start worker
      if (process.env.ENABLE_WORKER !== 'false') {
        createWorker();
        logger.info('Job worker started');
      }

      // Start server
      this.app.listen(PORT, () => {
        logger.info({
          port: PORT,
          env: process.env.NODE_ENV,
          apiVersion: API_VERSION,
        }, 'Server started successfully');

        logger.info(`Server running at http://localhost:${PORT}`);
        logger.info(`API docs available at http://localhost:${PORT}/api`);
      });

      // Graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error({ error }, 'Failed to start server');
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      process.exit(0);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason, promise }, 'Unhandled Rejection');
    });

    process.on('uncaughtException', (error) => {
      logger.error({ error }, 'Uncaught Exception');
      process.exit(1);
    });
  }
}

// Start server
const server = new Server();
server.start();

export default server;
