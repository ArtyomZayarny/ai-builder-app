/**
 * Public Toggle Component
 * Toggle resume visibility and copy public link
 */

import { useState } from 'react';
import { Globe, Lock, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { toggleResumeVisibility, getPublicResumeUrl } from '../services/publicApi';

interface PublicToggleProps {
  resumeId: number;
  isPublic: boolean;
  publicId: string;
  onToggleSuccess?: (isPublic: boolean, publicId: string) => void;
}

export default function PublicToggle({
  resumeId,
  isPublic: initialIsPublic,
  publicId,
  onToggleSuccess,
}: PublicToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggle = async () => {
    setIsTogglingVisibility(true);

    try {
      const result = await toggleResumeVisibility(resumeId, !isPublic);
      setIsPublic(result.is_public);

      toast.success(result.is_public ? 'Resume is now public' : 'Resume is now private', {
        description: result.is_public
          ? 'Anyone with the link can view your resume'
          : 'Only you can view your resume',
      });

      onToggleSuccess?.(result.is_public, result.public_id);
    } catch (error) {
      console.error('Toggle visibility error:', error);
      toast.error('Failed to toggle visibility', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleCopyLink = async () => {
    const publicUrl = getPublicResumeUrl(publicId);

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Link copied!', {
        description: 'Share this link with others',
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy link error:', error);
      toast.error('Failed to copy link', {
        description: 'Please try again',
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        disabled={isTogglingVisibility}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
          ${
            isPublic
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={isPublic ? 'Make private' : 'Make public'}
      >
        {isPublic ? <Globe size={16} /> : <Lock size={16} />}
        <span>{isPublic ? 'Public' : 'Private'}</span>
      </button>

      {/* Copy Link Button (only visible when public) */}
      {isPublic && (
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          title="Copy public link"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      )}
    </div>
  );
}
