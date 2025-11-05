/**
 * Resume Editor Page
 * Live editing with preview - creates record on first save
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { ResumeFormProvider, useResumeForm } from '../contexts/ResumeFormContext';
import ResumeEditorLayout from '../components/ResumeEditorLayout';
import PersonalInfoSection from '../components/sections/PersonalInfoSection';
import SummarySection from '../components/sections/SummarySection';
import ExperienceSection from '../components/sections/ExperienceSection';
import EducationSection from '../components/sections/EducationSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import SkillsSection from '../components/sections/SkillsSection';
import {
  createResume,
  savePersonalInfo,
  saveSummary,
  saveExperiences,
  saveEducation,
  saveProjects,
  saveSkills,
} from '../services/resumeApi';

function ResumeEditorContent() {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState('personal-info');
  const [showPreview, setShowPreview] = useState(false);
  const {
    isDirty,
    isSaving,
    setIsSaving,
    setIsDirty,
    formData,
    resumeId,
    isNewResume,
    setResumeId,
    isLoading,
    error,
  } = useResumeForm();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 size={48} className="text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading resume data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center animate-slide-up">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Resume</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary w-full">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    // Validate required fields
    if (!formData.personalInfo?.name?.trim()) {
      toast.error('Please enter your full name', {
        description: 'Name is required to save your resume',
      });
      return;
    }

    if (!formData.personalInfo?.role?.trim()) {
      toast.error('Please enter your professional role', {
        description: 'Role/Title is required to save your resume',
      });
      return;
    }

    if (!formData.personalInfo?.email?.trim()) {
      toast.error('Please enter your email address', {
        description: 'Email is required to save your resume',
      });
      return;
    }

    setIsSaving(true);
    const saveToast = toast.loading('Saving your resume...');

    try {
      let currentResumeId = resumeId;

      // Step 1: Create resume if new
      if (isNewResume && !currentResumeId) {
        const resumeTitle = `${formData.personalInfo.name}'s Resume`;

        const newResume = await createResume({
          title: resumeTitle,
          template: 'classic',
          accentColor: '#3B82F6',
        });

        currentResumeId = newResume.id.toString();
        setResumeId(currentResumeId);

        // Update URL to the new resume ID
        navigate(`/resume/${currentResumeId}`, { replace: true });
      }

      if (!currentResumeId) {
        throw new Error('Resume ID is required');
      }

      // Step 2: Save Personal Info
      await savePersonalInfo(currentResumeId, {
        name: formData.personalInfo.name,
        role: formData.personalInfo.role,
        email: formData.personalInfo.email,
        phone: formData.personalInfo.phone || '',
        location: formData.personalInfo.location || '',
        linkedinUrl: formData.personalInfo.linkedinUrl || '',
        portfolioUrl: formData.personalInfo.portfolioUrl || '',
      });

      // Step 3: Save Summary (if exists)
      if (formData.summary?.content?.trim()) {
        await saveSummary(currentResumeId, {
          content: formData.summary.content,
        });
      }

      // Step 4: Save Experiences (if exists)
      if (formData.experiences && formData.experiences.length > 0) {
        await saveExperiences(currentResumeId, formData.experiences);
      }

      // Step 5: Save Education (if exists)
      if (formData.education && formData.education.length > 0) {
        await saveEducation(currentResumeId, formData.education);
      }

      // Step 6: Save Projects (if exists)
      if (formData.projects && formData.projects.length > 0) {
        await saveProjects(currentResumeId, formData.projects);
      }

      // Step 7: Save Skills (if exists)
      if (formData.skills && formData.skills.length > 0) {
        await saveSkills(currentResumeId, formData.skills);
      }

      // Success!
      setIsSaving(false);
      setIsDirty(false);
      toast.success('Resume saved successfully! 🎉', {
        id: saveToast,
        description: 'Your changes have been saved',
      });
    } catch (error) {
      console.error('❌ Save failed:', error);
      setIsSaving(false);
      toast.error('Failed to save resume', {
        id: saveToast,
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'personal-info':
        return <PersonalInfoSection />;
      case 'summary':
        return <SummarySection />;
      case 'experience':
        return <ExperienceSection />;
      case 'education':
        return <EducationSection />;
      case 'projects':
        return <ProjectsSection />;
      case 'skills':
        return <SkillsSection />;
      default:
        return <PersonalInfoSection />;
    }
  };

  return (
    <ResumeEditorLayout
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      showPreview={showPreview}
      onTogglePreview={() => setShowPreview(!showPreview)}
      previewPanel={
        <div className="text-center text-gray-500 py-12">
          <p>Live preview coming soon! 👀</p>
        </div>
      }
      isDirty={isDirty}
      isSaving={isSaving}
      onSave={handleSave}
    >
      {renderSection()}
    </ResumeEditorLayout>
  );
}

export default function ResumeEditor() {
  return (
    <ResumeFormProvider>
      <ResumeEditorContent />
    </ResumeFormProvider>
  );
}
