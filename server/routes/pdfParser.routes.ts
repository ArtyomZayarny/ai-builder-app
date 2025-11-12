/**
 * PDF Parser Routes
 */

import express from 'express';
import { parsePDF } from '../controllers/pdfParser.controller.js';
import { authenticate } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Rate limiter for PDF parsing: 5 uploads per hour per user
// PDF parsing is resource-intensive, so we limit it more strictly
const pdfParseRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 PDFs per hour
  message: 'Too many PDF upload requests. Please try again in an hour.',
  useUserId: true, // Use userId (endpoint is behind authenticate middleware)
});

// Parse PDF resume (protected route)
// Order matters: authenticate → rateLimiter → parse handler
router.post('/parse', authenticate, pdfParseRateLimiter, parsePDF);

export default router;

