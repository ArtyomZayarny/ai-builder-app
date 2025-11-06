/**
 * AI API Service
 * Handles API calls to the AI enhancement backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AIEnhanceResponse {
  success: boolean;
  data?: {
    original: string;
    enhanced: string;
  };
  error?: string;
  retryAfter?: number;
}

/**
 * Enhance professional summary with AI
 */
export async function enhanceSummary(text: string): Promise<string> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  const response = await fetch(`${API_BASE_URL}/api/ai/enhance/summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 429) {
    const data: AIEnhanceResponse = await response.json();
    throw new Error(
      data.retryAfter
        ? `Rate limit exceeded. Please try again in ${data.retryAfter} seconds.`
        : 'Too many requests. Please try again later.'
    );
  }

  if (!response.ok) {
    const data: AIEnhanceResponse = await response.json();
    throw new Error(data.error || 'Failed to enhance summary');
  }

  const data: AIEnhanceResponse = await response.json();

  if (!data.data?.enhanced) {
    throw new Error('Invalid response from AI service');
  }

  return data.data.enhanced;
}

/**
 * Enhance work experience description with AI
 */
export async function enhanceExperience(
  role: string,
  company: string,
  description: string
): Promise<string> {
  if (!description || description.trim().length === 0) {
    throw new Error('Description cannot be empty');
  }

  if (!role || !company) {
    throw new Error('Role and company are required');
  }

  const response = await fetch(`${API_BASE_URL}/api/ai/enhance/experience`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role, company, description }),
  });

  if (response.status === 429) {
    const data: AIEnhanceResponse = await response.json();
    throw new Error(
      data.retryAfter
        ? `Rate limit exceeded. Please try again in ${data.retryAfter} seconds.`
        : 'Too many requests. Please try again later.'
    );
  }

  if (!response.ok) {
    const data: AIEnhanceResponse = await response.json();
    throw new Error(data.error || 'Failed to enhance experience');
  }

  const data: AIEnhanceResponse = await response.json();

  if (!data.data?.enhanced) {
    throw new Error('Invalid response from AI service');
  }

  return data.data.enhanced;
}

/**
 * Enhance project description with AI
 */
export async function enhanceProject(name: string, description: string): Promise<string> {
  if (!description || description.trim().length === 0) {
    throw new Error('Description cannot be empty');
  }

  if (!name) {
    throw new Error('Project name is required');
  }

  const response = await fetch(`${API_BASE_URL}/api/ai/enhance/project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  });

  if (response.status === 429) {
    const data: AIEnhanceResponse = await response.json();
    throw new Error(
      data.retryAfter
        ? `Rate limit exceeded. Please try again in ${data.retryAfter} seconds.`
        : 'Too many requests. Please try again later.'
    );
  }

  if (!response.ok) {
    const data: AIEnhanceResponse = await response.json();
    throw new Error(data.error || 'Failed to enhance project description');
  }

  const data: AIEnhanceResponse = await response.json();

  if (!data.data?.enhanced) {
    throw new Error('Invalid response from AI service');
  }

  return data.data.enhanced;
}

/**
 * Check AI service health
 */
export async function checkAIHealth(): Promise<{
  available: boolean;
  model: string;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/health`);

    if (!response.ok) {
      return {
        available: false,
        model: 'N/A',
        message: 'AI service is unavailable',
      };
    }

    const data = await response.json();
    return data.data || { available: false, model: 'N/A', message: 'Unknown status' };
  } catch {
    return {
      available: false,
      model: 'N/A',
      message: 'Failed to connect to AI service',
    };
  }
}
