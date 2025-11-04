/**
 * Resume API Service
 * Handles all API calls related to resumes
 */

import { BACKEND_URL } from '../config';
import type { Resume, ResumeCreateInput, ResumeUpdateInput, ApiResponse } from '../types/resume';

const API_BASE = `${BACKEND_URL}/api/resumes`;

/**
 * Fetch all resumes
 */
export const getAllResumes = async (): Promise<Resume[]> => {
  const response = await fetch(API_BASE);

  if (!response.ok) {
    throw new Error('Failed to fetch resumes');
  }

  const data: ApiResponse<Resume[]> = await response.json();
  return data.data; // Extract data from { success: true, data: [...] }
};

/**
 * Get resume by ID
 */
export const getResumeById = async (id: number | string): Promise<Resume> => {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch resume');
  }

  const data: ApiResponse<Resume> = await response.json();
  return data.data;
};

/**
 * Create new resume
 */
export const createResume = async (resumeData: ResumeCreateInput): Promise<Resume> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resumeData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create resume');
  }

  const data: ApiResponse<Resume> = await response.json();
  return data.data;
};

/**
 * Update resume
 */
export const updateResume = async (
  id: number | string,
  resumeData: ResumeUpdateInput
): Promise<Resume> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resumeData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update resume');
  }

  const data: ApiResponse<Resume> = await response.json();
  return data.data;
};

/**
 * Delete resume
 */
export const deleteResume = async (id: number | string): Promise<boolean> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete resume');
  }

  return true;
};

/**
 * Duplicate resume
 */
export const duplicateResume = async (id: number | string): Promise<Resume> => {
  // First, get the resume data
  const resume = await getResumeById(id);

  // Create a new resume with modified title
  const newResume = await createResume({
    title: `${resume.title} (Copy)`,
    template: resume.template,
    accentColor: resume.accent_color,
  });

  return newResume;
};
