/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

import type { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  getUserById,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = [
  createRateLimiter({
    max: 3, // 3 registrations per hour (stricter than login)
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many registration attempts. Please try again later.',
    useUserId: false, // Use IP for registration endpoint (user not authenticated yet)
  }),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    const user = await registerUser({ email, password, firstName, lastName });

    res.status(201).json(
      successResponse(
        {
          id: user.id,
          email: user.email,
        },
        'User registered successfully. Please check your email for verification.'
      )
    );
  }),
];

/**
 * Login user
 * POST /api/auth/login
 */
export const login = [
  createRateLimiter({ 
    max: 5, 
    windowMs: 15 * 60 * 1000, // 5 attempts per 15 minutes
    useUserId: false, // Use IP for login endpoint (user not authenticated yet)
  }),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    const result = await loginUser({ email, password });

    // Set HttpOnly cookie for token
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json(
      successResponse(
        {
          user: result.user,
          // Token is stored in HttpOnly cookie (secure, not accessible to JavaScript)
          // Returning token in response for debugging/logging purposes only
          token: result.token,
        },
        'Login successful'
      )
    );
  }),
];

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('token');
  res.json(successResponse(null, 'Logout successful'));
});

/**
 * Get current user
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  if (!userId) {
    res.status(401).json({
      success: false,
      error: 'Not authenticated',
    });
    return;
  }

  const user = await getUserById(userId);
  res.json(successResponse(user, 'User retrieved successfully'));
});

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      success: false,
      error: 'Email is required',
    });
    return;
  }

  await requestPasswordReset(email);

  // Always return success (don't reveal if email exists)
  res.json(
    successResponse(
      null,
      'If an account with that email exists, a password reset link has been sent.'
    )
  );
});

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPasswordHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Token and new password are required',
      });
      return;
    }

    await resetPassword(token, newPassword);

    res.json(successResponse(null, 'Password reset successfully'));
  }
);

/**
 * Verify email with token
 * GET /api/auth/verify-email/:token
 */
export const verifyEmailHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Verification token is required',
      });
      return;
    }

    await verifyEmail(token);

    res.json(successResponse(null, 'Email verified successfully'));
  }
);
