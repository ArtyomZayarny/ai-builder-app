/**
 * PDF Parser API
 * Client-side API for PDF parsing operations
 */

import { BACKEND_URL } from '../config';

// eslint-disable-next-line no-constant-binary-expression
const API_BASE_URL = `${BACKEND_URL}/api` || 'http://localhost:3001/api';

export interface ParsedResumeData {
  personalInfo?: {
    name?: string;
    role?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
  summary?: {
    content?: string;
  };
  experiences?: Array<{
    id?: number;
    company: string;
    role: string;
    location?: string;
    startDate: string;
    endDate?: string | null;
    isCurrent: boolean;
    description: string;
    order: number;
  }>;
  education?: Array<{
    id?: number;
    institution: string;
    degree: string;
    field?: string;
    graduationDate?: string;
    location?: string;
    description?: string;
    order: number;
  }>;
  projects?: Array<{
    id?: number;
    name: string;
    url?: string;
    date?: string;
    description?: string;
    technologies?: string[];
    order: number;
  }>;
  skills?: Array<{
    id?: number;
    name: string;
    category?: string;
    order: number;
  }>;
  confidence: number;
  fileName?: string;
  fileSize?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
}

/**
 * Parse PDF resume
 */
export async function parsePDFResume(file: File): Promise<ParsedResumeData> {
  const formData = new FormData();
  formData.append('pdf', file);

  const response = await fetch(`${API_BASE_URL}/pdf/parse`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    const errorData = result as ErrorResponse;
    throw new Error(errorData.error || 'Failed to parse PDF');
  }

  return (result as ApiResponse<ParsedResumeData>).data;
}
