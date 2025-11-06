/**
 * ImageKit Routes
 */

import express from 'express';
import { uploadProfilePhoto } from '../controllers/imagekit.controller.js';

const router = express.Router();

// Upload profile photo
router.post('/upload', uploadProfilePhoto);

export default router;

