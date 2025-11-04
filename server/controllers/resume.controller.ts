/**
 * Resume Controller
 * Business logic and request/response handling
 */

import type { Request, Response } from 'express';
import resumeService from '../services/resume.service.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

class ResumeController {
  /**
   * Get all resumes
   * GET /api/resumes
   */
  getAllResumes = asyncHandler(async (_req: Request, res: Response) => {
    const resumes = await resumeService.getAllResumes();
    res.json(successResponse(resumes, 'Resumes retrieved successfully'));
  });

  /**
   * Get single resume
   * GET /api/resumes/:id
   */
  getResumeById = asyncHandler(async (req: Request, res: Response) => {
    const resume = await resumeService.getResumeById(req.params.id);
    res.json(successResponse(resume, 'Resume retrieved successfully'));
  });

  /**
   * Create resume
   * POST /api/resumes
   */
  createResume = asyncHandler(async (req: Request, res: Response) => {
    const resume = await resumeService.createResume(req.body);
    res.status(201).json(successResponse(resume, 'Resume created successfully'));
  });

  /**
   * Update resume
   * PUT /api/resumes/:id
   */
  updateResume = asyncHandler(async (req: Request, res: Response) => {
    const resume = await resumeService.updateResume(req.params.id, req.body);
    res.json(successResponse(resume, 'Resume updated successfully'));
  });

  /**
   * Delete resume
   * DELETE /api/resumes/:id
   */
  deleteResume = asyncHandler(async (req: Request, res: Response) => {
    await resumeService.deleteResume(req.params.id);
    res.status(204).send();
  });

  /**
   * Update personal info
   * PUT /api/resumes/:id/personal-info
   */
  updatePersonalInfo = asyncHandler(async (req: Request, res: Response) => {
    const personalInfo = await resumeService.updatePersonalInfo(req.params.id, req.body);
    res.json(successResponse(personalInfo, 'Personal info updated successfully'));
  });

  /**
   * Update summary
   * PUT /api/resumes/:id/summary
   */
  updateSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await resumeService.updateSummary(req.params.id, req.body);
    res.json(successResponse(summary, 'Summary updated successfully'));
  });

  /**
   * Get all skills
   * GET /api/resumes/:id/skills
   */
  getSkills = asyncHandler(async (req: Request, res: Response) => {
    const skills = await resumeService.getSkills(req.params.id);
    res.json(successResponse(skills, 'Skills retrieved successfully'));
  });

  /**
   * Create skill
   * POST /api/resumes/:id/skills
   */
  createSkill = asyncHandler(async (req: Request, res: Response) => {
    const skill = await resumeService.createSkill(req.params.id, req.body);
    res.status(201).json(successResponse(skill, 'Skill created successfully'));
  });

  /**
   * Update skill
   * PUT /api/resumes/:id/skills/:skillId
   */
  updateSkill = asyncHandler(async (req: Request, res: Response) => {
    const skill = await resumeService.updateSkill(req.params.id, req.params.skillId, req.body);
    res.json(successResponse(skill, 'Skill updated successfully'));
  });

  /**
   * Delete skill
   * DELETE /api/resumes/:id/skills/:skillId
   */
  deleteSkill = asyncHandler(async (req: Request, res: Response) => {
    await resumeService.deleteSkill(req.params.id, req.params.skillId);
    res.status(204).send();
  });

  /**
   * Get all education
   * GET /api/resumes/:id/education
   */
  getEducation = asyncHandler(async (req: Request, res: Response) => {
    const education = await resumeService.getEducation(req.params.id);
    res.json(successResponse(education, 'Education retrieved successfully'));
  });

  /**
   * Create education
   * POST /api/resumes/:id/education
   */
  createEducation = asyncHandler(async (req: Request, res: Response) => {
    const education = await resumeService.createEducation(req.params.id, req.body);
    res.status(201).json(successResponse(education, 'Education created successfully'));
  });

  /**
   * Update education
   * PUT /api/resumes/:id/education/:eduId
   */
  updateEducation = asyncHandler(async (req: Request, res: Response) => {
    const education = await resumeService.updateEducation(req.params.id, req.params.eduId, req.body);
    res.json(successResponse(education, 'Education updated successfully'));
  });

  /**
   * Delete education
   * DELETE /api/resumes/:id/education/:eduId
   */
  deleteEducation = asyncHandler(async (req: Request, res: Response) => {
    await resumeService.deleteEducation(req.params.id, req.params.eduId);
    res.status(204).send();
  });
}

export default new ResumeController();

