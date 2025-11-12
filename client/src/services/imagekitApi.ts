/**
 * ImageKit API
 * Client-side API for image uploads
 */

import { BACKEND_URL } from '../config';

const API_BASE_URL = `${BACKEND_URL}/api`;

export interface UploadPhotoResponse {
  url: string;
  fileId: string;
}

/**
 * Upload profile photo
 */
export async function uploadProfilePhoto(
  file: File,
  removeBackground: boolean = false
): Promise<UploadPhotoResponse> {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('removeBackground', removeBackground.toString());

  // Authentication via HttpOnly cookie (secure, not accessible to JavaScript)
  // Don't set Content-Type for FormData - browser will set it with boundary
  const response = await fetch(`${API_BASE_URL}/imagekit/upload`, {
    method: 'POST',
    credentials: 'include', // HttpOnly cookie is sent automatically
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload photo');
  }

  const result = await response.json();
  return result.data;
}
