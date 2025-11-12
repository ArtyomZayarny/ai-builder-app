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

/**
 * Save Personal Info
 */
export const savePersonalInfo = async (
  resumeId: number | string,
  data: {
    name: string;
    role: string;
    email: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    photoUrl?: string;
  }
): Promise<void> => {
  const response = await fetch(`${API_BASE}/${resumeId}/personal-info`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Send HttpOnly cookie for authentication
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save personal info');
  }
};

/**
 * Save Summary
 */
export const saveSummary = async (
  resumeId: number | string,
  data: { content: string }
): Promise<void> => {
  const response = await fetch(`${API_BASE}/${resumeId}/summary`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save summary');
  }
};

/**
 * Get Personal Info
 */
export const getPersonalInfo = async (resumeId: number | string): Promise<any> => {
  const response = await fetch(`${API_BASE}/${resumeId}/personal-info`);

  if (!response.ok) {
    throw new Error('Failed to fetch personal info');
  }

  const data: ApiResponse<any> = await response.json();
  return data.data;
};

/**
 * Get Summary
 */
export const getSummary = async (resumeId: number | string): Promise<any> => {
  const response = await fetch(`${API_BASE}/${resumeId}/summary`);

  if (!response.ok) {
    throw new Error('Failed to fetch summary');
  }

  const data: ApiResponse<any> = await response.json();
  return data.data;
};

/**
 * Save/Get Experiences
 */
export const saveExperiences = async (
  resumeId: number | string,
  experiences: any[]
): Promise<void> => {
  // Delete existing and create new (simpler approach for MVP)
  for (const exp of experiences) {
    if (exp.id) {
      // Update existing
      await fetch(`${API_BASE}/${resumeId}/experiences/${exp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exp),
      });
    } else {
      // Create new
      await fetch(`${API_BASE}/${resumeId}/experiences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exp),
      });
    }
  }
};

export const getExperiences = async (resumeId: number | string): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/${resumeId}/experiences`);
  if (!response.ok) throw new Error('Failed to fetch experiences');
  const data: ApiResponse<any[]> = await response.json();
  return data.data || [];
};

/**
 * Save/Get Education
 */
export const saveEducation = async (resumeId: number | string, education: any[]): Promise<void> => {
  for (const edu of education) {
    if (edu.id) {
      await fetch(`${API_BASE}/${resumeId}/education/${edu.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edu),
      });
    } else {
      await fetch(`${API_BASE}/${resumeId}/education`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edu),
      });
    }
  }
};

export const getEducation = async (resumeId: number | string): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/${resumeId}/education`);
  if (!response.ok) throw new Error('Failed to fetch education');
  const data: ApiResponse<any[]> = await response.json();
  return data.data || [];
};

/**
 * Save/Get Projects
 */
export const saveProjects = async (
  resumeId: number | string,
  projects: Array<{
    id?: number;
    name?: string;
    description?: string;
    technologies?: string | string[];
    url?: string;
    date?: string;
    order?: number;
  }>
): Promise<void> => {
  // Helper function to check if project is empty
  const isProjectEmpty = (project: {
    name?: string;
    description?: string;
    technologies?: string | string[];
  }): boolean => {
    return (
      !project.name?.trim() &&
      !project.description?.trim() &&
      (!project.technologies ||
        (typeof project.technologies === 'string' && !project.technologies.trim()) ||
        (Array.isArray(project.technologies) && project.technologies.length === 0))
    );
  };

  // Get existing projects from DB to track what needs to be deleted
  const existingProjects = await getProjects(resumeId);
  const currentProjectIds = new Set(
    projects.filter(p => !isProjectEmpty(p) && p.id).map(p => p.id as number)
  );

  // Delete projects that exist in DB but not in current list (were removed)
  for (const existingProject of existingProjects) {
    if (!currentProjectIds.has(existingProject.id)) {
      await fetch(`${API_BASE}/${resumeId}/projects/${existingProject.id}`, {
        method: 'DELETE',
      });
    }
  }

  // Save/update non-empty projects
  for (const project of projects) {
    // Skip empty projects
    if (isProjectEmpty(project)) {
      // If project has ID and is empty, delete it
      if (project.id) {
        await fetch(`${API_BASE}/${resumeId}/projects/${project.id}`, {
          method: 'DELETE',
        });
      }
      continue;
    }

    if (project.id) {
      const response = await fetch(`${API_BASE}/${resumeId}/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to update project ${project.id}`);
      }
    } else {
      await fetch(`${API_BASE}/${resumeId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
    }
  }
};

export const getProjects = async (resumeId: number | string): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/${resumeId}/projects`);
  if (!response.ok) throw new Error('Failed to fetch projects');
  const data: ApiResponse<any[]> = await response.json();
  return data.data || [];
};

export const deleteProject = async (
  resumeId: number | string,
  projectId: number
): Promise<void> => {
  const response = await fetch(`${API_BASE}/${resumeId}/projects/${projectId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete project');
  }
};

/**
 * Save/Get Skills
 */
export const saveSkills = async (resumeId: number | string, skills: any[]): Promise<void> => {
  for (const skill of skills) {
    if (skill.id) {
      await fetch(`${API_BASE}/${resumeId}/skills/${skill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill),
      });
    } else {
      await fetch(`${API_BASE}/${resumeId}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill),
      });
    }
  }
};

export const getSkills = async (resumeId: number | string): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/${resumeId}/skills`);
  if (!response.ok) throw new Error('Failed to fetch skills');
  const data: ApiResponse<any[]> = await response.json();
  return data.data || [];
};
