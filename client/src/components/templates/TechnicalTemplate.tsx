/**
 * Technical Resume Template
 * Emphasizes skills and projects with visual indicators
 */

import { ResumeData } from '../../types/resume';

interface TechnicalTemplateProps {
  data: ResumeData;
}

export default function TechnicalTemplate({ data }: TechnicalTemplateProps) {
  const { personalInfo, summary, experiences, education, projects, skills } = data;

  return (
    <article
      id="resume-preview"
      className="bg-white min-h-full max-w-[21cm] mx-auto"
      style={{
        fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
      }}
    >
      <div className="p-8 md:p-10 bg-gray-50">
        {/* Header - Technical Style */}
        {personalInfo && (
          <header className="mb-8 bg-gray-900 text-white p-6 rounded-lg">
            <div className="font-mono">
              <div className="text-xs text-gray-400 mb-2">&lt;header&gt;</div>
              <div className="flex items-start gap-4">
                {/* Profile Photo */}
                {personalInfo.photoUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={personalInfo.photoUrl}
                      alt={personalInfo.name || 'Profile'}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                    {personalInfo.name || 'Your Name'}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-300 mb-4 font-light">
                    {personalInfo.role || 'Your Professional Title'}
                  </p>
                </div>
              </div>

              {/* Contact Info - Code-like */}
              <div className="text-sm space-y-1 text-gray-300 font-normal">
                {personalInfo.email && (
                  <div>
                    <span className="text-gray-500">email:</span> {personalInfo.email}
                  </div>
                )}
                {personalInfo.phone && (
                  <div>
                    <span className="text-gray-500">phone:</span> {personalInfo.phone}
                  </div>
                )}
                {personalInfo.location && (
                  <div>
                    <span className="text-gray-500">location:</span> {personalInfo.location}
                  </div>
                )}
                {personalInfo.linkedinUrl && (
                  <div>
                    <span className="text-gray-500">linkedin:</span>{' '}
                    <a
                      href={personalInfo.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      {personalInfo.linkedinUrl}
                    </a>
                  </div>
                )}
                {personalInfo.portfolioUrl && (
                  <div>
                    <span className="text-gray-500">portfolio:</span>{' '}
                    <a
                      href={personalInfo.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      {personalInfo.portfolioUrl}
                    </a>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-4">&lt;/header&gt;</div>
            </div>
          </header>
        )}

        {/* Skills - Priority Section */}
        {skills && skills.length > 0 && (
          <section className="mb-8 bg-white p-6 rounded-lg border-2 border-gray-900">
            <h2 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider flex items-center gap-2">
              <span className="text-blue-600">//</span> Technical Skills
            </h2>
            <div className="space-y-4">
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
                  <div key={index} className="break-inside-avoid">
                    <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-green-600">▸</span> {category}
                    </h3>
                    <div className="pl-5 flex flex-wrap gap-2">
                      {skillNames.map((skill, idx) => (
                        <code
                          key={idx}
                          className="px-2.5 py-1 bg-gray-100 text-gray-900 text-xs font-semibold rounded border border-gray-300"
                        >
                          {skill}
                        </code>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </section>
        )}

        {/* Projects - Secondary Priority */}
        {projects && projects.length > 0 && (
          <section className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider flex items-center gap-2">
              <span className="text-blue-600">//</span> Projects
            </h2>
            <div className="space-y-5">
              {projects.map((project, index) => (
                <article key={index} className="break-inside-avoid border-l-4 border-blue-600 pl-4">
                  <div className="flex justify-between items-baseline mb-1 flex-wrap gap-2">
                    <h3 className="text-base font-bold text-gray-900">{project.name}</h3>
                    {project.date && (
                      <time className="text-xs text-gray-600 font-mono">{project.date}</time>
                    )}
                  </div>
                  {project.technologies &&
                    Array.isArray(project.technologies) &&
                    project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {project.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline inline-block mb-2 font-mono"
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

        {/* Professional Summary */}
        {summary?.content && (
          <section className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="text-blue-600">//</span> About
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {summary.content}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {experiences && experiences.length > 0 && (
          <section className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider flex items-center gap-2">
              <span className="text-blue-600">//</span> Experience
            </h2>
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <article key={index} className="break-inside-avoid">
                  <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900">{exp.role}</h3>
                      <p className="text-sm text-gray-700 font-semibold">{exp.company}</p>
                      {exp.location && (
                        <p className="text-xs text-gray-500 mt-0.5">{exp.location}</p>
                      )}
                    </div>
                    <time className="text-xs text-gray-600 font-mono whitespace-nowrap">
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                    </time>
                  </div>
                  {exp.description && (
                    <div className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-gray-200">
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
          <section className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider flex items-center gap-2">
              <span className="text-blue-600">//</span> Education
            </h2>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <article key={index} className="break-inside-avoid">
                  <h3 className="text-base font-bold text-gray-900">{edu.degree}</h3>
                  <p className="text-sm text-gray-700 font-semibold">{edu.institution}</p>
                  <div className="text-xs text-gray-600 mt-1 font-mono">
                    {edu.graduationDate && <time>{edu.graduationDate}</time>}
                    {edu.field && (
                      <>
                        {edu.graduationDate && ' | '}
                        {edu.field}
                      </>
                    )}
                    {edu.gpa && (
                      <>
                        {(edu.graduationDate || edu.field) && ' | '}
                        GPA: {edu.gpa}
                      </>
                    )}
                  </div>
                </article>
              ))}
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
            <div className="text-center py-16 text-gray-400 bg-white rounded-lg">
              <p className="text-xl">Start filling out your resume to see the preview</p>
              <p className="text-sm mt-2">Your professional resume will appear here</p>
            </div>
          )}
      </div>
    </article>
  );
}
