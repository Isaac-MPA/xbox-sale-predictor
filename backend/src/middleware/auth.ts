import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { AppError } from './errorHandler';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedToken;
}

/**
 * Middleware to verify JWT token
 */
export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError(401, 'No token provided');
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as DecodedToken;

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    throw new AppError(401, 'Invalid or expired token');
  }
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError(403, 'Admin access required');
  }
  next();
};

/**
 * Middleware to check if user is moderator or admin
 */
export const isModerator = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'MODERATOR')) {
    throw new AppError(403, 'Moderator access required');
  }
  next();
};
