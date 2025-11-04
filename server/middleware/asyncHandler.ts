/**
 * Wrapper to catch async errors and pass to error handler
 */

import type { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | Promise<any>;

export const asyncHandler =
  (fn: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

