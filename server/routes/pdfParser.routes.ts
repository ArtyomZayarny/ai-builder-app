/**
 * PDF Parser Routes
 */

import express from 'express';
import { parsePDF } from '../controllers/pdfParser.controller.js';

const router = express.Router();

// Parse PDF resume
router.post('/parse', parsePDF);

export default router;

