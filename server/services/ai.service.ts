/**
 * AI Service - Google Gemini Integration
 * Handles AI-powered content enhancement for resumes
 */

import dotenv from 'dotenv';

dotenv.config();

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_URL =
  process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';
const AI_REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Check if AI service is available
 */
export function isAIServiceAvailable(): boolean {
  const isAvailable = GEMINI_API_KEY !== undefined && GEMINI_API_KEY.trim().length > 0;

  if (!isAvailable) {
    console.warn('⚠️  AI service is not available:', {
      hasApiKey: GEMINI_API_KEY !== undefined,
      apiKeyLength: GEMINI_API_KEY?.length || 0,
    });
  }

  return isAvailable;
}

/**
 * List available models (for debugging)
 */
export async function listAvailableModels(): Promise<string[]> {
  if (!isAIServiceAvailable() || !GEMINI_API_KEY) {
    throw new Error('AI service is not available');
  }

  const baseUrl = GEMINI_API_URL.replace(/\/$/, '');
  const listUrl = `${baseUrl}/models?key=${encodeURIComponent(GEMINI_API_KEY.trim())}`;

  try {
    const response = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as { models?: Array<{ name: string }> };
    const models = data.models?.map((m: { name: string }) => m.name) || [];
    return models;
  } catch (error) {
    return [];
  }
}

// Validate API key on module load
if (!GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set. AI features will be disabled.');
}

/**
 * Base function to generate AI content with timeout using direct HTTP requests
 */
async function generateContent(prompt: string): Promise<string> {
  if (!isAIServiceAvailable() || !GEMINI_API_KEY) {
    throw new Error('AI service is not available');
  }

  // Normalize API URL (remove trailing slash if present)
  const baseUrl = GEMINI_API_URL.replace(/\/$/, '');
  
  // Try both formats: with key in URL (for v1beta) and with header (for v1)
  // First, try with key in URL parameter (more compatible)
  const apiUrl = `${baseUrl}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY.trim())}`;

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('AI request timeout - exceeded 30 seconds'));
    }, AI_REQUEST_TIMEOUT);
  });

  // Create request body
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  // Race between AI request and timeout
  try {
    console.log('🌐 Making fetch request to Gemini API');
    console.log('   URL:', apiUrl.replace(GEMINI_API_KEY || '', '***KEY***'));
    console.log('   Model:', GEMINI_MODEL);
    
    // Try with key in URL first (more compatible with different API versions)
    const fetchPromise = fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }).then(async response => {
      console.log('📡 Gemini API response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error('   Parsed error data:', JSON.stringify(errorData, null, 2));
        } catch {
          errorData = { message: errorText };
          console.error('   Could not parse error as JSON');
        }
        throw {
          status: response.status,
          statusText: response.statusText,
          message: errorData.error?.message || errorData.message || `HTTP ${response.status}`,
          errorData,
        };
      }
      
      const jsonData = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };
      console.log('✅ Gemini API response received, candidates:', jsonData.candidates?.length || 0);
      return jsonData;
    });

    const result = (await Promise.race([fetchPromise, timeoutPromise])) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    // Extract text from Gemini API response
    const candidates = result.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('AI returned no candidates');
    }

    const content = candidates[0].content;
    if (!content || !content.parts || content.parts.length === 0) {
      throw new Error('AI returned empty content');
    }

    const text = content.parts[0].text;
    if (!text || text.trim().length === 0) {
      throw new Error('AI returned empty response');
    }

    return text.trim();
  } catch (error: any) {
    // Provide more specific error messages
    if (error?.status === 401) {
      throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY configuration.');
    }
    if (error?.status === 429) {
      throw new Error('Gemini API quota exceeded. Please check your API usage limits.');
    }
    if (
      error?.message?.includes('SAFETY') ||
      error?.errorData?.error?.message?.includes('SAFETY')
    ) {
      throw new Error('Content was blocked by safety filters. Please try with different content.');
    }
    if (error?.message?.includes('timeout') || error?.message?.includes('TIMEOUT')) {
      throw new Error('AI request timed out. Please try again.');
    }
    if (error instanceof Error) {
      throw new Error(`AI generation failed: ${error.message || 'Unknown error'}`);
    }
    throw new Error(`AI generation failed: ${error?.message || 'Unknown error occurred'}`);
  }
}

/**
 * Enhance professional summary
 * @param originalText - The original summary text
 * @returns Enhanced professional summary
 */
export async function enhanceProfessionalSummary(originalText: string): Promise<string> {
  if (!originalText || originalText.trim().length === 0) {
    throw new Error('Original text cannot be empty');
  }

  const prompt = `You are a professional resume writer. Enhance the following professional summary to make it more impactful, confident, and achievement-oriented. 

Guidelines:
- Use active voice and strong action verbs
- Be confident and professional
- Focus on achievements and value proposition
- Keep it concise (2-4 sentences)
- Maintain the original meaning and facts
- Do NOT add fictional achievements or skills
- Do NOT use first person (I, my, me)

Original summary:
${originalText}

Enhanced summary:`;

  return await generateContent(prompt);
}

/**
 * Enhance work experience description
 * @param role - Job title
 * @param company - Company name
 * @param originalDescription - Original job description
 * @returns Enhanced work experience description
 */
export async function enhanceWorkExperience(
  role: string,
  company: string,
  originalDescription: string
): Promise<string> {
  console.log('🔧 enhanceWorkExperience called:', {
    role: role || '(empty)',
    company: company || '(empty)',
    descriptionLength: originalDescription?.length || 0,
  });

  if (!originalDescription || originalDescription.trim().length === 0) {
    console.error('❌ Original description is empty');
    throw new Error('Original description cannot be empty');
  }

  // Build context for the prompt
  const contextParts: string[] = [];
  if (role && role.trim()) {
    contextParts.push(`a ${role} position`);
  }
  if (company && company.trim()) {
    contextParts.push(`at ${company}`);
  }
  const context = contextParts.length > 0 ? ` for ${contextParts.join(' ')}` : '';
  console.log('📝 Built context:', context || '(no context)');

  const prompt = `You are a professional resume writer. Enhance the following work experience description${context}.

Guidelines:
- Use strong action verbs (Led, Developed, Implemented, etc.)
- Be achievement-oriented with measurable impact where possible
- Use bullet points (start each with •)
- Keep it professional and confident
- Maintain the original facts and context
- Do NOT add fictional achievements or metrics
- Use active voice
- Focus on results and impact

Original description:
${originalDescription}

Enhanced description:`;

  console.log('📝 Prompt length:', prompt.length);
  console.log('🚀 Calling generateContent...');
  
  try {
    const result = await generateContent(prompt);
    console.log('✅ generateContent successful, result length:', result?.length);
    return result;
  } catch (error) {
    console.error('❌ Error in generateContent:', error);
    console.error('   Error type:', typeof error);
    console.error('   Error message:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Enhance project description
 * @param projectName - Name of the project
 * @param originalDescription - Original project description
 * @returns Enhanced project description
 */
export async function enhanceProjectDescription(
  projectName: string,
  originalDescription: string
): Promise<string> {
  if (!originalDescription || originalDescription.trim().length === 0) {
    throw new Error('Original description cannot be empty');
  }

  const prompt = `You are a professional resume writer. Enhance the following project description for "${projectName}".

Guidelines:
- Highlight technical achievements and impact
- Use clear, concise language
- Focus on your role and contributions
- Include relevant technologies naturally
- Be specific about outcomes
- Use bullet points if appropriate (start with •)
- Do NOT add fictional features or technologies
- Keep it professional

Original description:
${originalDescription}

Enhanced description:`;

  return await generateContent(prompt);
}

/**
 * Health check for AI service
 */
export async function healthCheck(): Promise<{
  available: boolean;
  model: string;
  message: string;
}> {
  const available = isAIServiceAvailable();

  return {
    available,
    model: available ? GEMINI_MODEL : 'N/A',
    message: available
      ? 'AI service is operational'
      : 'AI service is not available - GEMINI_API_KEY not configured',
  };
}
