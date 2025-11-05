/**
 * Resume Editor Page
 * Auto-saves on section change and after 2 seconds of inactivity
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { ResumeFormProvider, useResumeForm } from '../contexts/ResumeFormContext';
import ResumeEditorLayout from '../components/ResumeEditorLayout';
import PersonalInfoSection from '../components/sections/PersonalInfoSection';
import SummarySection from '../components/sections/SummarySection';
import ExperienceSection from '../components/sections/ExperienceSection';
import EducationSection from '../components/sections/EducationSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import SkillsSection from '../components/sections/SkillsSection';
import ResumePreview from '../components/ResumePreview';
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    isDirty,
    isSaving,
    setIsSaving,
    setIsDirty,
    formData,
    resumeId,
    isNewResume,
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

  // Check if all required fields are filled
  const isCreateEnabled = Boolean(
    formData.personalInfo?.name?.trim() &&
      formData.personalInfo?.role?.trim() &&
      formData.personalInfo?.email?.trim()
  );

  // Auto-save to local state only (for existing resumes)
  const autoSave = useCallback(async () => {
    // Only auto-save for existing resumes (not new ones)
    if (isNewResume || !resumeId) {
      return;
    }

    // Skip if already saving
    if (isSaving) return;

    setIsSaving(true);

    try {
      // Save Personal Info
      if (formData.personalInfo) {
        await savePersonalInfo(resumeId, {
          name: formData.personalInfo.name || '',
          role: formData.personalInfo.role || '',
          email: formData.personalInfo.email || '',
          phone: formData.personalInfo.phone || '',
          location: formData.personalInfo.location || '',
          linkedinUrl: formData.personalInfo.linkedinUrl || '',
          portfolioUrl: formData.personalInfo.portfolioUrl || '',
        });
      }

      // Save Summary (if exists)
      if (formData.summary?.content?.trim()) {
        await saveSummary(resumeId, {
          content: formData.summary.content,
        });
      }

      // Save Experiences (if exists)
      if (formData.experiences && formData.experiences.length > 0) {
        await saveExperiences(resumeId, formData.experiences);
      }

      // Save Education (if exists)
      if (formData.education && formData.education.length > 0) {
        await saveEducation(resumeId, formData.education);
      }

      // Save Projects (if exists)
      if (formData.projects && formData.projects.length > 0) {
        await saveProjects(resumeId, formData.projects);
      }

      // Save Skills (if exists)
      if (formData.skills && formData.skills.length > 0) {
        await saveSkills(resumeId, formData.skills);
      }

      setIsSaving(false);
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      setIsSaving(false);
      toast.error('Failed to auto-save', {
        description: error instanceof Error ? error.message : 'Changes not saved',
      });
    }
  }, [formData, resumeId, isNewResume, isSaving, setIsSaving, setIsDirty]);

  // Auto-save on section change (for existing resumes only)
  useEffect(() => {
    if (isDirty && !isNewResume && resumeId) {
      autoSave();
    }
  }, [currentSection, isDirty, isNewResume, resumeId, autoSave]);

  // Auto-save with debounce (2 seconds after last change, for existing resumes only)
  useEffect(() => {
    if (isDirty && !isNewResume && resumeId) {
      // Clear previous timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer
      autoSaveTimerRef.current = setTimeout(() => {
        autoSave();
      }, 2000); // 2 seconds
    }

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [isDirty, formData, isNewResume, resumeId, autoSave]);

  // Handle Create - creates resume in DB and redirects to dashboard
  const handleCreate = async () => {
    if (!isCreateEnabled) {
      toast.error('Please fill all required fields', {
        description: 'Name, Role, and Email are required',
      });
      return;
    }

    setIsSaving(true);
    const createToast = toast.loading('Creating your resume...');

    try {
      // Step 1: Create resume
      const resumeTitle = `${formData.personalInfo!.name}'s Resume`;
      const newResume = await createResume({
        title: resumeTitle,
        template: 'classic',
        accentColor: '#3B82F6',
      });

      const currentResumeId = newResume.id.toString();

      // Step 2: Save all data
      await savePersonalInfo(currentResumeId, {
        name: formData.personalInfo!.name || '',
        role: formData.personalInfo!.role || '',
        email: formData.personalInfo!.email || '',
        phone: formData.personalInfo!.phone || '',
        location: formData.personalInfo!.location || '',
        linkedinUrl: formData.personalInfo!.linkedinUrl || '',
        portfolioUrl: formData.personalInfo!.portfolioUrl || '',
      });

      if (formData.summary?.content?.trim()) {
        await saveSummary(currentResumeId, {
          content: formData.summary.content,
        });
      }

      if (formData.experiences && formData.experiences.length > 0) {
        await saveExperiences(currentResumeId, formData.experiences);
      }

      if (formData.education && formData.education.length > 0) {
        await saveEducation(currentResumeId, formData.education);
      }

      if (formData.projects && formData.projects.length > 0) {
        await saveProjects(currentResumeId, formData.projects);
      }

      if (formData.skills && formData.skills.length > 0) {
        await saveSkills(currentResumeId, formData.skills);
      }

      setIsSaving(false);
      toast.success('Resume created successfully! 🎉', {
        id: createToast,
        description: 'Redirecting to dashboard...',
      });

      // Redirect to dashboard after 500ms
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      console.error('❌ Create failed:', error);
      setIsSaving(false);
      toast.error('Failed to create resume', {
        id: createToast,
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-preview');
    if (!element) {
      toast.error('Preview not available', {
        description: 'Please open the preview panel first',
      });
      return;
    }

    const fileName = formData.personalInfo?.name
      ? `${formData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`
      : 'Resume.pdf';

    const opt = {
      margin: 0.5,
      filename: fileName,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const },
    };

    toast.loading('Generating PDF...');

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        toast.dismiss();
        toast.success('PDF downloaded! 📄', {
          description: `Saved as ${fileName}`,
        });
      })
      .catch((error: Error) => {
        toast.dismiss();
        toast.error('PDF generation failed', {
          description: error.message,
        });
      });
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
      previewPanel={<ResumePreview />}
      isSaving={isSaving}
      lastSaved={lastSaved}
      isCreateEnabled={isCreateEnabled}
      onCreate={handleCreate}
      isNewResume={isNewResume}
      resumeId={resumeId}
      onDownloadPDF={handleDownloadPDF}
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
