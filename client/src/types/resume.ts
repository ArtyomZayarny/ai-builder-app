/**
 * Resume Types
 * TypeScript interfaces for resume data
 */

import type { Experience, Education, Project, Skill } from '@resume-builder/shared';

export interface Resume {
  id: number;
  title: string;
  template: 'classic' | 'modern' | 'creative' | 'technical';
  accent_color: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  public_id: string;
}

// ResumeData type for templates (matches formData structure)
export interface ResumeData {
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
}

export interface ResumeCreateInput {
  title: string;
  template?: 'classic' | 'modern' | 'creative' | 'technical';
  accentColor?: string;
}

export interface ResumeCreateWithDataInput {
  title: string;
  template?: 'classic' | 'modern' | 'creative' | 'technical';
  accentColor?: string;
  personalInfo: {
    name: string;
    role: string;
    email: string;
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
}

export interface ResumeUpdateInput {
  title?: string;
  template?: 'classic' | 'modern' | 'creative' | 'technical';
  accentColor?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}
