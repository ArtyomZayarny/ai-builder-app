/**
 * Resume Card Component
 * Displays a resume preview card with actions
 */

import { Edit, Copy, Trash2, FileText, Calendar, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, type MouseEvent } from 'react';
import type { Resume } from '../types/resume';
import ConfirmDialog from './ConfirmDialog';
import PublicToggle from './PublicToggle';

interface ResumeCardProps {
  resume: Resume;
  onDelete: (id: number) => Promise<void>;
  onDuplicate: (id: number) => Promise<void>;
  onVisibilityChange?: (id: number, isPublic: boolean, publicId: string) => void;
}

export default function ResumeCard({
  resume,
  onDelete,
  onDuplicate,
  onVisibilityChange,
}: ResumeCardProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    navigate(`/resume/${resume.id}`);
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    await onDelete(resume.id);
  };

  const handleDuplicate = async (e: MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    await onDuplicate(resume.id);
  };

  // Format date
  const formattedDate = new Date(resume.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Template display names
  const templateNames: Record<string, string> = {
    classic: 'Classic',
    modern: 'Modern',
    creative: 'Creative',
    technical: 'Technical',
  };

  // Template colors
  const templateColors: Record<string, string> = {
    classic: 'bg-blue-100 text-blue-700 border-blue-200',
    modern: 'bg-purple-100 text-purple-700 border-purple-200',
    creative: 'bg-pink-100 text-pink-700 border-pink-200',
    technical: 'bg-green-100 text-green-700 border-green-200',
  };

  return (
    <>
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Resume?"
        message={`Are you sure you want to delete "${resume.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />

      <div onClick={handleEdit} className="group card-hover cursor-pointer animate-scale-in">
        {/* Preview Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={handleEdit}
              className="bg-white px-6 py-3 rounded-lg shadow-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Edit size={18} />
              Edit Resume
            </button>
          </div>
          <FileText
            size={64}
            className="text-gray-300 group-hover:text-primary-400 transition-colors"
          />
        </div>

        {/* Card Content */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
              {resume.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Calendar size={14} />
              <span>Updated {formattedDate}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${templateColors[resume.template] || templateColors.classic}`}
            >
              {templateNames[resume.template]}
            </span>
            {resume.is_public && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Eye size={12} />
                Public
              </span>
            )}
          </div>

          {/* Public/Private Toggle */}
          <div onClick={e => e.stopPropagation()}>
            <PublicToggle
              resumeId={resume.id}
              isPublic={resume.is_public}
              publicId={resume.public_id}
              onToggleSuccess={(isPublic, publicId) => {
                onVisibilityChange?.(resume.id, isPublic, publicId);
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={handleEdit}
              className="flex-1 btn btn-secondary text-sm py-2"
              title="Edit resume"
            >
              <Edit size={16} />
              <span className="ml-2">Edit</span>
            </button>
            <button
              onClick={handleDuplicate}
              className="btn btn-secondary p-2"
              title="Duplicate resume"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="btn bg-red-50 text-red-600 hover:bg-red-100 p-2"
              title="Delete resume"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
