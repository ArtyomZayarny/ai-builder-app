/**
 * Resume Editor Page
 * Saves changes manually when switching sections
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import type { ParsedResumeData } from '../services/pdfApi';
import type { Project } from '@resume-builder/shared';
import { ResumeFormProvider, useResumeForm } from '../contexts/ResumeFormContext';
import { useAutoSave } from '../hooks/useAutoSave';
import ResumeEditorLayout from '../components/ResumeEditorLayout';
import PersonalInfoSection from '../components/sections/PersonalInfoSection';
import SummarySection from '../components/sections/SummarySection';
import ExperienceSection from '../components/sections/ExperienceSection';
import EducationSection from '../components/sections/EducationSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import SkillsSection from '../components/sections/SkillsSection';
import TemplateSelector from '../components/TemplateSelector';
import ColorThemePicker from '../components/ColorThemePicker';
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
  const [searchParams] = useSearchParams();
  const [currentSection, setCurrentSectionState] = useState('personal-info');
  const [showPreview, setShowPreview] = useState(false);

  const {
    isDirty,
    setIsDirty,
    isSectionDirty,
    hasAnyDirty,
    formData,
    resumeId,
    isNewResume,
    isLoading,
    error,
    setSaveStatus,
    saveStatus,
    updateFormData,
  } = useResumeForm();

  // Auto-save hook
  const { manualSave } = useAutoSave({
    resumeId,
    formData,
    isDirty,
    isNewResume,
    setSaveStatus,
    setIsDirty,
    onSaveSuccess: () => {
      // Silent success - status indicator will show
    },
    onSaveError: error => {
      toast.error('Auto-save failed', {
        description: error.message || 'Your changes may not be saved. Please try again.',
      });
    },
  });

  // Handle section change with auto-save if current section is dirty
  const handleSectionChange = useCallback(
    async (newSection: string) => {
      // Map section names to form data keys
      const sectionToKey: Record<
        string,
        | 'personalInfo'
        | 'summary'
        | 'experiences'
        | 'education'
        | 'projects'
        | 'skills'
        | 'selectedTemplate'
        | 'accentColor'
      > = {
        'personal-info': 'personalInfo',
        summary: 'summary',
        experience: 'experiences',
        education: 'education',
        projects: 'projects',
        skills: 'skills',
        templates: 'selectedTemplate',
      };

      const currentSectionKey = sectionToKey[currentSection];

      // If current section is dirty and resume exists, save before switching sections
      if (currentSectionKey && isSectionDirty(currentSectionKey) && !isNewResume && resumeId) {
        try {
          await manualSave();
        } catch (error) {
          console.error('Failed to save before section change:', error);
          // Continue with section change even if save fails
        }
      }
      setCurrentSectionState(newSection);
    },
    [currentSection, isSectionDirty, isNewResume, resumeId, manualSave, formData]
  );

  // Handle PDF import
  useEffect(() => {
    const importParam = searchParams.get('import');
    if (importParam === 'pdf' && resumeId) {
      const importedData = localStorage.getItem(`pdf-import-${resumeId}`);
      if (importedData) {
        const importPDFData = async () => {
          try {
            const parsedData = JSON.parse(importedData) as ParsedResumeData;

            // Helper function to clean strings from null bytes and other invalid UTF-8 characters
            const cleanString = (str: string | undefined | null): string => {
              if (!str) return '';
              // Remove null bytes (\u0000) and other control characters except newlines (\n), tabs (\t), and carriage returns (\r)
              // Build regex pattern as string to avoid ESLint errors
              const nullBytePattern = '\\u0000';
              const controlCharsPattern = '[\\x01-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]';
              const controlCharsRegex = new RegExp(
                `${nullBytePattern}|${controlCharsPattern}`,
                'g'
              );
              return str.replace(controlCharsRegex, '').trim();
            };

            // Helper function to normalize URLs - add https:// if missing
            const normalizeUrl = (url: string | undefined): string => {
              if (!url?.trim()) return '';
              const trimmed = url.trim();
              if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                return trimmed;
              }
              // For LinkedIn, add full URL
              if (trimmed.includes('linkedin.com')) {
                return trimmed.startsWith('www.') ? `https://${trimmed}` : `https://www.${trimmed}`;
              }
              // For other URLs, add https://
              return `https://${trimmed}`;
            };

            // Import and save personal info
            if (parsedData.personalInfo) {
              // Validate required fields before saving (clean null bytes first)
              const name = cleanString(parsedData.personalInfo.name);
              const role = cleanString(parsedData.personalInfo.role);
              const email = cleanString(parsedData.personalInfo.email);

              // Only save if we have at least name and email (required fields)
              if (name && email) {
                const personalInfoData = {
                  name,
                  role: role || 'Professional', // Default role if not found
                  email,
                  phone: cleanString(parsedData.personalInfo.phone),
                  location: cleanString(parsedData.personalInfo.location),
                  linkedinUrl: normalizeUrl(cleanString(parsedData.personalInfo.linkedinUrl)),
                  portfolioUrl: normalizeUrl(cleanString(parsedData.personalInfo.portfolioUrl)),
                };

                updateFormData('personalInfo', personalInfoData);

                // Save to database
                await savePersonalInfo(resumeId, personalInfoData);
              } else {
                // Still update form data with what we have
                updateFormData('personalInfo', {
                  name: name || '',
                  role: role || '',
                  email: email || '',
                  phone: cleanString(parsedData.personalInfo.phone),
                  location: cleanString(parsedData.personalInfo.location),
                  linkedinUrl: normalizeUrl(cleanString(parsedData.personalInfo.linkedinUrl)),
                  portfolioUrl: normalizeUrl(cleanString(parsedData.personalInfo.portfolioUrl)),
                });
              }
            }

            // Import and save summary
            if (parsedData.summary?.content) {
              const summaryData = { content: cleanString(parsedData.summary.content) };
              updateFormData('summary', summaryData);
              await saveSummary(resumeId, summaryData);
            }

            // Import and save experiences
            if (parsedData.experiences && parsedData.experiences.length > 0) {
              // Clean all experience fields
              const cleanedExperiences = parsedData.experiences.map(exp => ({
                ...exp,
                role: cleanString(exp.role),
                company: cleanString(exp.company),
                location: cleanString(exp.location),
                description: cleanString(exp.description),
                startDate: cleanString(exp.startDate),
                endDate: cleanString(exp.endDate),
              }));
              updateFormData('experiences', cleanedExperiences);
              await saveExperiences(resumeId, cleanedExperiences);
            }

            // Import and save education
            if (parsedData.education && parsedData.education.length > 0) {
              // Clean all education fields
              const cleanedEducation = parsedData.education.map(edu => ({
                ...edu,
                degree: cleanString(edu.degree),
                institution: cleanString(edu.institution),
                field: cleanString(edu.field),
                location: cleanString(edu.location),
                description: cleanString(edu.description),
                graduationDate: cleanString(edu.graduationDate),
              }));
              updateFormData('education', cleanedEducation);
              await saveEducation(resumeId, cleanedEducation);
            }

            // Import and save projects
            if (parsedData.projects && parsedData.projects.length > 0) {
              // Clean all project fields
              const cleanedProjects = parsedData.projects.map(project => ({
                ...project,
                name: cleanString(project.name),
                description: cleanString(project.description),
                url: cleanString(project.url),
                date: cleanString(project.date),
                technologies: Array.isArray(project.technologies)
                  ? project.technologies.map(t => cleanString(t)).filter(t => t)
                  : project.technologies
                    ? [cleanString(project.technologies)].filter(t => t)
                    : [],
              }));
              // For form: normalize projects to ensure technologies is a string (comma-separated)
              const formProjects = cleanedProjects.map(project => ({
                ...project,
                technologies: Array.isArray(project.technologies)
                  ? project.technologies.join(', ')
                  : '',
              })) as unknown as Project[]; // Type assertion: form stores technologies as string, but Project type has string[]
              updateFormData('projects', formProjects);
              // For database: keep technologies as array
              const dbProjects = cleanedProjects;
              await saveProjects(resumeId, dbProjects);
            }

            // Import and save skills
            if (parsedData.skills && parsedData.skills.length > 0) {
              // Clean all skill fields
              const cleanedSkills = parsedData.skills
                .map(skill => ({
                  ...skill,
                  name: cleanString(skill.name),
                  category: cleanString(skill.category) || 'General',
                }))
                .filter(skill => skill.name); // Remove skills with empty names
              updateFormData('skills', cleanedSkills);
              await saveSkills(resumeId, cleanedSkills);
            }

            // Clear imported data
            localStorage.removeItem(`pdf-import-${resumeId}`);

            // Remove import param from URL
            searchParams.delete('import');
            navigate(`/resume/${resumeId}`, { replace: true });

            toast.success('PDF data imported and saved!', {
              description: `Confidence: ${Math.round(parsedData.confidence * 100)}% - All data has been saved to database.`,
            });
          } catch (err) {
            console.error('Failed to import PDF data:', err);
            toast.error('Failed to import PDF data');
          }
        };

        importPDFData();
      }
    }
  }, [resumeId, searchParams, updateFormData, navigate]);

  // Check if all required fields are filled
  const isCreateEnabled = Boolean(
    formData.personalInfo?.name?.trim() &&
      formData.personalInfo?.role?.trim() &&
      formData.personalInfo?.email?.trim()
  );

  // Save all form data to backend (called before PDF download or navigation)
  // Manual save is triggered when switching sections or before critical actions
  const saveAllData = useCallback(async () => {
    await manualSave();
  }, [manualSave]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasAnyDirty() && !isNewResume) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasAnyDirty, isNewResume]);

  // Show loading state - AFTER all hooks!
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

  // Show error state - AFTER all hooks!
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center animate-slide-up">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Resume</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Handle Create - creates resume in DB and redirects to dashboard
  const handleCreate = async () => {
    if (!isCreateEnabled) {
      toast.error('Please fill all required fields', {
        description: 'Name, Role, and Email are required',
      });
      return;
    }

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
        photoUrl: formData.personalInfo!.photoUrl || '',
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

      toast.success('Resume created successfully! 🎉', {
        id: createToast,
        description: 'Redirecting to dashboard...',
      });

      // Redirect to dashboard after 500ms
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      console.error('❌ Create failed:', error);
      toast.error('Failed to create resume', {
        id: createToast,
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  // Handle PDF download (save changes first if needed)
  const handleDownloadPDF = async () => {
    try {
      // Save changes silently if resume exists and has unsaved changes
      if (!isNewResume && hasAnyDirty() && resumeId) {
        await saveAllData();
      }

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

      const pdfToast = toast.loading('Generating PDF...');

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          toast.success('PDF downloaded! 📄', {
            id: pdfToast,
            description: `Saved as ${fileName}`,
          });
        })
        .catch((error: Error) => {
          toast.error('PDF generation failed', {
            id: pdfToast,
            description: error.message,
          });
        });
    } catch (error) {
      // Error already handled in saveAllData
      console.error('PDF download cancelled:', error);
    }
  };

  // Handle navigation back to dashboard (save before leaving if needed)
  const handleDashboardClick = async () => {
    try {
      // Save changes silently if resume exists and has unsaved changes
      if (!isNewResume && isDirty && resumeId) {
        await saveAllData();
      }
      navigate('/dashboard');
    } catch {
      // Error already shown in saveAllData, stay on page
      console.error('Navigation cancelled due to save error');
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
      case 'template':
        return (
          <div className="space-y-8">
            <TemplateSelector />
            <div className="border-t border-gray-200 pt-8">
              <ColorThemePicker />
            </div>
          </div>
        );
      default:
        return <PersonalInfoSection />;
    }
  };

  return (
    <ResumeEditorLayout
      currentSection={currentSection}
      onSectionChange={handleSectionChange}
      showPreview={showPreview}
      onTogglePreview={() => setShowPreview(!showPreview)}
      previewPanel={<ResumePreview />}
      isCreateEnabled={isCreateEnabled}
      onCreate={handleCreate}
      isNewResume={isNewResume}
      resumeId={resumeId}
      onDownloadPDF={handleDownloadPDF}
      onDashboardClick={handleDashboardClick}
      saveStatus={saveStatus}
      isDirty={hasAnyDirty()}
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
