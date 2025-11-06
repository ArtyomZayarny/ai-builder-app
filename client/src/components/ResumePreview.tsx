/**
 * Resume Preview Component - Classic Template
 * Professional, ATS-friendly resume template with responsive design
 */

import { useResumeForm } from '../contexts/ResumeFormContext';

export default function ResumePreview() {
  const { formData } = useResumeForm();
  const { personalInfo, summary, experiences, education, projects, skills } = formData;

  return (
    <article
      id="resume-preview"
      className="bg-white min-h-full max-w-[21cm] mx-auto"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div className="p-8 md:p-12">
        {/* Header - Personal Info */}
        {personalInfo && (
          <header className="mb-8 pb-6 border-b-2 border-gray-900">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
              {personalInfo.name || 'Your Name'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4 font-medium">
              {personalInfo.role || 'Your Professional Title'}
            </p>

            {/* Contact Info - Optimized for ATS */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700">
              {personalInfo.email && (
                <span className="flex items-center gap-1.5">
                  <span className="font-medium">Email:</span> {personalInfo.email}
                </span>
              )}
              {personalInfo.phone && (
                <span className="flex items-center gap-1.5">
                  <span className="font-medium">Phone:</span> {personalInfo.phone}
                </span>
              )}
              {personalInfo.location && (
                <span className="flex items-center gap-1.5">
                  <span className="font-medium">Location:</span> {personalInfo.location}
                </span>
              )}
            </div>

            {/* Links */}
            {(personalInfo.linkedinUrl || personalInfo.portfolioUrl) && (
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm mt-2">
                {personalInfo.linkedinUrl && (
                  <a
                    href={personalInfo.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-900 underline font-medium"
                  >
                    LinkedIn
                  </a>
                )}
                {personalInfo.portfolioUrl && (
                  <a
                    href={personalInfo.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-900 underline font-medium"
                  >
                    Portfolio
                  </a>
                )}
              </div>
            )}
          </header>
        )}

        {/* Professional Summary */}
        {summary?.content && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide border-b-2 border-gray-900 pb-2">
              Professional Summary
            </h2>
            <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
              {summary.content}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {experiences && experiences.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-gray-900 pb-2">
              Work Experience
            </h2>
            <div className="space-y-5">
              {experiences.map((exp, index) => (
                <article key={index} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-2 flex-wrap gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900">{exp.role}</h3>
                      <p className="text-base font-semibold text-gray-700">{exp.company}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600 flex-shrink-0">
                      <time className="font-medium">
                        {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                      </time>
                      {exp.location && <p className="text-xs mt-0.5">{exp.location}</p>}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="text-sm text-gray-800 mt-2 leading-relaxed whitespace-pre-wrap pl-0">
                      {exp.description}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-gray-900 pb-2">
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <article key={index} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline flex-wrap gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-base font-semibold text-gray-700">{edu.institution}</p>
                      {edu.field && (
                        <p className="text-sm text-gray-600 mt-0.5">Field: {edu.field}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-600 flex-shrink-0">
                      {edu.graduationDate && (
                        <time className="font-medium">{edu.graduationDate}</time>
                      )}
                      {edu.gpa && <p className="text-xs mt-0.5">GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-gray-900 pb-2">
              Projects
            </h2>
            <div className="space-y-4">
              {projects.map((project, index) => (
                <article key={index} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1 flex-wrap gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                    {project.date && (
                      <time className="text-sm text-gray-600 font-medium flex-shrink-0">
                        {project.date}
                      </time>
                    )}
                  </div>
                  {project.technologies &&
                    Array.isArray(project.technologies) &&
                    project.technologies.length > 0 && (
                      <p className="text-sm text-gray-700 mb-1.5">
                        <span className="font-semibold">Technologies:</span>{' '}
                        {project.technologies.join(', ')}
                      </p>
                    )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-700 hover:text-blue-900 underline inline-block mb-1.5"
                    >
                      {project.url}
                    </a>
                  )}
                  {project.description && (
                    <p className="text-sm text-gray-800 mt-1 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-gray-900 pb-2">
              Skills
            </h2>
            <div className="space-y-2.5">
              {/* Group skills by category */}
              {(() => {
                const grouped = skills.reduce(
                  (acc, skill) => {
                    if (!skill.name) return acc;
                    const category = skill.category || 'General';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(skill.name);
                    return acc;
                  },
                  {} as Record<string, string[]>
                );

                return Object.entries(grouped).map(([category, skillNames], index) => (
                  <div key={index} className="text-sm leading-relaxed break-inside-avoid">
                    <span className="font-bold text-gray-900">{category}:</span>{' '}
                    <span className="text-gray-800">{skillNames.join(' • ')}</span>
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
            <div className="text-center py-16 text-gray-400">
              <p className="text-xl">Start filling out your resume to see the preview</p>
              <p className="text-sm mt-2">Your professional resume will appear here</p>
            </div>
          )}
      </div>
    </article>
  );
}
