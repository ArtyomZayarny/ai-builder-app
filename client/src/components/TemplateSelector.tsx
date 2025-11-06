/**
 * Template Selector Component
 * UI for selecting between different resume templates
 */

import { ReactNode } from 'react';
import { useResumeForm, type ResumeTemplate } from '../contexts/ResumeFormContext';
import { FileText, Sparkles, Palette, Code } from 'lucide-react';

interface TemplateOption {
  id: ResumeTemplate;
  name: string;
  description: string;
  icon: ReactNode;
  badge?: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Professional ATS-friendly design',
    icon: <FileText size={20} />,
    badge: 'Recommended',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean minimalist layout',
    icon: <Sparkles size={20} />,
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Design-forward with unique styling',
    icon: <Palette size={20} />,
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Emphasizes skills and projects',
    icon: <Code size={20} />,
  },
];

export default function TemplateSelector() {
  const { selectedTemplate, setSelectedTemplate } = useResumeForm();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Choose Template</h3>
        <p className="text-sm text-gray-600">Select a resume design that fits your style</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TEMPLATES.map(template => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`relative flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left ${
              selectedTemplate === template.id
                ? 'border-blue-600 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {/* Badge */}
            {template.badge && (
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded">
                {template.badge}
              </span>
            )}

            {/* Icon */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${
                selectedTemplate === template.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {template.icon}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h4
                className={`font-semibold mb-1 ${
                  selectedTemplate === template.id ? 'text-blue-900' : 'text-gray-900'
                }`}
              >
                {template.name}
              </h4>
              <p
                className={`text-xs leading-relaxed ${
                  selectedTemplate === template.id ? 'text-blue-700' : 'text-gray-600'
                }`}
              >
                {template.description}
              </p>
            </div>

            {/* Selected Indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-2 left-2 w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> All templates are ATS-friendly and optimized for PDF export. You
          can switch between them anytime without losing your data.
        </p>
      </div>
    </div>
  );
}
