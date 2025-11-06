/**
 * ImageKit API
 * Client-side API for image uploads
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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

  const response = await fetch(`${API_BASE_URL}/imagekit/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload photo');
  }

  const result = await response.json();
  return result.data;
}
