/**
 * Resume Preview Component - QUICK MVP VERSION
 * Simple, readable preview of resume data
 */

import { useResumeForm } from '../contexts/ResumeFormContext';

export default function ResumePreview() {
  const { formData } = useResumeForm();
  const { personalInfo, summary, experiences, education, projects, skills } = formData;

  return (
    <div id="resume-preview" className="bg-white p-8 shadow-sm min-h-full">
      {/* Header - Personal Info */}
      {personalInfo && (
        <header className="mb-6 pb-4 border-b-2 border-gray-900">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {personalInfo.name || 'Your Name'}
          </h1>
          <p className="text-xl text-gray-700 mb-3">
            {personalInfo.role || 'Your Professional Title'}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            {personalInfo.email && <span>📧 {personalInfo.email}</span>}
            {personalInfo.phone && <span>📱 {personalInfo.phone}</span>}
            {personalInfo.location && <span>📍 {personalInfo.location}</span>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-blue-600 mt-1">
            {personalInfo.linkedinUrl && (
              <a href={personalInfo.linkedinUrl} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {personalInfo.portfolioUrl && (
              <a href={personalInfo.portfolioUrl} target="_blank" rel="noopener noreferrer">
                Portfolio
              </a>
            )}
          </div>
        </header>
      )}

      {/* Summary */}
      {summary?.content && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide border-b border-gray-300 pb-1">
            Professional Summary
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {summary.content}
          </p>
        </section>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
            Work Experience
          </h2>
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{exp.role}</h3>
                    <p className="text-sm font-semibold text-gray-700">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>
                      {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                    </p>
                    {exp.location && <p className="text-xs">{exp.location}</p>}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-sm font-semibold text-gray-700">{edu.institution}</p>
                    {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{edu.graduationDate}</p>
                    {edu.gpa && <p className="text-xs">GPA: {edu.gpa}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((project, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-base font-bold text-gray-900">{project.name}</h3>
                  {project.date && <span className="text-sm text-gray-600">{project.date}</span>}
                </div>
                {project.technologies && Array.isArray(project.technologies) && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Tech:</span> {project.technologies.join(', ')}
                  </p>
                )}
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {project.url}
                  </a>
                )}
                {project.description && (
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
            Skills
          </h2>
          <div className="space-y-2">
            {/* Group skills by category */}
            {(() => {
              const grouped = skills.reduce(
                (acc, skill) => {
                  const category = skill.category || 'Other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(skill.name);
                  return acc;
                },
                {} as Record<string, string[]>
              );

              return Object.entries(grouped).map(([category, skillNames], index) => (
                <div key={index} className="text-sm">
                  <span className="font-semibold text-gray-900">{category}:</span>{' '}
                  <span className="text-gray-700">{skillNames.join(', ')}</span>
                </div>
              ));
            })()}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!personalInfo &&
        !summary &&
        !experiences?.length &&
        !education?.length &&
        !projects?.length &&
        !skills?.length && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Start filling out your resume to see the preview</p>
          </div>
        )}
    </div>
  );
}
