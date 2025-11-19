import mongoose from 'mongoose';
import { createLogger } from '../utils/logger';

const logger = createLogger('database');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/synapsemodel';
const MONGODB_OPTIONS = process.env.MONGODB_OPTIONS || 'retryWrites=true&w=majority';

export async function connectDatabase(): Promise<void> {
  try {
    const connectionString = `${MONGODB_URI}?${MONGODB_OPTIONS}`;

    await mongoose.connect(connectionString);

    logger.info('MongoDB connected successfully');

    mongoose.connection.on('error', (error) => {
      logger.error({ error }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to connect to MongoDB');
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
}

export { mongoose };
