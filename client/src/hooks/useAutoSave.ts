/**
 * useAutoSave Hook
 * Handles automatic saving of resume data with debouncing and retry logic
 */

import { useRef, useCallback } from 'react';
import {
  savePersonalInfo,
  saveSummary,
  saveExperiences,
  saveEducation,
  saveProjects,
  saveSkills,
} from '../services/resumeApi';
import type { SaveStatus } from '../contexts/ResumeFormContext';
import type { Experience, Education, Project, Skill } from '@resume-builder/shared';

// ResumeFormData type (matches ResumeFormContext)
interface ResumeFormData {
  personalInfo?: {
    name?: string;
    role?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    photoUrl?: string;
  };
  summary?: {
    content?: string;
  };
  experiences?: Experience[];
  education?: Education[];
  projects?: Project[];
  skills?: Skill[];
  selectedTemplate?: string;
}

type DirtyState = Partial<Record<keyof ResumeFormData | 'accentColor', boolean>>;

interface UseAutoSaveOptions {
  resumeId: string | null;
  formData: ResumeFormData;
  isDirty: DirtyState;
  isNewResume: boolean;
  setSaveStatus: (status: SaveStatus) => void;
  setIsDirty: (section: keyof ResumeFormData | 'accentColor', dirty: boolean) => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  saveInterval?: number; // milliseconds (default: 30000 = 30 seconds)
  maxRetries?: number; // default: 3
}

export function useAutoSave({
  resumeId,
  formData,
  isDirty,
  isNewResume,
  setSaveStatus,
  setIsDirty,
  onSaveSuccess,
  onSaveError,
  saveInterval: _saveInterval = 30000, // 30 seconds
  maxRetries = 3,
}: UseAutoSaveOptions) {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const isSavingRef = useRef(false);

  // Save only dirty sections to backend
  const saveAllData = useCallback(async (): Promise<void> => {
    // Check if any section is dirty
    const hasDirtySections = Object.values(isDirty).some(dirty => dirty === true);

    if (!resumeId || isNewResume || !hasDirtySections || isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      // Save Personal Info (only if dirty)
      if (isDirty.personalInfo && formData.personalInfo) {
        await savePersonalInfo(resumeId, {
          name: formData.personalInfo.name || '',
          role: formData.personalInfo.role || '',
          email: formData.personalInfo.email || '',
          phone: formData.personalInfo.phone || '',
          location: formData.personalInfo.location || '',
          linkedinUrl: formData.personalInfo.linkedinUrl || '',
          portfolioUrl: formData.personalInfo.portfolioUrl || '',
          photoUrl: formData.personalInfo.photoUrl || '',
        });
        setIsDirty('personalInfo', false);
      }

      // Save Summary (only if dirty)
      if (isDirty.summary && formData.summary?.content?.trim()) {
        await saveSummary(resumeId, {
          content: formData.summary.content,
        });
        setIsDirty('summary', false);
      }

      // Save Experiences (only if dirty)
      if (isDirty.experiences && formData.experiences && formData.experiences.length > 0) {
        await saveExperiences(resumeId, formData.experiences);
        setIsDirty('experiences', false);
      }

      // Save Education (only if dirty)
      if (isDirty.education && formData.education && formData.education.length > 0) {
        await saveEducation(resumeId, formData.education);
        setIsDirty('education', false);
      }

      // Save Projects (only if dirty)
      if (isDirty.projects && formData.projects && formData.projects.length > 0) {
        await saveProjects(resumeId, formData.projects);
        setIsDirty('projects', false);
      }

      // Save Skills (only if dirty)
      if (isDirty.skills && formData.skills && formData.skills.length > 0) {
        await saveSkills(resumeId, formData.skills);
        setIsDirty('skills', false);
      }

      // Note: selectedTemplate and accentColor are saved via localStorage,
      // so we just mark them as clean
      if (isDirty.selectedTemplate) {
        setIsDirty('selectedTemplate', false);
      }
      if (isDirty.accentColor) {
        setIsDirty('accentColor', false);
      }

      // Success!
      setSaveStatus('saved');
      retryCountRef.current = 0; // Reset retry count on success
      onSaveSuccess?.();

      // Reset to 'idle' after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');

      // Retry logic with exponential backoff
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 10000); // Max 10 seconds

        setTimeout(() => {
          saveAllData();
        }, backoffDelay);
      } else {
        // Max retries reached
        const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
        onSaveError?.(error instanceof Error ? error : new Error(errorMessage));
        retryCountRef.current = 0; // Reset for next attempt
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [
    resumeId,
    formData,
    isNewResume,
    isDirty,
    maxRetries,
    setSaveStatus,
    setIsDirty,
    onSaveSuccess,
    onSaveError,
  ]);

  // Auto-save disabled - only manual save on section change
  // Removed automatic saving to prevent infinite loops and unwanted saves

  // Manual save function (for immediate save on navigation, etc.)
  const manualSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await saveAllData();
  }, [saveAllData]);

  return {
    manualSave,
  };
}
