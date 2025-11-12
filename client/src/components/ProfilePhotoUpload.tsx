/**
 * Profile Photo Upload Component
 * Handles photo upload with preview and background removal option
 */

import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { uploadProfilePhoto } from '../services/imagekitApi';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUploaded: (url: string) => void;
  onPhotoRemoved?: () => void;
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  onPhotoUploaded,
  onPhotoRemoved,
}: ProfilePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [removeBackground, setRemoveBackground] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with currentPhotoUrl prop when it changes (e.g., after page reload)
  useEffect(() => {
    if (currentPhotoUrl) {
      setPreview(currentPhotoUrl);
    }
  }, [currentPhotoUrl]);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please select an image file (JPEG or PNG)',
      });
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large', {
        description: 'Please select an image smaller than 5MB',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to ImageKit
    setUploading(true);
    const uploadToast = toast.loading('Uploading photo...', {
      description: removeBackground ? 'Removing background...' : 'Processing image...',
    });

    try {
      const result = await uploadProfilePhoto(file, removeBackground);
      // Background removal is handled on the backend, so we just use the URL as-is
      // Update preview to show the processed image from server (with background removed if requested)
      setPreview(result.url);
      onPhotoUploaded(result.url);
      toast.success('Photo uploaded!', {
        id: uploadToast,
        description: 'Your profile photo has been saved',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        id: uploadToast,
        description: error instanceof Error ? error.message : 'Failed to upload photo',
      });
      setPreview(currentPhotoUrl || null); // Revert preview
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onPhotoRemoved?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
        <p className="text-xs text-gray-500 mb-4">
          Upload a professional photo (JPEG or PNG, max 5MB)
        </p>
      </div>

      {/* Photo Preview */}
      {preview && (
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
            <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
          </div>
          {!uploading && (
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
              title="Remove photo"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className={`
            flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${
              uploading
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
            }
          `}
        >
          {uploading ? (
            <>
              <Loader2 size={20} className="animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={20} className="text-gray-600" />
              <span className="text-sm text-gray-700">
                {preview ? 'Change Photo' : 'Upload Photo'}
              </span>
            </>
          )}
        </label>

        {/* Background Removal Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={removeBackground}
            onChange={e => setRemoveBackground(e.target.checked)}
            disabled={uploading}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-600" />
            <span className="text-sm text-gray-700">Remove background</span>
          </div>
        </label>
      </div>

      {/* Info */}
      {!preview && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ImageIcon size={16} />
            <span>No photo uploaded yet</span>
          </div>
        </div>
      )}
    </div>
  );
}
