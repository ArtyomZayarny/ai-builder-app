/**
 * AI Routes
 * API endpoints for AI-powered content enhancement
 */

import express from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Rate limiter: 10 requests per minute per user
const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per window
  message: 'Too many AI enhancement requests. Please try again in a minute.',
});

/**
 * @route   POST /api/ai/enhance/summary
 * @desc    Enhance professional summary
 * @access  Public
 */
router.post('/enhance/summary', aiRateLimiter, asyncHandler(aiController.enhanceSummary));

/**
 * @route   POST /api/ai/enhance/experience
 * @desc    Enhance work experience description
 * @access  Public
 */
router.post('/enhance/experience', aiRateLimiter, asyncHandler(aiController.enhanceExperience));

/**
 * @route   POST /api/ai/enhance/project
 * @desc    Enhance project description
 * @access  Public
 */
router.post('/enhance/project', aiRateLimiter, asyncHandler(aiController.enhanceProject));

/**
 * @route   GET /api/ai/health
 * @desc    Check AI service health
 * @access  Public
 */
router.get('/health', asyncHandler(aiController.getHealth));

export default router;

