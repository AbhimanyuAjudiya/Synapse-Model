import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { createLogger } from '../utils/logger';

const logger = createLogger('errorHandler');

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof AppError) {
    logger.error(
      {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
      },
      'Application error'
    );

    res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // Unexpected errors
  logger.error(
    {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    },
    'Unexpected error'
  );

  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
}
