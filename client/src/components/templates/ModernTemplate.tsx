/**
 * Modern Resume Template
 * Clean, minimalist design with modern typography
 */

import { ResumeData } from '../../types/resume';
import { getSafeUrl } from '../../utils/urlValidation';

interface ModernTemplateProps {
  data: ResumeData;
}

export default function ModernTemplate({ data }: ModernTemplateProps) {
  const { personalInfo, summary, experiences, education, projects, skills } = data;

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
          <header className="mb-10 text-center">
            {/* Profile Photo */}
            {personalInfo.photoUrl && (
              <div className="flex justify-center mb-6">
                <img
                  src={personalInfo.photoUrl}
                  alt={personalInfo.name || 'Profile'}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  style={{ borderColor: `rgb(var(--resume-accent-color))` }}
                />
              </div>
            )}
            <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-2 tracking-wide">
              {personalInfo.name || 'Your Name'}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6 font-light tracking-wide">
              {personalInfo.role || 'Your Professional Title'}
            </p>

            {/* Contact Info - Horizontal layout */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-700">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.location && <span>{personalInfo.location}</span>}
            </div>

            {/* Links */}
            {(getSafeUrl(personalInfo.linkedinUrl) || getSafeUrl(personalInfo.portfolioUrl)) && (
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm mt-3">
                {getSafeUrl(personalInfo.linkedinUrl) && (
                  <a
                    href={getSafeUrl(personalInfo.linkedinUrl)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-80 transition-opacity"
                    style={{ color: `rgb(var(--resume-accent-color))` }}
                  >
                    LinkedIn
                  </a>
                )}
                {getSafeUrl(personalInfo.portfolioUrl) && (
                  <a
                    href={getSafeUrl(personalInfo.portfolioUrl)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-80 transition-opacity"
                    style={{ color: `rgb(var(--resume-accent-color))` }}
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
          <section className="mb-10">
            <h2
              className="text-sm font-semibold mb-4 uppercase tracking-widest"
              style={{ color: `rgb(var(--resume-accent-color))` }}
            >
              About
            </h2>
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
              {summary.content}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {experiences && experiences.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-sm font-semibold mb-6 uppercase tracking-widest"
              style={{ color: `rgb(var(--resume-accent-color))` }}
            >
              Experience
            </h2>
            <div className="space-y-8">
              {experiences.map((exp, index) => (
                <article key={index} className="break-inside-avoid">
                  <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{exp.role}</h3>
                      <p className="text-base text-gray-600 font-light">{exp.company}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500 font-light">
                      <time>
                        {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                      </time>
                      {exp.location && <p className="text-xs mt-1">{exp.location}</p>}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="text-sm text-gray-700 mt-3 leading-relaxed whitespace-pre-wrap">
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
          <section className="mb-10">
            <h2
              className="text-sm font-semibold mb-6 uppercase tracking-widest"
              style={{ color: `rgb(var(--resume-accent-color))` }}
            >
              Education
            </h2>
            <div className="space-y-6">
              {education.map((edu, index) => (
                <article key={index} className="break-inside-avoid">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-base text-gray-600 font-light">{edu.institution}</p>
                      {edu.field && <p className="text-sm text-gray-500 mt-1">{edu.field}</p>}
                    </div>
                    <div className="text-right text-sm text-gray-500 font-light">
                      {edu.graduationDate && <time>{edu.graduationDate}</time>}
                      {edu.gpa && <p className="text-xs mt-1">GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-sm font-semibold mb-6 uppercase tracking-widest"
              style={{ color: `rgb(var(--resume-accent-color))` }}
            >
              Projects
            </h2>
            <div className="space-y-6">
              {projects.map((project, index) => (
                <article key={index} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-2 flex-wrap gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    {project.date && (
                      <time className="text-sm text-gray-500 font-light">{project.date}</time>
                    )}
                  </div>
                  {project.technologies &&
                    Array.isArray(project.technologies) &&
                    project.technologies.length > 0 && (
                      <p className="text-sm text-gray-500 mb-2">
                        {project.technologies.join(' • ')}
                      </p>
                    )}
                  {getSafeUrl(project.url) && (
                    <a
                      href={getSafeUrl(project.url)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline inline-block mb-2 hover:opacity-80 transition-opacity"
                      style={{ color: `rgb(var(--resume-accent-color))` }}
                    >
                      {project.url}
                    </a>
                  )}
                  {project.description && (
                    <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-sm font-semibold mb-6 uppercase tracking-widest"
              style={{ color: `rgb(var(--resume-accent-color))` }}
            >
              Skills
            </h2>
            <div className="space-y-3">
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
                    <span className="font-semibold text-gray-900">{category}:</span>{' '}
                    <span className="text-gray-700 font-light">{skillNames.join(' • ')}</span>
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
