/**
 * ImageKit Controller
 * Handles image upload requests
 */

import type { Request, Response } from 'express';
import multer from 'multer';
import { uploadImage } from '../services/imagekit.service.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    // Accept only JPEG and PNG
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed'));
    }
  },
});

/**
 * Upload profile photo
 * POST /api/imagekit/upload
 */
export const uploadProfilePhoto = [
  upload.single('photo'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
      return;
    }

    const fileName = req.file.originalname || `photo-${Date.now()}.${req.file.mimetype.split('/')[1]}`;

    const result = await uploadImage(
      req.file.buffer,
      fileName,
      'resume-photos'
    );

    res.json(
      successResponse(
        {
          url: result.url,
          fileId: result.fileId,
        },
        'Photo uploaded successfully'
      )
    );
  }),
];

