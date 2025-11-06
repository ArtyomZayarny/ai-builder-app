/**
 * ImageKit Service
 * Handles image uploads and transformations via ImageKit
 */

import ImageKit from 'imagekit';
import { ValidationError } from '../utils/errors.js';

// Initialize ImageKit client
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

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
    const uploadResponse = await imagekit.upload({
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
    await imagekit.deleteFile(fileId);
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
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return authenticationParameters;
  } catch (error) {
    console.error('ImageKit auth error:', error);
    throw new Error('Failed to generate ImageKit authentication');
  }
}

