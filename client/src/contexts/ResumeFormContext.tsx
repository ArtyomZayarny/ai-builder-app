/**
 * Resume Form Context
 * Global form state management for resume data
 */

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
  updateFormData: (section: keyof ResumeFormData, data: any) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  isLoading: boolean;
  error: string | null;
  resumeId: string | null;
  isNewResume: boolean;
}

const ResumeFormContext = createContext<ResumeFormContextValue | undefined>(undefined);

export function ResumeFormProvider({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const isNewResume = id === 'new';
  const resumeId = isNewResume ? null : id || null;

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
      // TODO: Implement API call to load resume data
      console.log('Loading resume data for ID:', id);
      // const response = await fetch(`/api/resumes/${id}`);
      // const data = await response.json();
      // setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resume data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = useCallback((section: keyof ResumeFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data,
    }));
    setIsDirty(true);
  }, []);

  const value: ResumeFormContextValue = {
    formData,
    updateFormData,
    isDirty,
    setIsDirty,
    isSaving,
    setIsSaving,
    isLoading,
    error,
    resumeId,
    isNewResume,
  };

  return <ResumeFormContext.Provider value={value}>{children}</ResumeFormContext.Provider>;
}

export function useResumeForm() {
  const context = useContext(ResumeFormContext);
  if (!context) {
    throw new Error('useResumeForm must be used within ResumeFormProvider');
  }
  return context;
}
