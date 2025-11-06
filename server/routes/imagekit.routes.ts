/**
 * ImageKit Routes
 */

import express from 'express';
import { uploadProfilePhoto } from '../controllers/imagekit.controller.js';

const router = express.Router();

// Upload profile photo (validation is handled in controller middleware array)
router.post('/upload', uploadProfilePhoto);

export default router;

