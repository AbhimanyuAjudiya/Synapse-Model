import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';

const API_KEY = process.env.API_KEY;

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'];

  if (!API_KEY) {
    // If no API key is configured, skip auth (development mode)
    next();
    return;
  }

  if (!apiKey || apiKey !== API_KEY) {
    throw new UnauthorizedError('Invalid API key');
  }

  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  // Optional authentication - attach user if available
  const walletAddress = req.headers['x-wallet-address'];

  if (walletAddress) {
    (req as any).user = { address: walletAddress };
  }

  next();
}
