/**
 * Public Resume API
 * API calls for public/private resume visibility
 */

import type { Resume } from '../types/resume';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Toggle resume visibility (public/private)
 */
export async function toggleResumeVisibility(
  resumeId: number,
  isPublic: boolean
): Promise<{ is_public: boolean; public_id: string }> {
  const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/visibility`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_public: isPublic }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle visibility');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get public resume by public_id
 */
export async function getPublicResume(publicId: string): Promise<Resume> {
  const response = await fetch(`${API_BASE_URL}/public/${publicId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch public resume');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Generate public URL for a resume
 */
export function getPublicResumeUrl(publicId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/public/${publicId}`;
}
