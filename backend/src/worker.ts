import { createLogger } from './utils/logger';
import { connectDatabase } from './config/database';
import jobProcessor from './workers/jobProcessor';

const logger = createLogger('worker');

async function startWorker() {
  try {
    logger.info('Starting job processor worker...');

    // Connect to database
    await connectDatabase();

    logger.info('Worker started successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to start worker');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down worker gracefully');
  await jobProcessor.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down worker gracefully');
  await jobProcessor.shutdown();
  process.exit(0);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Promise Rejection');
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception');
  process.exit(1);
});

// Start the worker
startWorker();
