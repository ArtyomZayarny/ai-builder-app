/**
 * Zod validation middleware
 */

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors.js';

export const validate = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    // For personal-info updates, preserve photoUrl if validation fails
    const originalPhotoUrl = req.path.includes('personal-info') ? req.body.photoUrl : undefined;
    
    const validated = schema.parse(req.body);
    
    // If photoUrl was removed during validation, restore it
    if (req.path.includes('personal-info') && originalPhotoUrl !== undefined && validated.photoUrl === undefined) {
      (validated as any).photoUrl = originalPhotoUrl;
    }
    
    req.body = validated; // Replace with validated data
    next();
  } catch (error: any) {
    if (error.name === 'ZodError') {
      console.error('Validation error:', error.errors);
      next(new ValidationError('Validation failed', error.errors));
    } else {
      next(error);
    }
  }
};

// Validate params (e.g., ID in URL)
export const validateParams = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    const validated = schema.parse(req.params);
    // Type assertion needed here
    Object.assign(req.params, validated);
    next();
  } catch (error: any) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Invalid parameters', error.errors));
    } else {
      next(error);
    }
  }
};

