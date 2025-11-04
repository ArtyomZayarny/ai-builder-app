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
}

export default new ResumeController();

