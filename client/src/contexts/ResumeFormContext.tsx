/**
 * Resume Form Context
 * Global form state management for resume data
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
  useEffect,
} from 'react';
import { useParams } from 'react-router-dom';
import {
  getPersonalInfo,
  getSummary,
  getExperiences,
  getEducation,
  getProjects,
  getSkills,
} from '../services/resumeApi';

import type { Experience, Education, Project, Skill } from '@resume-builder/shared';

// ✅ Move loading logic OUTSIDE component - stable reference, no useCallback needed
async function fetchResumeData(id: string) {
  console.log('🔄 Loading resume data for ID:', id);

  // Load all data in parallel
  const [personalInfoRes, summaryRes, experiencesRes, educationRes, projectsRes, skillsRes] =
    await Promise.allSettled([
      getPersonalInfo(id),
      getSummary(id),
      getExperiences(id),
      getEducation(id),
      getProjects(id),
      getSkills(id),
    ]);

  // Return structured data
  return {
    personalInfo:
      personalInfoRes.status === 'fulfilled' && personalInfoRes.value
        ? {
            name: personalInfoRes.value.name || '',
            role: personalInfoRes.value.role || '',
            email: personalInfoRes.value.email || '',
            phone: personalInfoRes.value.phone || '',
            location: personalInfoRes.value.location || '',
            linkedinUrl: personalInfoRes.value.linkedin_url || '',
            portfolioUrl: personalInfoRes.value.portfolio_url || '',
          }
        : undefined,
    summary:
      summaryRes.status === 'fulfilled' && summaryRes.value
        ? { content: summaryRes.value.content || '' }
        : undefined,
    experiences:
      experiencesRes.status === 'fulfilled' && experiencesRes.value
        ? experiencesRes.value
        : undefined,
    education:
      educationRes.status === 'fulfilled' && educationRes.value ? educationRes.value : undefined,
    projects:
      projectsRes.status === 'fulfilled' && projectsRes.value ? projectsRes.value : undefined,
    skills: skillsRes.status === 'fulfilled' && skillsRes.value ? skillsRes.value : undefined,
  };
}

// Template types
export type ResumeTemplate = 'classic' | 'modern' | 'creative' | 'technical';

interface ResumeFormData {
  // Personal Info
  personalInfo?: {
    name?: string;
    role?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
  // Summary
  summary?: {
    content?: string;
  };
  // Work Experience
  experiences?: Experience[];
  // Education
  education?: Education[];
  // Projects
  projects?: Project[];
  // Skills
  skills?: Skill[];
  // Template Selection
  selectedTemplate?: ResumeTemplate;
}

interface ResumeFormContextValue {
  formData: ResumeFormData;
  updateFormData: <K extends keyof ResumeFormData>(section: K, data: ResumeFormData[K]) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  isLoading: boolean;
  error: string | null;
  resumeId: string | null;
  setResumeId: (id: string) => void;
  isNewResume: boolean;
  selectedTemplate: ResumeTemplate;
  setSelectedTemplate: (template: ResumeTemplate) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ResumeFormContext = createContext<ResumeFormContextValue | undefined>(undefined);

export function ResumeFormProvider({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const isNewResume = id === 'new';

  const [resumeId, setResumeId] = useState<string | null>(isNewResume ? null : id || null);
  const [formData, setFormData] = useState<ResumeFormData>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef<string | null>(null); // Track which resume is currently loading

  // Template selection state (persisted in localStorage)
  const [selectedTemplate, setSelectedTemplateState] = useState<ResumeTemplate>(() => {
    const saved = localStorage.getItem(`resume-template-${resumeId || 'new'}`);
    return (saved as ResumeTemplate) || 'classic';
  });

  // Persist template selection
  const setSelectedTemplate = useCallback(
    (template: ResumeTemplate) => {
      setSelectedTemplateState(template);
      localStorage.setItem(`resume-template-${resumeId || 'new'}`, template);
      setIsDirty(true);
    },
    [resumeId]
  );

  // Accent color state (persisted in localStorage)
  const [accentColor, setAccentColorState] = useState<string>(() => {
    const saved = localStorage.getItem(`resume-accent-${resumeId || 'new'}`);
    return saved || '#3B82F6'; // Default blue
  });

  // Persist accent color selection
  const setAccentColor = useCallback(
    (color: string) => {
      setAccentColorState(color);
      localStorage.setItem(`resume-accent-${resumeId || 'new'}`, color);
      setIsDirty(true);
    },
    [resumeId]
  );

  // ✅ Load resume data on mount if editing existing resume
  // Function outside component = stable, no need for useCallback or deps array gymnastics
  useEffect(() => {
    if (isNewResume || !resumeId) return;

    // Prevent duplicate loads (React StrictMode calls effects twice)
    if (loadingRef.current === resumeId) {
      console.log('⏭️ Already loading resume:', resumeId);
      return;
    }

    loadingRef.current = resumeId;
    setIsLoading(true);
    setError(null);

    // Call external function (stable reference)
    fetchResumeData(resumeId)
      .then(data => {
        setFormData(data);
        console.log('✅ Resume loaded successfully in ONE render!');
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load resume data');
        console.error('❌ Failed to load resume data:', err);
        loadingRef.current = null; // Allow retry on error
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [resumeId, isNewResume]); // ✅ Only resumeId and isNewResume - clean and clear!

  const updateFormData = useCallback(
    <K extends keyof ResumeFormData>(section: K, data: ResumeFormData[K]) => {
      setFormData(prev => ({
        ...prev,
        [section]: data,
      }));
      setIsDirty(true);
    },
    []
  );

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<ResumeFormContextValue>(
    () => ({
      formData,
      updateFormData,
      isDirty,
      setIsDirty,
      isSaving,
      setIsSaving,
      isLoading,
      error,
      resumeId,
      setResumeId,
      isNewResume,
      selectedTemplate,
      setSelectedTemplate,
      accentColor,
      setAccentColor,
    }),
    [
      formData,
      updateFormData,
      isDirty,
      isSaving,
      isLoading,
      error,
      resumeId,
      isNewResume,
      selectedTemplate,
      setSelectedTemplate,
      accentColor,
      setAccentColor,
    ]
  );

  return <ResumeFormContext.Provider value={value}>{children}</ResumeFormContext.Provider>;
}

export function useResumeForm() {
  const context = useContext(ResumeFormContext);
  if (!context) {
    throw new Error('useResumeForm must be used within ResumeFormProvider');
  }
  return context;
}
