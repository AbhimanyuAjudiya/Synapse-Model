import pino from 'pino';
import path from 'path';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'UTC:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.GIT_COMMIT || 'unknown',
  },
});

// Create child loggers for different modules
export const createLogger = (module: string) => {
  return logger.child({ module });
};

// Log file stream (optional)
if (process.env.LOG_FILE_PATH) {
  const logFilePath = path.resolve(process.cwd(), process.env.LOG_FILE_PATH);
  logger.info(`Logging to file: ${logFilePath}`);
}

export default logger;
