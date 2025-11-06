/**
 * Public Resume Page
 * Displays a publicly shared resume
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, Loader2, Lock } from 'lucide-react';
import { getPublicResume } from '../services/publicApi';
import ClassicTemplate from '../components/templates/ClassicTemplate';
import ModernTemplate from '../components/templates/ModernTemplate';
import CreativeTemplate from '../components/templates/CreativeTemplate';
import TechnicalTemplate from '../components/templates/TechnicalTemplate';
import { applyResumeTheme } from '../utils/resumeTheme';
import type { ResumeData } from '../types/resume';

interface PublicResumeData extends ResumeData {
  id: number;
  title: string;
  template: 'classic' | 'modern' | 'creative' | 'technical';
  accent_color: string;
  personalInfo?: {
    name?: string;
    role?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    photo_url?: string;
  };
}

export default function PublicResume() {
  const { publicId } = useParams<{ publicId: string }>();
  const [resume, setResume] = useState<PublicResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicId) {
      setError('Invalid resume link');
      setLoading(false);
      return;
    }

    const fetchPublicResume = async () => {
      try {
        setLoading(true);
        const data = await getPublicResume(publicId);
        setResume(data as PublicResumeData);
        setError(null);

        // Apply theme
        if (data.accent_color) {
          applyResumeTheme(data.accent_color, 'public-resume');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load resume';
        setError(errorMessage);
        console.error('Error fetching public resume:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicResume();
  }, [publicId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 size={48} className="text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading resume...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !resume) {
    return (
      <>
        <Helmet>
          <title>Resume Not Found | AI Resume Builder</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-8 text-center animate-slide-up">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {error?.includes('not found') ? (
                <Lock size={32} className="text-red-600" />
              ) : (
                <AlertCircle size={32} className="text-red-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error?.includes('not found') ? 'Resume Not Available' : 'Oops! Something went wrong'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'This resume might be private or the link may be invalid.'}
            </p>
          </div>
        </div>
      </>
    );
  }

  // Render template based on resume.template
  const renderTemplate = () => {
    // Map database fields to frontend format
    const personalInfo = resume.personalInfo
      ? {
          ...resume.personalInfo,
          linkedinUrl: resume.personalInfo.linkedin_url,
          portfolioUrl: resume.personalInfo.portfolio_url,
          photoUrl: resume.personalInfo.photo_url,
        }
      : undefined;

    const templateData: ResumeData = {
      personalInfo,
      summary: resume.summary,
      experiences: resume.experiences,
      education: resume.education,
      projects: resume.projects,
      skills: resume.skills,
    };

    switch (resume.template) {
      case 'modern':
        return <ModernTemplate data={templateData} />;
      case 'creative':
        return <CreativeTemplate data={templateData} />;
      case 'technical':
        return <TechnicalTemplate data={templateData} />;
      case 'classic':
      default:
        return <ClassicTemplate data={templateData} />;
    }
  };

  const fullName = resume.personalInfo?.name || 'Professional';
  const jobTitle = resume.personalInfo?.role || '';

  return (
    <>
      <Helmet>
        <title>{`${fullName}${jobTitle ? ` - ${jobTitle}` : ''} | AI Resume Builder`}</title>
        <meta
          name="description"
          content={`View ${fullName}'s professional resume${jobTitle ? ` as ${jobTitle}` : ''}. Built with AI Resume Builder.`}
        />
        <meta property="og:title" content={`${fullName}${jobTitle ? ` - ${jobTitle}` : ''}`} />
        <meta
          property="og:description"
          content={`View ${fullName}'s professional resume${jobTitle ? ` as ${jobTitle}` : ''}.`}
        />
        <meta property="og:type" content="profile" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div id="public-resume" className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-[21cm] mx-auto bg-white shadow-2xl">{renderTemplate()}</div>
      </div>
    </>
  );
}
