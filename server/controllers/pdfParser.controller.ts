/**
 * PDF Parser Controller
 * Handles PDF upload and parsing requests
 */

import type { Request, Response } from 'express';
import multer from 'multer';
import { parsePDFResume } from '../services/pdfParser.service.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateFileUpload } from '../middleware/fileUploadValidation.js';

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF files are allowed'));
    }
  },
});

/**
 * Parse PDF resume
 * POST /api/pdf/parse
 */
export const parsePDF = [
  upload.single('pdf'),
  validateFileUpload,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No PDF file uploaded',
      });
      return;
    }

    try {
      const parsedData = await parsePDFResume(req.file.buffer);

      res.json(
        successResponse(
          {
            ...parsedData,
            fileName: req.file.originalname,
            fileSize: req.file.size,
          },
          'PDF parsed successfully'
        )
      );
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse PDF',
      });
    }
  }),
];

