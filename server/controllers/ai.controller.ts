/**
 * AI Controller
 * Handles AI enhancement requests
 */

import { Request, Response } from 'express';
import * as aiService from '../services/ai.service.js';
import { errorResponse, successResponse } from '../utils/response.js';
import { AppError } from '../utils/errors.js';

/**
 * POST /api/ai/enhance/summary
 * Enhance professional summary
 */
export async function enhanceSummary(req: Request, res: Response): Promise<void> {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new AppError('Text is required and cannot be empty', 400);
  }

  if (!aiService.isAIServiceAvailable()) {
    throw new AppError('AI service is currently unavailable. Please check GEMINI_API_KEY configuration.', 503);
  }

  const enhanced = await aiService.enhanceProfessionalSummary(text);

  res.json(
    successResponse({
      original: text,
      enhanced,
    })
  );
}

/**
 * POST /api/ai/enhance/experience
 * Enhance work experience description
 */
export async function enhanceExperience(req: Request, res: Response): Promise<void> {
  try {
    console.log('📝 enhanceExperience called');
    const { role, company, description } = req.body;
    console.log('📝 Request body:', {
      role: role || '(empty)',
      company: company || '(empty)',
      descriptionLength: description?.length || 0,
      descriptionPreview: description?.substring(0, 100) || '(empty)',
    });

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      console.error('❌ Validation failed: description is empty');
      throw new AppError('Description is required and cannot be empty', 400);
    }

    console.log('🔍 Checking AI service availability...');
    const isAvailable = aiService.isAIServiceAvailable();
    console.log('🔍 AI service available:', isAvailable);

    if (!isAvailable) {
      console.error('❌ AI service is not available');
      throw new AppError('AI service is currently unavailable', 503);
    }

    console.log('🚀 Calling enhanceWorkExperience...');
    const enhanced = await aiService.enhanceWorkExperience(
      role || '',
      company || '',
      description
    );
    console.log('✅ Enhancement successful, length:', enhanced?.length);

    res.json(
      successResponse({
        original: description,
        enhanced,
      })
    );
  } catch (error) {
    console.error('❌ Error in enhanceExperience controller:', error);
    if (error instanceof AppError) {
      console.error('   AppError:', error.statusCode, error.message);
      res.status(error.statusCode).json(errorResponse(error.message));
    } else {
      console.error('   Unknown error:', error);
      console.error('   Error type:', typeof error);
      console.error('   Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(500).json(errorResponse('Failed to enhance experience description'));
    }
  }
}

/**
 * POST /api/ai/enhance/project
 * Enhance project description
 */
export async function enhanceProject(req: Request, res: Response): Promise<void> {
  try {
    const { name, description } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw new AppError('Description is required and cannot be empty', 400);
    }

    if (!name || typeof name !== 'string') {
      throw new AppError('Project name is required', 400);
    }

    if (!aiService.isAIServiceAvailable()) {
      throw new AppError('AI service is currently unavailable', 503);
    }

    const enhanced = await aiService.enhanceProjectDescription(name, description);

    res.json(
      successResponse({
        original: description,
        enhanced,
      })
    );
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(errorResponse(error.message));
    } else {
      console.error('Error enhancing project:', error);
      res.status(500).json(errorResponse('Failed to enhance project description'));
    }
  }
}

/**
 * GET /api/ai/health
 * Check AI service health
 */
export async function getHealth(_req: Request, res: Response): Promise<void> {
  try {
    const health = await aiService.healthCheck();
    // Also try to list available models for debugging
    try {
      const models = await aiService.listAvailableModels();
      (health as any).availableModels = models;
    } catch (error) {
      console.warn('Could not list models:', error);
    }
    res.json(successResponse(health));
  } catch (error) {
    console.error('Error checking AI health:', error);
    res.status(500).json(errorResponse('Failed to check AI service health'));
  }
}
