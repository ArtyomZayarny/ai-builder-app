/**
 * Resume Editor Page
 * Live editing with preview - creates record on first save
 */

import { useState } from 'react';
import { ResumeFormProvider, useResumeForm } from '../contexts/ResumeFormContext';
import ResumeEditorLayout from '../components/ResumeEditorLayout';
import PersonalInfoSection from '../components/sections/PersonalInfoSection';
import SummarySection from '../components/sections/SummarySection';
import ExperienceSection from '../components/sections/ExperienceSection';
import EducationSection from '../components/sections/EducationSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import SkillsSection from '../components/sections/SkillsSection';

function ResumeEditorContent() {
  const [currentSection, setCurrentSection] = useState('personal-info');
  const [showPreview, setShowPreview] = useState(false);
  const { isDirty, isSaving, setIsSaving, setIsDirty, formData } = useResumeForm();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement save logic
      console.log('Saving resume data:', formData);
      // await saveResumeData(formData);
      setTimeout(() => {
        setIsSaving(false);
        setIsDirty(false);
      }, 1000);
    } catch (error) {
      console.error('Save failed:', error);
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
