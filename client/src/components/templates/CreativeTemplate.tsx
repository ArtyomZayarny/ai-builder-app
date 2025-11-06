/**
 * Creative Resume Template
 * Design-forward, visually distinctive layout with unique styling
 */

import { ResumeData } from '../../types/resume';

interface CreativeTemplateProps {
  data: ResumeData;
}

export default function CreativeTemplate({ data }: CreativeTemplateProps) {
  const { personalInfo, summary, experiences, education, projects, skills } = data;

  return (
    <article
      id="resume-preview"
      className="bg-white min-h-full max-w-[21cm] mx-auto"
      style={{
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div className="p-8 md:p-10">
        {/* Header - Personal Info with Accent */}
        {personalInfo && (
          <header className="mb-8 pb-6 border-b-4 border-gray-900">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-[250px]">
                {/* Profile Photo */}
                {personalInfo.photoUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={personalInfo.photoUrl}
                      alt={personalInfo.name || 'Profile'}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-900"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-1 tracking-tight">
                    {personalInfo.name || 'Your Name'}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-700 font-medium italic">
                    {personalInfo.role || 'Your Professional Title'}
                  </p>
                </div>
              </div>

              {/* Contact Info - Stacked */}
              <div className="text-right text-sm space-y-1">
                {personalInfo.email && (
                  <div className="text-gray-700 font-medium">{personalInfo.email}</div>
                )}
                {personalInfo.phone && <div className="text-gray-600">{personalInfo.phone}</div>}
                {personalInfo.location && (
                  <div className="text-gray-600">{personalInfo.location}</div>
                )}
                {personalInfo.linkedinUrl && (
                  <a
                    href={personalInfo.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 font-medium"
                  >
                    LinkedIn →
                  </a>
                )}
                {personalInfo.portfolioUrl && (
                  <a
                    href={personalInfo.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Portfolio →
                  </a>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Professional Summary with Accent Background */}
        {summary?.content && (
          <section className="mb-8">
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-900">
              <h2 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-widest">
                Professional Summary
              </h2>
              <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                {summary.content}
              </p>
            </div>
          </section>
        )}

        {/* Work Experience with Timeline */}
        {experiences && experiences.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-bold text-gray-900 mb-6 uppercase tracking-widest flex items-center gap-2">
              <span className="inline-block w-8 h-0.5 bg-gray-900"></span>
              Experience
            </h2>
            <div className="space-y-6 relative before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 pl-6">
              {experiences.map((exp, index) => (
                <article key={index} className="break-inside-avoid relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[1.6rem] top-2 w-3 h-3 rounded-full bg-gray-900 border-2 border-white"></div>

                  <div className="bg-white">
                    <div className="flex justify-between items-baseline mb-2 flex-wrap gap-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{exp.role}</h3>
                        <p className="text-base text-gray-700 font-semibold">{exp.company}</p>
                        {exp.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                      </div>
                      <time className="text-sm text-gray-600 font-medium whitespace-nowrap">
                        {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                      </time>
                    </div>
                    {exp.description && (
                      <div className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap pl-0">
                        {exp.description}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Two-column layout for Education & Projects */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Education */}
          {education && education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-gray-900 mb-6 uppercase tracking-widest flex items-center gap-2">
                <span className="inline-block w-8 h-0.5 bg-gray-900"></span>
                Education
              </h2>
              <div className="space-y-5">
                {education.map((edu, index) => (
                  <article key={index} className="break-inside-avoid">
                    <h3 className="text-base font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-sm text-gray-700 font-semibold">{edu.institution}</p>
                    <div className="text-sm text-gray-600 mt-1">
                      {edu.graduationDate && <time>{edu.graduationDate}</time>}
                      {edu.field && (
                        <>
                          {edu.graduationDate && ' • '}
                          {edu.field}
                        </>
                      )}
                      {edu.gpa && (
                        <>
                          {(edu.graduationDate || edu.field) && ' • '}
                          GPA: {edu.gpa}
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-gray-900 mb-6 uppercase tracking-widest flex items-center gap-2">
                <span className="inline-block w-8 h-0.5 bg-gray-900"></span>
                Projects
              </h2>
              <div className="space-y-5">
                {projects.map((project, index) => (
                  <article key={index} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline mb-1 flex-wrap gap-1">
                      <h3 className="text-base font-bold text-gray-900">{project.name}</h3>
                      {project.date && (
                        <time className="text-xs text-gray-600 font-medium">{project.date}</time>
                      )}
                    </div>
                    {project.technologies &&
                      Array.isArray(project.technologies) &&
                      project.technologies.length > 0 && (
                        <p className="text-xs text-gray-600 mb-1.5">
                          {project.technologies.join(' • ')}
                        </p>
                      )}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline inline-block mb-1.5"
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
        </div>

        {/* Skills with Tags */}
        {skills && skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-bold text-gray-900 mb-6 uppercase tracking-widest flex items-center gap-2">
              <span className="inline-block w-8 h-0.5 bg-gray-900"></span>
              Skills
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
                    <h3 className="text-sm font-bold text-gray-900 mb-2">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {skillNames.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full border border-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
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
