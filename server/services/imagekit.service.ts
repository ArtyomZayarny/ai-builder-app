/**
 * ImageKit Service
 * Handles image uploads and transformations via ImageKit
 */

import ImageKit from 'imagekit';
import { ValidationError } from '../utils/errors.js';

// Lazy initialization of ImageKit client (only when needed and if keys are available)
let imagekit: ImageKit | null = null;

function getImageKitClient(): ImageKit {
  if (!imagekit) {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error(
        'ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables.'
      );
    }

    imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  }

  return imagekit;
}

/**
 * Check if ImageKit is available
 */
export function isImageKitAvailable(): boolean {
  return !!(
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
  );
}

/**
 * Upload image to ImageKit
 */
export async function uploadImage(
  file: Buffer,
  fileName: string,
  folder: string = 'resume-photos'
): Promise<{ url: string; fileId: string }> {
  try {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.length > maxSize) {
      throw new ValidationError('File size exceeds 5MB limit');
    }

    // Validate file type
    const validExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (!validExtensions.includes(fileExtension)) {
      throw new ValidationError('Invalid file type. Only JPEG and PNG are allowed');
    }

    // Upload to ImageKit
    // Note: Transformations (like background removal) are applied via URL parameters when displaying
    const client = getImageKitClient();
    const uploadResponse = await client.upload({
      file: file.toString('base64'),
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      // Apply basic optimization
      transformation: {
        pre: 'tr:w-400,h-400,c-at_max,q-80', // Resize and optimize
      },
    });

    // If background removal is requested, we'll apply it via URL transformation
    // The URL will be modified on the frontend when displaying

    return {
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    console.error('ImageKit upload error:', error);
    throw new Error('Failed to upload image to ImageKit');
  }
}

/**
 * Delete image from ImageKit
 */
export async function deleteImage(fileId: string): Promise<void> {
  try {
    const client = getImageKitClient();
    await client.deleteFile(fileId);
  } catch (error) {
    console.error('ImageKit delete error:', error);
    // Don't throw - deletion failures shouldn't block the main flow
  }
}

/**
 * Get ImageKit authentication parameters for client-side uploads (optional)
 */
export function getImageKitAuth(): {
  token: string;
  expire: number;
  signature: string;
} {
  try {
    const client = getImageKitClient();
    const authenticationParameters = client.getAuthenticationParameters();
    return authenticationParameters;
  } catch (error) {
    console.error('ImageKit auth error:', error);
    throw new Error('Failed to generate ImageKit authentication');
  }
}

