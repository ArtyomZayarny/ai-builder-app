/**
 * Dashboard Page
 * Main page showing all user's resumes
 */

import { useState, useEffect } from 'react';
import { Plus, FileText, AlertCircle, Loader2 } from 'lucide-react';
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
        <div className="text-center animate-fade-in">
          <Loader2 size={48} className="text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center animate-slide-up">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={fetchResumes} className="btn-primary w-full">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (resumes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-lg animate-slide-up">
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Create Your First Resume</h2>
          <p className="text-lg text-gray-600 mb-8">
            Build a professional resume in minutes with our easy-to-use builder. Choose from
            multiple templates and customize to your needs.
          </p>
          <button onClick={handleCreateResume} className="btn-primary text-lg px-8 py-4 shadow-lg">
            <Plus size={24} />
            <span className="ml-2">Create Resume</span>
          </button>
        </div>
      </div>
    );
  }

  // Dashboard with resumes
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
                My Resumes
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage and edit your professional resumes
              </p>
            </div>
            <button
              onClick={handleCreateResume}
              className="btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Plus size={20} />
              <span className="ml-2">New Resume</span>
            </button>
          </div>
        </div>
      </header>

      {/* Resume Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resumes.map((resume, index) => (
            <div
              key={resume.id}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ResumeCard
                resume={resume}
                onDelete={handleDeleteResume}
                onDuplicate={handleDuplicateResume}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
