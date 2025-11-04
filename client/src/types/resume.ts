/**
 * Resume Types
 * TypeScript interfaces for resume data
 */

export interface Resume {
  id: number;
  title: string;
  template: 'classic' | 'modern' | 'creative' | 'technical';
  accent_color: string;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
}

export interface ResumeCreateInput {
  title: string;
  template?: 'classic' | 'modern' | 'creative' | 'technical';
  accentColor?: string;
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
