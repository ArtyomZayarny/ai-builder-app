/**
 * Resume Routes
 */

import express from 'express';
import resumeController from '../controllers/resume.controller.js';
import { validate } from '../middleware/validate.js';
import { 
  ResumeCreateSchema, 
  ResumeUpdateSchema,
  PersonalInfoUpdateSchema,
  SummarySchema,
  SkillCreateSchema,
  SkillUpdateSchema,
  EducationCreateSchema,
  EducationUpdateSchema,
  ProjectCreateSchema,
  ProjectUpdateSchema
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

// Summary (content is required - single field, no partial update)
router.put('/:id/summary', validate(SummarySchema), resumeController.updateSummary);

// Skills CRUD
router.get('/:id/skills', resumeController.getSkills);
router.post('/:id/skills', validate(SkillCreateSchema), resumeController.createSkill);
router.put('/:id/skills/:skillId', validate(SkillUpdateSchema), resumeController.updateSkill);
router.delete('/:id/skills/:skillId', resumeController.deleteSkill);

// Education CRUD
router.get('/:id/education', resumeController.getEducation);
router.post('/:id/education', validate(EducationCreateSchema), resumeController.createEducation);
router.put('/:id/education/:eduId', validate(EducationUpdateSchema), resumeController.updateEducation);
router.delete('/:id/education/:eduId', resumeController.deleteEducation);

// Projects CRUD
router.get('/:id/projects', resumeController.getProjects);
router.post('/:id/projects', validate(ProjectCreateSchema), resumeController.createProject);
router.put('/:id/projects/:projectId', validate(ProjectUpdateSchema), resumeController.updateProject);
router.delete('/:id/projects/:projectId', resumeController.deleteProject);

export default router;

