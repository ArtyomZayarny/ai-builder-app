import { sendError } from '../utils/response.js';

/**
 * Authentication middleware (placeholder)
 * TODO: Implement actual JWT verification
 */
export const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'No token provided');
    }

    const _token = authHeader.split(' ')[1];

    // TODO: Verify JWT token
    // For now, just set a placeholder user
    req.user = {
      id: 1,
      email: 'placeholder@example.com',
    };

    next();
  } catch (error) {
    sendError(res, 401, 'Invalid token', error.message);
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token exists, but doesn't require it
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const _token = authHeader.split(' ')[1];

      // TODO: Verify JWT token
      req.user = {
        id: 1,
        email: 'placeholder@example.com',
      };
    }

    next();
  } catch {
    // Continue without authentication
    next();
  }
};
