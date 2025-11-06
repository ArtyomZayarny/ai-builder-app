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
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new AppError('Text is required and cannot be empty', 400);
    }

    if (!aiService.isAIServiceAvailable()) {
      throw new AppError('AI service is currently unavailable', 503);
    }

    const enhanced = await aiService.enhanceProfessionalSummary(text);

    res.json(
      successResponse({
        original: text,
        enhanced,
      }),
    );
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(errorResponse(error.message));
    } else {
      console.error('Error enhancing summary:', error);
      res.status(500).json(errorResponse('Failed to enhance summary'));
    }
  }
}

/**
 * POST /api/ai/enhance/experience
 * Enhance work experience description
 */
export async function enhanceExperience(req: Request, res: Response): Promise<void> {
  try {
    const { role, company, description } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw new AppError('Description is required and cannot be empty', 400);
    }

    if (!role || typeof role !== 'string') {
      throw new AppError('Role is required', 400);
    }

    if (!company || typeof company !== 'string') {
      throw new AppError('Company is required', 400);
    }

    if (!aiService.isAIServiceAvailable()) {
      throw new AppError('AI service is currently unavailable', 503);
    }

    const enhanced = await aiService.enhanceWorkExperience(role, company, description);

    res.json(
      successResponse({
        original: description,
        enhanced,
      }),
    );
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(errorResponse(error.message));
    } else {
      console.error('Error enhancing experience:', error);
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
      }),
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
    res.json(successResponse(health));
  } catch (error) {
    console.error('Error checking AI health:', error);
    res.status(500).json(errorResponse('Failed to check AI service health'));
  }
}

