/**
 * ImageKit Routes
 */

import express from 'express';
import { uploadProfilePhoto } from '../controllers/imagekit.controller.js';
import { authenticate } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { csrfProtection } from '../middleware/csrfProtection.js';

const router = express.Router();

// Rate limiter for image uploads: 10 uploads per minute per user
const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per window
  message: 'Too many upload requests. Please try again in a minute.',
  useUserId: true, // Use userId (endpoint is behind authenticate middleware)
});

// Upload profile photo (protected route)
// Order matters: csrfProtection → authenticate → rateLimiter → upload handler
router.post('/upload', csrfProtection, authenticate, uploadRateLimiter, uploadProfilePhoto);

export default router;

