import express from 'express';
import * as resumeController from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/resumes
 * @desc    Get all resumes for current user
 * @access  Private
 */
router.get('/', authenticate, resumeController.getAllResumes);

/**
 * @route   GET /api/resumes/:id
 * @desc    Get resume by ID
 * @access  Private
 */
router.get('/:id', authenticate, resumeController.getResumeById);

/**
 * @route   POST /api/resumes
 * @desc    Create a new resume
 * @access  Private
 */
router.post('/', authenticate, resumeController.createResume);

/**
 * @route   PUT /api/resumes/:id
 * @desc    Update resume
 * @access  Private
 */
router.put('/:id', authenticate, resumeController.updateResume);

/**
 * @route   DELETE /api/resumes/:id
 * @desc    Delete resume
 * @access  Private
 */
router.delete('/:id', authenticate, resumeController.deleteResume);

export default router;
