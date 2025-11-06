/**
 * File Upload Validation Middleware
 * Validates file uploads for type, size, and malicious content
 */

import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf', // For future PDF uploads
];

/**
 * Validate uploaded file
 */
export function validateFileUpload(req: Request, _res: Response, next: NextFunction): void {
  const file = req.file;

  if (!file) {
    return next();
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return next(new ValidationError(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`));
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return next(new ValidationError(`File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }

  // Basic file extension check (additional layer of security)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(fileExtension)) {
    return next(new ValidationError(`File extension ${fileExtension} is not allowed`));
  }

  // Check for suspicious file names (basic check)
  const suspiciousPatterns = /[<>:"|?*\x00-\x1f]/;
  if (suspiciousPatterns.test(file.originalname)) {
    return next(new ValidationError('File name contains invalid characters'));
  }

  next();
}

