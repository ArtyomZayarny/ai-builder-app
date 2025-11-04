/**
 * Resume Routes
 */

import express from 'express';
import resumeController from '../controllers/resume.controller.js';
import { validate } from '../middleware/validate.js';
import { 
  ResumeCreateSchema, 
  ResumeUpdateSchema,
  PersonalInfoUpdateSchema
} from '@resume-builder/shared';

const router = express.Router();

// Resume CRUD
router.get('/', resumeController.getAllResumes);
router.get('/:id', resumeController.getResumeById);
router.post('/', validate(ResumeCreateSchema), resumeController.createResume);
router.put('/:id', validate(ResumeUpdateSchema), resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);

// Personal Info
router.put('/:id/personal-info', validate(PersonalInfoUpdateSchema), resumeController.updatePersonalInfo);

export default router;

