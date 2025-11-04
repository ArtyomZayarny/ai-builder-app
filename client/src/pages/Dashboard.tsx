/**
 * Dashboard Page
 * Main page showing all user's resumes
 */

import { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ResumeCard from '../components/ResumeCard';
import { getAllResumes, createResume, deleteResume, duplicateResume } from '../services/resumeApi';
import type { Resume } from '../types/resume';

export default function Dashboard() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch resumes on mount
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await getAllResumes();
      setResumes(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async () => {
    try {
      const newResume = await createResume({
        title: 'My Resume',
        template: 'classic',
        accentColor: '#3B82F6',
      });

      // Navigate to editor
      navigate(`/resume/${newResume.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error creating resume:', err);
    }
  };

  const handleDeleteResume = async (id: number) => {
    try {
      await deleteResume(id);
      // Remove from state
      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error deleting resume:', err);
    }
  };

  const handleDuplicateResume = async (id: number) => {
    try {
      const newResume = await duplicateResume(id);
      // Add to state
      setResumes([...resumes, newResume]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error duplicating resume:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <FileText size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchResumes}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (resumes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <FileText size={64} className="mx-auto text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your First Resume</h2>
          <p className="text-gray-600 mb-6">
            Build a professional resume in minutes with our easy-to-use builder. Choose from
            multiple templates and customize to your needs.
          </p>
          <button
            onClick={handleCreateResume}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={20} />
            Create Resume
          </button>
        </div>
      </div>
    );
  }

  // Dashboard with resumes
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
              <p className="text-gray-600 mt-1">Manage and edit your professional resumes</p>
            </div>
            <button
              onClick={handleCreateResume}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              New Resume
            </button>
          </div>
        </div>
      </header>

      {/* Resume Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resumes.map(resume => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onDelete={handleDeleteResume}
              onDuplicate={handleDuplicateResume}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
