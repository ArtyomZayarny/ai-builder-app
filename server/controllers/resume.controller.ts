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
   * Get personal info
   * GET /api/resumes/:id/personal-info
   */
  getPersonalInfo = asyncHandler(async (req: Request, res: Response) => {
    const personalInfo = await resumeService.getPersonalInfo(req.params.id);
    res.json(successResponse(personalInfo, 'Personal info retrieved successfully'));
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
   * Get summary
   * GET /api/resumes/:id/summary
   */
  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await resumeService.getSummary(req.params.id);
    res.json(successResponse(summary, 'Summary retrieved successfully'));
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

  /**
   * Get all projects
   * GET /api/resumes/:id/projects
   */
  getProjects = asyncHandler(async (req: Request, res: Response) => {
    const projects = await resumeService.getProjects(req.params.id);
    res.json(successResponse(projects, 'Projects retrieved successfully'));
  });

  /**
   * Create project
   * POST /api/resumes/:id/projects
   */
  createProject = asyncHandler(async (req: Request, res: Response) => {
    const project = await resumeService.createProject(req.params.id, req.body);
    res.status(201).json(successResponse(project, 'Project created successfully'));
  });

  /**
   * Update project
   * PUT /api/resumes/:id/projects/:projectId
   */
  updateProject = asyncHandler(async (req: Request, res: Response) => {
    const project = await resumeService.updateProject(req.params.id, req.params.projectId, req.body);
    res.json(successResponse(project, 'Project updated successfully'));
  });

  /**
   * Delete project
   * DELETE /api/resumes/:id/projects/:projectId
   */
  deleteProject = asyncHandler(async (req: Request, res: Response) => {
    await resumeService.deleteProject(req.params.id, req.params.projectId);
    res.status(204).send();
  });

  /**
   * Get all experiences
   * GET /api/resumes/:id/experiences
   */
  getExperiences = asyncHandler(async (req: Request, res: Response) => {
    const experiences = await resumeService.getExperiences(req.params.id);
    res.json(successResponse(experiences, 'Experiences retrieved successfully'));
  });

  /**
   * Create experience
   * POST /api/resumes/:id/experiences
   */
  createExperience = asyncHandler(async (req: Request, res: Response) => {
    const experience = await resumeService.createExperience(req.params.id, req.body);
    res.status(201).json(successResponse(experience, 'Experience created successfully'));
  });

  /**
   * Update experience
   * PUT /api/resumes/:id/experiences/:expId
   */
  updateExperience = asyncHandler(async (req: Request, res: Response) => {
    const experience = await resumeService.updateExperience(req.params.id, req.params.expId, req.body);
    res.json(successResponse(experience, 'Experience updated successfully'));
  });

  /**
   * Delete experience
   * DELETE /api/resumes/:id/experiences/:expId
   */
  deleteExperience = asyncHandler(async (req: Request, res: Response) => {
    await resumeService.deleteExperience(req.params.id, req.params.expId);
    res.status(204).send();
  });

  /**
   * Toggle resume visibility (public/private)
   * PATCH /api/resumes/:id/visibility
   */
  toggleVisibility = asyncHandler(async (req: Request, res: Response) => {
    const { is_public } = req.body;
    const resume = await resumeService.toggleVisibility(req.params.id, is_public);
    res.json(
      successResponse(
        resume,
        is_public ? 'Resume is now public' : 'Resume is now private',
      ),
    );
  });

  /**
   * Get public resume by public_id
   * GET /api/public/:publicId
   */
  getPublicResume = asyncHandler(async (req: Request, res: Response) => {
    const resume = await resumeService.getPublicResume(req.params.publicId);
    res.json(successResponse(resume, 'Public resume retrieved successfully'));
  });
}

export default new ResumeController();

