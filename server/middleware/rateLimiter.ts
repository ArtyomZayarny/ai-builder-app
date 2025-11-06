/**
 * Rate Limiter Middleware
 * Simple in-memory rate limiting for API endpoints
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string; // Custom error message
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Format: { [identifier]: { count: number, resetTime: number } }
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries every 5 minutes
 */
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

/**
 * Create a rate limiter middleware
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests, please try again later.' } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Use IP address as identifier (in production, you might use user ID)
    const identifier = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(identifier);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(identifier, entry);
    }

    // Increment request count
    entry.count++;

    // Set rate limit headers
    const remaining = Math.max(0, max - entry.count);
    const resetTime = Math.ceil((entry.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetTime.toString());

    // Check if limit exceeded
    if (entry.count > max) {
      res.setHeader('Retry-After', resetTime.toString());
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: resetTime,
      });
      return;
    }

    next();
  };
}
