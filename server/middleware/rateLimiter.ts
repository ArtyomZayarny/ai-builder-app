/**
 * Rate Limiter Middleware
 * Simple in-memory rate limiting for API endpoints
 * Uses userId for authenticated users, IP for anonymous users
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string; // Custom error message
  useUserId?: boolean; // If true, use userId (requires authenticate middleware). If false, use IP (for public endpoints)
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
 * For authenticated endpoints: uses userId (requires authenticate middleware)
 * For public endpoints: uses IP address
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    useUserId = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Determine identifier based on configuration
    let identifier: string;

    if (useUserId && req.user?.userId) {
      // For protected endpoints: use userId (authenticate middleware already verified user)
      identifier = `user:${req.user.userId}`;
    } else {
      // For public endpoints: use IP address
      // req.ip is set by Express trust proxy setting
      identifier = `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
    }

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
