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
  ReactNode,
  useEffect,
} from 'react';
import { useParams } from 'react-router-dom';
import { getPersonalInfo, getSummary } from '../services/resumeApi';

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
  // Experiences, Education, Projects, Skills will be added later
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

  // Load resume data if editing existing resume
  useEffect(() => {
    if (!isNewResume && resumeId) {
      loadResumeData(resumeId);
    }
  }, [resumeId, isNewResume]);

  const loadResumeData = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading resume data for ID:', id);

      // Load Personal Info
      try {
        const personalInfo = await getPersonalInfo(id);
        if (personalInfo) {
          setFormData(prev => ({
            ...prev,
            personalInfo: {
              name: personalInfo.name || '',
              role: personalInfo.role || '',
              email: personalInfo.email || '',
              phone: personalInfo.phone || '',
              location: personalInfo.location || '',
              linkedinUrl: personalInfo.linkedin_url || '',
              portfolioUrl: personalInfo.portfolio_url || '',
            },
          }));
        }
      } catch (err) {
        console.warn('No personal info found:', err);
      }

      // Load Summary
      try {
        const summary = await getSummary(id);
        if (summary) {
          setFormData(prev => ({
            ...prev,
            summary: {
              content: summary.content || '',
            },
          }));
        }
      } catch (err) {
        console.warn('No summary found:', err);
      }

      console.log('✅ Resume data loaded successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resume data');
      console.error('❌ Failed to load resume data:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
