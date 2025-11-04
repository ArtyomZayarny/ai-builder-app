/**
 * Resume Card Component
 * Displays a resume preview card with actions
 */

import { Edit, Copy, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MouseEvent } from 'react';
import type { Resume } from '../types/resume';

interface ResumeCardProps {
  resume: Resume;
  onDelete: (id: number) => Promise<void>;
  onDuplicate: (id: number) => Promise<void>;
}

export default function ResumeCard({ resume, onDelete, onDuplicate }: ResumeCardProps) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/resume/${resume.id}`);
  };

  const handleDelete = async (e: MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (window.confirm(`Are you sure you want to delete "${resume.title}"?`)) {
      await onDelete(resume.id);
    }
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

  return (
    <div
      className="group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={handleEdit}
    >
      {/* Resume Preview Thumbnail */}
      <div className="aspect-[8.5/11] bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
        <div className="w-full h-full p-6 text-xs">
          <div className="h-3 w-24 bg-gray-300 rounded mb-2"></div>
          <div className="h-2 w-full bg-gray-200 rounded mb-1"></div>
          <div className="h-2 w-full bg-gray-200 rounded mb-1"></div>
          <div className="h-2 w-3/4 bg-gray-200 rounded mb-3"></div>
          <div className="h-2 w-full bg-gray-200 rounded mb-1"></div>
          <div className="h-2 w-full bg-gray-200 rounded mb-1"></div>
        </div>

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={handleEdit}
            className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Edit"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={handleDuplicate}
            className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Duplicate"
          >
            <Copy size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Resume Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate mb-1">{resume.title}</h3>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Modified {formattedDate}</span>
          <span className="capitalize text-xs px-2 py-1 bg-gray-100 rounded">
            {resume.template}
          </span>
        </div>
      </div>

      {/* Optional: Public status badge */}
      {resume.is_public && (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1">
          <ExternalLink size={12} />
          Public
        </div>
      )}
    </div>
  );
}
