/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service.js';
import { UnauthorizedError } from '../utils/errors.js';
import { asyncHandler } from './asyncHandler.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
      };
    }
  }
}

/**
 * Authentication middleware - requires valid JWT token
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // Try to get token from Authorization header
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Also check cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    try {
      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
      next();
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
);

/**
 * Optional authentication middleware
 * Attaches user if token exists, but doesn't require it
 */
export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
        };
      } catch {
        // Invalid token, continue without authentication
      }
    }

    next();
  }
);

