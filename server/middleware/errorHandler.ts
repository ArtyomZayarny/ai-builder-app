/**
 * Global error handling middleware
 */

import type { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response.js';
import type { AppError } from '../utils/errors.js';

export const errorHandler = (err: Error | AppError, req: Request, res: Response, _next: NextFunction) => {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json(errorResponse('Validation failed', (err as any).errors));
  }

  // Custom app errors
  if ('isOperational' in err && err.isOperational) {
    const appError = err as AppError;
    return res.status(appError.statusCode).json(
      errorResponse(appError.message, (appError as any).details)
    );
  }

  // Database errors
  const dbError = err as any;
  if (dbError.code === '23505') {
    // Postgres unique violation
    return res.status(409).json(errorResponse('Resource already exists'));
  }

  if (dbError.code === '23503') {
    // Postgres foreign key violation
    return res.status(400).json(errorResponse('Invalid reference'));
  }

  // Default server error
  return res.status(500).json(
    errorResponse(
      process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    )
  );
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(errorResponse(`Route ${req.originalUrl} not found`));
};

