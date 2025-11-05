/**
 * Resume Editor Page
 * Live editing with preview - creates record on first save
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResumeFormProvider, useResumeForm } from '../contexts/ResumeFormContext';
import ResumeEditorLayout from '../components/ResumeEditorLayout';
import PersonalInfoSection from '../components/sections/PersonalInfoSection';
import SummarySection from '../components/sections/SummarySection';
import ExperienceSection from '../components/sections/ExperienceSection';
import EducationSection from '../components/sections/EducationSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import SkillsSection from '../components/sections/SkillsSection';
import { createResume, savePersonalInfo, saveSummary } from '../services/resumeApi';

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resume data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Resume</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let currentResumeId = resumeId;

      // Step 1: Create resume if new
      if (isNewResume && !currentResumeId) {
        const resumeTitle = formData.personalInfo?.name
          ? `${formData.personalInfo.name}'s Resume`
          : 'Untitled Resume';

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

      // Step 2: Save Personal Info (if exists)
      if (formData.personalInfo) {
        await savePersonalInfo(currentResumeId, {
          name: formData.personalInfo.name || '',
          role: formData.personalInfo.role || '',
          email: formData.personalInfo.email || '',
          phone: formData.personalInfo.phone || '',
          location: formData.personalInfo.location || '',
          linkedinUrl: formData.personalInfo.linkedinUrl || '',
          portfolioUrl: formData.personalInfo.portfolioUrl || '',
        });
      }

      // Step 3: Save Summary (if exists)
      if (formData.summary?.content) {
        await saveSummary(currentResumeId, {
          content: formData.summary.content,
        });
      }

      // Success!
      setIsSaving(false);
      setIsDirty(false);
      console.log('✅ Resume saved successfully!');
    } catch (error) {
      console.error('❌ Save failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to save resume');
      setIsSaving(false);
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
