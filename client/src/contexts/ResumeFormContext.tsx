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

  // Load resume data - stable function, doesn't depend on props/state
  const loadResumeData = useCallback(
    async (id: string) => {
      // Prevent duplicate loads
      if (loadingRef.current === id) {
        console.log('⏭️ Already loading resume:', id);
        return;
      }

      console.log('🔄 Loading resume data for ID:', id);
      loadingRef.current = id;
      setIsLoading(true);
      setError(null);

      try {
        // ✅ Load all data in parallel (6 requests simultaneously)
        const [personalInfoRes, summaryRes, experiencesRes, educationRes, projectsRes, skillsRes] =
          await Promise.allSettled([
            getPersonalInfo(id),
            getSummary(id),
            getExperiences(id),
            getEducation(id),
            getProjects(id),
            getSkills(id),
          ]);

        // ✅ ONE setState call → ONE re-render (instead of 6)
        setFormData({
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
            educationRes.status === 'fulfilled' && educationRes.value
              ? educationRes.value
              : undefined,
          projects:
            projectsRes.status === 'fulfilled' && projectsRes.value ? projectsRes.value : undefined,
          skills: skillsRes.status === 'fulfilled' && skillsRes.value ? skillsRes.value : undefined,
        });

        console.log('✅ Resume loaded successfully in ONE render!');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resume data');
        console.error('❌ Failed to load resume data:', err);
        loadingRef.current = null; // Allow retry on error
      } finally {
        setIsLoading(false);
      }
    },
    [] // Empty deps - function is stable, doesn't use external variables
  );

  // Load resume data on mount if editing existing resume
  useEffect(() => {
    if (!isNewResume && resumeId) {
      loadResumeData(resumeId);
    }
    // loadResumeData is stable (empty deps), so safe to omit from deps
    // Only resumeId and isNewResume trigger re-load
  }, [resumeId, isNewResume]);

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
    }),
    [formData, updateFormData, isDirty, isSaving, isLoading, error, resumeId, isNewResume]
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
