/**
 * Resume Preview Component
 * Wrapper that renders the selected template
 */

import { useResumeForm } from '../contexts/ResumeFormContext';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import TechnicalTemplate from './templates/TechnicalTemplate';

export default function ResumePreview() {
  const { formData, selectedTemplate } = useResumeForm();

  // Select the template component based on selectedTemplate
  switch (selectedTemplate) {
    case 'modern':
      return <ModernTemplate data={formData} />;
    case 'creative':
      return <CreativeTemplate data={formData} />;
    case 'technical':
      return <TechnicalTemplate data={formData} />;
    case 'classic':
    default:
      return <ClassicTemplate data={formData} />;
  }
}
