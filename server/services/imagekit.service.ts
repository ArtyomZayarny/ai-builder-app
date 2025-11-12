/**
 * ImageKit Service
 * Handles image uploads and transformations via ImageKit
 */

import ImageKit from 'imagekit';
import { removeBackgroundFromImageFile } from 'remove.bg';
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
 * Remove background from image using remove.bg API
 */
async function removeBackground(file: Buffer, fileName: string): Promise<Buffer> {
  const apiKey = process.env.REMOVEBG_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Background removal is not configured. Please set REMOVEBG_API_KEY environment variable.'
    );
  }

  const fs = await import('fs/promises');
  const path = await import('path');
  const os = await import('os');

  const tempDir = os.tmpdir();
  const inputFile = path.join(tempDir, `input-${Date.now()}-${fileName}`);
  const outputFile = path.join(tempDir, `output-${Date.now()}-${fileName}`);

  try {
    // Write buffer to temporary file
    await fs.writeFile(inputFile, file);

    // Call remove.bg API
    await removeBackgroundFromImageFile({
      path: inputFile,
      apiKey: apiKey,
      size: 'regular',
      type: 'auto',
      outputFile: outputFile,
    });

    // Read the processed file
    const processedFile = await fs.readFile(outputFile);

    return processedFile;
  } catch (error) {
    console.error('Background removal error:', error);
    throw new Error('Failed to remove background from image');
  } finally {
    // Clean up temporary files
    await fs.unlink(inputFile).catch(() => {
      // Ignore cleanup errors
    });
    await fs.unlink(outputFile).catch(() => {
      // Ignore cleanup errors
    });
  }
}

/**
 * Upload image to ImageKit
 * @param file - Image file buffer
 * @param fileName - Original file name
 * @param folder - ImageKit folder path
 * @param removeBackground - Whether to remove background before upload
 */
export async function uploadImage(
  file: Buffer,
  fileName: string,
  folder: string = 'resume-photos',
  removeBackgroundOption: boolean = false
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

    // Remove background if requested
    let processedFile = file;
    if (removeBackgroundOption) {
      const apiKey = process.env.REMOVEBG_API_KEY;
      if (!apiKey) {
        // If API key is not configured, log warning but continue with original image
        console.warn(
          'Background removal requested but REMOVEBG_API_KEY is not configured. Uploading original image.'
        );
      } else {
        try {
          processedFile = await removeBackground(file, fileName);
        } catch (error) {
          // If background removal fails, continue with original file
          console.error('Background removal failed, using original image:', error);
          // Don't throw - allow upload to continue with original image
        }
      }
    }

    // Upload to ImageKit
    const client = getImageKitClient();

    const uploadResponse = await client.upload({
      file: processedFile.toString('base64'),
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      // Apply basic optimization
      transformation: {
        pre: 'tr:w-400,h-400,c-at_max,q-80', // Resize and optimize
      },
    });

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
