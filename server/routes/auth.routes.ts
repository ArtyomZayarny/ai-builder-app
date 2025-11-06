/**
 * Authentication Routes
 */

import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPasswordHandler,
  verifyEmailHandler,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordHandler);
router.get('/verify-email/:token', verifyEmailHandler);

// Protected routes
router.get('/me', authenticate, getMe);

export default router;

