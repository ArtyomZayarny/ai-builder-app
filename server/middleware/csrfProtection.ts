/**
 * CSRF Protection Middleware
 * Validates Origin header for cross-origin requests to prevent CSRF attacks
 * 
 * This is especially important when using sameSite: 'none' cookies,
 * as they can be sent with cross-origin requests.
 */

import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors.js';

// Allowed origins from CORS configuration
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ai-builder-app-kappa.vercel.app',
  process.env.CLIENT_URL,
].filter((url): url is string => Boolean(url));

/**
 * CSRF protection middleware
 * Validates that the Origin header matches allowed origins for state-changing requests
 * 
 * This middleware should be used on POST, PUT, PATCH, DELETE requests
 * that require authentication and modify server state.
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  // Only check state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  if (!stateChangingMethods.includes(req.method)) {
    // GET, HEAD, OPTIONS don't need CSRF protection
    return next();
  }

  // Skip CSRF check for same-origin requests (development)
  // In production, all requests are cross-origin, so we always check
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // If no origin or referer, it might be a same-origin request (development)
  // or a direct API call (which we should block in production)
  if (!origin && !referer) {
    // In production, require origin/referer for cross-origin requests
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedError('Origin header required for cross-origin requests');
    }
    // In development, allow same-origin requests without origin header
    return next();
  }

  // Extract origin from referer if origin header is not present
  const requestOrigin = origin || (referer ? new URL(referer).origin : null);

  if (!requestOrigin) {
    throw new UnauthorizedError('Invalid request origin');
  }

  // Check if origin is in allowed list
  const isAllowed = ALLOWED_ORIGINS.some((allowedOrigin) => {
    // Exact match
    if (requestOrigin === allowedOrigin) {
      return true;
    }
    // For localhost, allow any port in development
    if (process.env.NODE_ENV !== 'production' && allowedOrigin.startsWith('http://localhost:')) {
      return requestOrigin.startsWith('http://localhost:');
    }
    return false;
  });

  if (!isAllowed) {
    console.warn(`CSRF protection: Blocked request from unauthorized origin: ${requestOrigin}`);
    throw new UnauthorizedError('Request from unauthorized origin');
  }

  next();
}

