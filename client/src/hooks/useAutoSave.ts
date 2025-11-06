/**
 * useAutoSave Hook
 * Handles automatic saving of resume data with debouncing and retry logic
 */

import { useEffect, useRef, useCallback } from 'react';
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

interface UseAutoSaveOptions {
  resumeId: string | null;
  formData: ResumeFormData;
  isDirty: boolean;
  isNewResume: boolean;
  setSaveStatus: (status: SaveStatus) => void;
  setIsDirty: (dirty: boolean) => void;
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
  saveInterval = 30000, // 30 seconds
  maxRetries = 3,
}: UseAutoSaveOptions) {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const isSavingRef = useRef(false);

  // Save all form data to backend
  const saveAllData = useCallback(async (): Promise<void> => {
    if (!resumeId || isNewResume || !isDirty || isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      // Save Personal Info
      if (formData.personalInfo) {
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
      }

      // Save Summary (if exists)
      if (formData.summary?.content?.trim()) {
        await saveSummary(resumeId, {
          content: formData.summary.content,
        });
      }

      // Save Experiences (if exists)
      if (formData.experiences && formData.experiences.length > 0) {
        await saveExperiences(resumeId, formData.experiences);
      }

      // Save Education (if exists)
      if (formData.education && formData.education.length > 0) {
        await saveEducation(resumeId, formData.education);
      }

      // Save Projects (if exists)
      if (formData.projects && formData.projects.length > 0) {
        await saveProjects(resumeId, formData.projects);
      }

      // Save Skills (if exists)
      if (formData.skills && formData.skills.length > 0) {
        await saveSkills(resumeId, formData.skills);
      }

      // Success!
      setSaveStatus('saved');
      setIsDirty(false); // Mark as clean after successful save
      retryCountRef.current = 0; // Reset retry count on success
      onSaveSuccess?.();

      // Reset to 'idle' after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
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

  // Auto-save effect: debounced save every 30 seconds if dirty
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't auto-save if:
    // - No resume ID (new resume)
    // - Not dirty (no changes)
    // - Currently saving
    if (!resumeId || isNewResume || !isDirty || isSavingRef.current) {
      return;
    }

    // Set up debounced save
    saveTimeoutRef.current = setTimeout(() => {
      saveAllData();
    }, saveInterval);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [resumeId, isNewResume, isDirty, saveInterval, saveAllData]);

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
