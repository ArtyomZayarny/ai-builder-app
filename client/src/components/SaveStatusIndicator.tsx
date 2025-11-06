/**
 * Save Status Indicator Component
 * Visual indicator for auto-save status (saving, saved, error)
 */

import { Loader2, Check, AlertCircle } from 'lucide-react';
import type { SaveStatus } from '../contexts/ResumeFormContext';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  isDirty?: boolean;
}

export default function SaveStatusIndicator({ status, isDirty }: SaveStatusIndicatorProps) {
  // Don't show anything if idle and not dirty
  if (status === 'idle' && !isDirty) {
    return null;
  }

  // Show different states
  switch (status) {
    case 'saving':
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 size={16} className="animate-spin text-blue-600" />
          <span className="hidden sm:inline">Saving...</span>
        </div>
      );

    case 'saved':
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check size={16} className="text-green-600" />
          <span className="hidden sm:inline">Saved</span>
        </div>
      );

    case 'error':
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle size={16} className="text-red-600" />
          <span className="hidden sm:inline">Save failed</span>
        </div>
      );

    case 'idle':
    default:
      // Show "Unsaved changes" if dirty
      if (isDirty) {
        return (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="hidden sm:inline">Unsaved changes</span>
          </div>
        );
      }
      return null;
  }
}
