/**
 * Security Headers Middleware
 * Configures security headers for all responses
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Set security headers on all responses
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // XSS Protection (legacy, but still useful)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Permissions Policy (formerly Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  next();
}

