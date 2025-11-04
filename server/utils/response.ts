/**
 * Consistent API response helpers
 */

import type { Response } from 'express';

interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export const successResponse = <T = any>(data: T, message = 'Success'): SuccessResponse<T> => ({
  success: true,
  data,
  message,
});

export const errorResponse = (message: string, details: any = null): ErrorResponse => ({
  success: false,
  error: message,
  ...(details && { details }),
});

// Legacy helpers for backward compatibility
export const sendSuccess = <T = any>(
  res: Response,
  status = 200,
  data: T,
  message = 'Success'
): void => {
  res.status(status).json(successResponse(data, message));
};

export const sendError = (
  res: Response,
  status = 500,
  message: string,
  details: any = null
): void => {
  res.status(status).json(errorResponse(message, details));
};

