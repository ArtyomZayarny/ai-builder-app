/**
 * AI Service - Google Gemini Integration
 * Handles AI-powered content enhancement for resumes
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const AI_REQUEST_TIMEOUT = 30000; // 30 seconds

// Validate API key on module load
if (!GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY not found in environment variables. AI features will be disabled.');
}

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;
try {
  if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✅ Google Gemini AI initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Google Gemini AI:', error);
}

/**
 * Check if AI service is available
 */
export function isAIServiceAvailable(): boolean {
  return genAI !== null && GEMINI_API_KEY !== undefined;
}

/**
 * Get the AI model instance
 */
function getModel() {
  if (!genAI) {
    throw new Error('AI service is not available. Please check GEMINI_API_KEY.');
  }
  return genAI.getGenerativeModel({ model: GEMINI_MODEL });
}

/**
 * Base function to generate AI content with timeout
 */
async function generateContent(prompt: string): Promise<string> {
  if (!isAIServiceAvailable()) {
    throw new Error('AI service is not available');
  }

  const model = getModel();

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('AI request timeout - exceeded 30 seconds'));
    }, AI_REQUEST_TIMEOUT);
  });

  // Race between AI request and timeout
  try {
    const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);

    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('AI returned empty response');
    }

    return text.trim();
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
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
  originalDescription: string,
): Promise<string> {
  if (!originalDescription || originalDescription.trim().length === 0) {
    throw new Error('Original description cannot be empty');
  }

  const prompt = `You are a professional resume writer. Enhance the following work experience description for a ${role} position at ${company}.

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

  return await generateContent(prompt);
}

/**
 * Enhance project description
 * @param projectName - Name of the project
 * @param originalDescription - Original project description
 * @returns Enhanced project description
 */
export async function enhanceProjectDescription(
  projectName: string,
  originalDescription: string,
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

