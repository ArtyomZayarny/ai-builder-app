/**
 * PDF Parser Service
 * Extracts resume data from uploaded PDF files
 */

import type { Experience, Education, Project, Skill } from '@resume-builder/shared';
import { createRequire } from 'module';

// Use createRequire for CommonJS module
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

interface ParsedResumeData {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
  summary?: {
    content?: string;
  };
  experiences?: Experience[];
  education?: Education[];
  projects?: Project[];
  skills?: Skill[];
  confidence: number; // Overall confidence score (0-1)
}

/**
 * Extract text from PDF buffer
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract email from text
 */
function extractEmail(text: string): string | undefined {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches?.[0];
}

/**
 * Extract phone number from text
 */
function extractPhone(text: string): string | undefined {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const matches = text.match(phoneRegex);
  return matches?.[0]?.trim();
}

/**
 * Extract LinkedIn URL from text
 */
function extractLinkedIn(text: string): string | undefined {
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/gi;
  const matches = text.match(linkedinRegex);
  return matches?.[0];
}

/**
 * Extract portfolio/website URL from text
 */
function extractPortfolio(text: string): string | undefined {
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g;
  const matches = text.match(urlRegex);
  // Filter out common non-portfolio URLs
  const filtered = matches?.filter(
    url => !url.includes('linkedin.com') && !url.includes('github.com') && !url.includes('gmail.com')
  );
  return filtered?.[0];
}

/**
 * Extract name (usually first line or near email)
 */
function extractName(text: string): string | undefined {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Name is usually in the first few lines, before email
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Skip if it's an email, phone, or URL
    if (line.includes('@') || /^\d/.test(line) || line.startsWith('http')) {
      continue;
    }
    // Name is usually 2-4 words, title case
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      return line;
    }
  }
  
  return undefined;
}

/**
 * Extract location from text
 */
function extractLocation(text: string): string | undefined {
  // Look for common location patterns (City, State or City, Country)
  const locationRegex = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|[A-Z][a-z]+)/g;
  const matches = text.match(locationRegex);
  return matches?.[0];
}

/**
 * Extract summary/objective section
 */
function extractSummary(text: string): string | undefined {
  const summaryKeywords = ['summary', 'objective', 'profile', 'about', 'overview'];
  const lines = text.split('\n').map(line => line.trim());
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (summaryKeywords.some(keyword => line.includes(keyword))) {
      // Get next 3-5 lines as summary
      const summaryLines = lines.slice(i + 1, i + 6).filter(l => l.length > 20);
      if (summaryLines.length > 0) {
        return summaryLines.join(' ').substring(0, 500); // Limit to 500 chars
      }
    }
  }
  
  return undefined;
}

/**
 * Extract work experience
 */
function extractExperiences(text: string): Experience[] {
  const experiences: Experience[] = [];
  const experienceKeywords = ['experience', 'employment', 'work history', 'professional experience'];
  const lines = text.split('\n').map(line => line.trim());
  
  let inExperienceSection = false;
  let currentExp: Partial<Experience> | null = null;
  const descriptionLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    // Check if we're entering experience section
    if (!inExperienceSection && experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
      inExperienceSection = true;
      continue;
    }
    
    if (inExperienceSection) {
      // Check if line looks like a job role/company (usually has "at" or "|" or date)
      if (line.includes(' at ') || line.includes(' | ') || /\d{4}/.test(line)) {
        // Save previous experience if exists
        if (currentExp && currentExp.role && currentExp.company) {
          experiences.push({
            id: experiences.length + 1,
            company: currentExp.company,
            role: currentExp.role,
            location: currentExp.location || '',
            startDate: currentExp.startDate || '',
            endDate: currentExp.endDate || null,
            isCurrent: currentExp.isCurrent || false,
            description: descriptionLines.join('\n') || '',
            order: experiences.length,
          });
          descriptionLines.length = 0; // Clear for next experience
        }
        
        // Start new experience
        const parts = line.split(/ at | \| /);
        currentExp = {
          role: parts[0]?.trim() || '',
          company: parts[1]?.trim() || '',
        };
        
        // Try to extract dates
        const dateMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|Present|Current)/i);
        if (dateMatch) {
          currentExp.startDate = dateMatch[1] + '-01'; // Add month for format
          if (dateMatch[2] === 'Present' || dateMatch[2] === 'Current') {
            currentExp.endDate = null;
            currentExp.isCurrent = true;
          } else {
            currentExp.endDate = dateMatch[2] + '-01';
            currentExp.isCurrent = false;
          }
        }
      } else if (currentExp && line.length > 10) {
        // Add as description line
        const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
        if (cleanLine.length > 0) {
          descriptionLines.push(cleanLine);
        }
      }
    }
  }
  
  // Add last experience
  if (currentExp && currentExp.role && currentExp.company) {
    experiences.push({
      id: experiences.length + 1,
      company: currentExp.company,
      role: currentExp.role,
      location: currentExp.location || '',
      startDate: currentExp.startDate || '',
      endDate: currentExp.endDate || null,
      isCurrent: currentExp.isCurrent || false,
      description: descriptionLines.join('\n') || '',
      order: experiences.length,
    });
  }
  
  return experiences.slice(0, 10); // Limit to 10 experiences
}

/**
 * Extract education
 */
function extractEducation(text: string): Education[] {
  const education: Education[] = [];
  const educationKeywords = ['education', 'academic', 'university', 'college', 'degree'];
  const lines = text.split('\n').map(line => line.trim());
  
  let inEducationSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    if (!inEducationSection && educationKeywords.some(keyword => lowerLine.includes(keyword))) {
      inEducationSection = true;
      continue;
    }
    
    if (inEducationSection) {
      // Look for degree patterns (Bachelor's, Master's, PhD, etc.)
      const degreeMatch = line.match(/(Bachelor|Master|PhD|Doctorate|Associate).*?(?:in|of)\s+([A-Z][a-z\s]+)/i);
      if (degreeMatch) {
        const institutionMatch = lines[i + 1]?.match(/^([A-Z][a-z\s&]+(?:University|College|Institute|School))/);
        const dateMatch = line.match(/(\d{4})/);
        
        education.push({
          id: education.length + 1,
          institution: institutionMatch?.[1] || '',
          degree: degreeMatch[1] || '',
          field: degreeMatch[2] || '',
          graduationDate: dateMatch?.[1] ? dateMatch[1] + '-05' : '', // Add month for format
          location: '',
          description: '',
          order: education.length,
        });
      }
    }
  }
  
  return education.slice(0, 5); // Limit to 5 education entries
}

/**
 * Extract skills
 */
function extractSkills(text: string): Skill[] {
  const skills: Skill[] = [];
  const skillKeywords = ['skills', 'technical skills', 'competencies', 'proficiencies'];
  const lines = text.split('\n').map(line => line.trim());
  
  let inSkillsSection = false;
  const skillItems: string[] = [];
  let currentCategory = 'General';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    if (!inSkillsSection && skillKeywords.some(keyword => lowerLine.includes(keyword))) {
      inSkillsSection = true;
      continue;
    }
    
    if (inSkillsSection) {
      // Check if line is a category (ends with colon)
      if (line.endsWith(':')) {
        // Save previous category skills
        if (skillItems.length > 0) {
          skillItems.forEach((item) => {
            skills.push({
              id: skills.length + 1,
              name: item,
              category: currentCategory,
              order: skills.length,
            });
          });
          skillItems.length = 0;
        }
        currentCategory = line.slice(0, -1).trim();
      } else {
        // Extract skills (comma or pipe separated, or bullet points)
        const items = line.split(/[,|•\-\*]/).map(s => s.trim()).filter(s => s.length > 0);
        skillItems.push(...items);
      }
    }
  }
  
  // Save last category skills
  if (skillItems.length > 0) {
    skillItems.forEach((item) => {
      skills.push({
        id: skills.length + 1,
        name: item,
        category: currentCategory,
        order: skills.length,
      });
    });
  }
  
  // Remove duplicates
  const uniqueSkills = Array.from(
    new Map(skills.map(s => [s.name?.toLowerCase(), s])).values()
  );
  
  return uniqueSkills.slice(0, 50); // Limit to 50 skills total
}

/**
 * Calculate confidence score based on extracted data
 */
function calculateConfidence(data: ParsedResumeData): number {
  let score = 0;
  let maxScore = 0;
  
  // Personal info (30%)
  maxScore += 30;
  if (data.personalInfo?.name) score += 10;
  if (data.personalInfo?.email) score += 10;
  if (data.personalInfo?.phone) score += 5;
  if (data.personalInfo?.location) score += 5;
  
  // Summary (10%)
  maxScore += 10;
  if (data.summary?.content) score += 10;
  
  // Experience (30%)
  maxScore += 30;
  if (data.experiences && data.experiences.length > 0) {
    score += Math.min(30, data.experiences.length * 5);
  }
  
  // Education (15%)
  maxScore += 15;
  if (data.education && data.education.length > 0) {
    score += Math.min(15, data.education.length * 7);
  }
  
  // Skills (15%)
  maxScore += 15;
  if (data.skills && data.skills.length > 0) {
    score += Math.min(15, data.skills.length * 3);
  }
  
  return Math.min(1, score / maxScore);
}

/**
 * Parse PDF resume and extract structured data
 */
export async function parsePDFResume(buffer: Buffer): Promise<ParsedResumeData> {
  const text = await extractTextFromPDF(buffer);
  
  if (!text || text.length < 100) {
    throw new Error('PDF appears to be empty or unreadable');
  }
  
  const personalInfo = {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    location: extractLocation(text),
    linkedinUrl: extractLinkedIn(text),
    portfolioUrl: extractPortfolio(text),
  };
  
  const summary = {
    content: extractSummary(text),
  };
  
  const experiences = extractExperiences(text);
  const education = extractEducation(text);
  const skills = extractSkills(text);
  
  const parsedData: ParsedResumeData = {
    personalInfo: Object.keys(personalInfo).some(key => personalInfo[key as keyof typeof personalInfo])
      ? personalInfo
      : undefined,
    summary: summary.content ? summary : undefined,
    experiences: experiences.length > 0 ? experiences : undefined,
    education: education.length > 0 ? education : undefined,
    skills: skills.length > 0 ? skills : undefined,
    confidence: 0, // Will be calculated
  };
  
  // Calculate confidence
  parsedData.confidence = calculateConfidence(parsedData);
  
  return parsedData;
}

