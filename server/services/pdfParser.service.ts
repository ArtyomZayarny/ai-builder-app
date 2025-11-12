/**
 * PDF Parser Service
 * Extracts resume data from uploaded PDF files
 */

import type { Experience, Education, Project, Skill } from '@resume-builder/shared';
import { createRequire } from 'module';

// Lazy import pdf-parse to avoid loading it on module initialization
// This prevents errors in serverless environments where @napi-rs/canvas is not available
let pdfParse: any = null;

function getPdfParse() {
  if (!pdfParse) {
    try {
      const require = createRequire(import.meta.url);
      const pdfParseModule = require('pdf-parse');

      // pdf-parse v2.4.5 exports an object with PDFParse function
      // Use PDFParse property which is the actual parse function
      if (pdfParseModule.PDFParse && typeof pdfParseModule.PDFParse === 'function') {
        pdfParse = pdfParseModule.PDFParse;
      } else {
        throw new Error(
          'pdf-parse did not export PDFParse function. Available keys: ' +
            Object.keys(pdfParseModule).join(', ')
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('did not export')) {
        throw error;
      }
      throw new Error(
        'PDF parsing is not available in this environment. pdf-parse requires native dependencies that are not available in serverless environments.'
      );
    }
  }
  return pdfParse;
}

interface ParsedResumeData {
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
    const PDFParseClass = getPdfParse();
    // PDFParse is a class, need to instantiate it with 'new' and pass { data: buffer }
    const pdfParser = new PDFParseClass({ data: buffer });
    // Call getText() method to extract text
    const result = await pdfParser.getText();
    let text = result.text;
    
    // Clean null bytes and control characters immediately after extraction
    // This prevents issues with PostgreSQL and improves parsing accuracy
    text = text.replace(/\u0000/g, ''); // Remove null bytes
    text = text.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove other control chars
    
    // Remove common icon/symbol characters (Unicode ranges for icons, emojis, symbols)
    // These can interfere with parsing
    text = text.replace(/[\u2600-\u26FF]/g, ''); // Miscellaneous Symbols
    text = text.replace(/[\u2700-\u27BF]/g, ''); // Dingbats
    text = text.replace(/[\uFE00-\uFE0F]/g, ''); // Variation Selectors
    text = text.replace(/[\u200D]/g, ''); // Zero Width Joiner
    text = text.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Zero-width spaces/joiners
    text = text.replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, ' '); // Bullet points → space
    text = text.replace(/[\u2190-\u21FF]/g, ''); // Arrows
    text = text.replace(/[\u2300-\u23FF]/g, ''); // Miscellaneous Technical
    
    text = text.replace(/\t+/g, ' '); // Replace tabs with single space (preserve newlines)
    // Don't normalize all whitespace - we need newlines for structure
    // Just clean up multiple spaces on the same line
    text = text.replace(/[ \t]{2,}/g, ' '); // Replace multiple spaces/tabs with single space
    
    return text;
  } catch (error) {
    if (error instanceof Error && error.message.includes('not available')) {
      throw error; // Re-throw our custom error
    }
    throw new Error(
      `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract email from text
 * Improved to find emails even with spaces, line breaks, or special formatting
 * Handles cases where comma is used instead of dot (common PDF parsing issue)
 * Ignores phone numbers and icons that might be adjacent
 */
function extractEmail(text: string): string | undefined {
  // First, extract phone number to exclude it from email search
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phoneMatches = text.match(phoneRegex);
  
  // Standard email regex - more reliable
  // Pattern: local-part@domain.tld
  // Local part can contain: letters, numbers, dots, underscores, hyphens, plus signs
  // Domain can contain: letters, numbers, dots, hyphens
  const emailRegex = /\b[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}\b/g;
  
  // First try standard regex
  let matches = text.match(emailRegex);
  
  // If no matches, try more flexible pattern (handles spaces/newlines in email)
  if (!matches || matches.length === 0) {
    // Pattern that allows spaces/newlines between parts
    const flexibleRegex = /[a-zA-Z0-9](?:[a-zA-Z0-9._\s-]*[a-zA-Z0-9])?\s*@\s*[a-zA-Z0-9](?:[a-zA-Z0-9.\s-]*[a-zA-Z0-9])?\s*\.\s*[a-zA-Z]{2,}/g;
    matches = text.match(flexibleRegex);
  }
  
  // If still no matches, try pattern that handles comma instead of dot (common PDF issue)
  if (!matches || matches.length === 0) {
    // Pattern that allows comma or other punctuation before TLD
    // e.g., "timaz.dev@gmail,com" or "timaz.dev@gmail.com"
    const commaRegex = /[a-zA-Z0-9](?:[a-zA-Z0-9._\s-]*[a-zA-Z0-9])?\s*@\s*[a-zA-Z0-9](?:[a-zA-Z0-9.\s-]*[a-zA-Z0-9])?\s*[,\.]\s*[a-zA-Z]{2,}/g;
    matches = text.match(commaRegex);
  }
  
  // Also try to find email-like patterns with @ symbol even if TLD separator is wrong
  if (!matches || matches.length === 0) {
    // Very flexible pattern: anything@anything followed by comma/dot and 2+ letters
    const veryFlexibleRegex = /[a-zA-Z0-9](?:[a-zA-Z0-9._\s-]*[a-zA-Z0-9])?\s*@\s*[a-zA-Z0-9](?:[a-zA-Z0-9._\s-]*[a-zA-Z0-9])?\s*[,\.;]\s*[a-zA-Z]{2,}/g;
    matches = text.match(veryFlexibleRegex);
  }
  
  // Last resort: find @ symbol and try to extract email around it
  if (!matches || matches.length === 0) {
    const atIndex = text.indexOf('@');
    if (atIndex > 0 && atIndex < text.length - 5) {
      // Extract context around @ symbol (30 chars before, 20 chars after)
      const start = Math.max(0, atIndex - 30);
      const end = Math.min(text.length, atIndex + 20);
      const context = text.substring(start, end);
      
      // Try to extract email from context
      const contextRegex = /[a-zA-Z0-9](?:[a-zA-Z0-9._\s-]*[a-zA-Z0-9])?\s*@\s*[a-zA-Z0-9](?:[a-zA-Z0-9._\s-]*[a-zA-Z0-9])?\s*[,\.;]?\s*[a-zA-Z]{2,}/g;
      const contextMatches = context.match(contextRegex);
      if (contextMatches && contextMatches.length > 0) {
        matches = contextMatches;
      }
    }
  }
  
  if (matches && matches.length > 0) {
    // Filter out matches that start with phone numbers
    const validMatches = matches.filter(match => {
      // Check if match starts with a phone number pattern
      if (/^\d{4,}/.test(match.trim())) {
        return false; // Likely a phone number prefix
      }
      // Check if there's a phone number immediately before the match in text
      if (phoneMatches) {
        for (const phone of phoneMatches) {
          const phoneIndex = text.indexOf(phone);
          const matchIndex = text.indexOf(match);
          // If phone is right before email (within 5 chars), exclude it
          if (matchIndex > phoneIndex && matchIndex < phoneIndex + phone.length + 5) {
            // Extract email part after phone
            const afterPhone = text.substring(phoneIndex + phone.length, matchIndex + match.length);
            // If email starts right after phone, it's contaminated
            if (afterPhone.trim().startsWith(match.trim().substring(0, 5))) {
              return false;
            }
          }
        }
      }
      return true;
    });
    
    if (validMatches.length === 0) {
      // If all matches were filtered, try to clean the first match
      let email = matches[0].trim();
      
      // Remove leading digits that look like phone numbers
      email = email.replace(/^\d{4,}/, '');
      
      // If email still starts with digits, try to find @ and extract from there
      if (/^\d/.test(email)) {
        const atIdx = email.indexOf('@');
        if (atIdx > 0) {
          // Extract local part starting from first letter before @
          const beforeAt = email.substring(0, atIdx);
          const firstLetterIndex = beforeAt.search(/[a-zA-Z]/);
          if (firstLetterIndex >= 0) {
            email = email.substring(firstLetterIndex);
          }
        }
      }
      
      validMatches.push(email);
    }
    
    // Take the first valid match and clean it up
    let email = validMatches[0].trim();
    
    // Remove all whitespace (spaces, newlines, tabs) from email first
    email = email.replace(/\s+/g, '');
    
    // Remove common icon/symbol characters (Unicode ranges for icons)
    email = email.replace(/[\u2600-\u26FF\u2700-\u27BF\uFE00-\uFE0F\u200D\u200B-\u200D\uFEFF]/g, ''); // Emoji and symbols
    email = email.replace(/[^\x00-\x7F]/g, (char) => {
      // Keep only ASCII printable characters, @, and dots
      const code = char.charCodeAt(0);
      if (code >= 32 && code <= 126) return char; // ASCII printable
      if (char === '@' || char === '.') return char;
      return ''; // Remove other Unicode
    });
    
    // CRITICAL: Remove leading digits that might be from phone numbers
    // Pattern: if email starts with 4+ digits, they're likely from phone number
    // e.g., "5019311timaz.dev@gmail.com" -> "timaz.dev@gmail.com"
    if (/^\d{4,}/.test(email)) {
      // Find the @ symbol
      const atIdx = email.indexOf('@');
      if (atIdx > 0) {
        // Extract local part
        const localPart = email.substring(0, atIdx);
        // Find first letter in local part
        const firstLetterMatch = localPart.match(/[a-zA-Z]/);
        if (firstLetterMatch && firstLetterMatch.index !== undefined) {
          // Remove everything before first letter
          email = email.substring(firstLetterMatch.index);
        } else {
          // If no letters before @, remove leading digits
          email = email.replace(/^\d+/, '');
        }
      } else {
        // No @ found, just remove leading digits
        email = email.replace(/^\d+/, '');
      }
    }
    
    // Fix common formatting issues
    email = email.replace(/\.\s*\./g, '.'); // Fix "timaz . dev" -> "timaz.dev"
    email = email.replace(/\s*@\s*/g, '@'); // Ensure @ has no spaces
    
    // CRITICAL: Replace comma/semicolon before TLD with dot (common PDF parsing issue)
    // e.g., "timaz.dev@gmail,com" -> "timaz.dev@gmail.com"
    // e.g., "timaz.dev@gmail;com" -> "timaz.dev@gmail.com"
    // Pattern: @domain,com or @domain;com -> @domain.com
    email = email.replace(/@([a-zA-Z0-9-]+)[,;]([a-zA-Z]{2,})$/, '@$1.$2');
    
    // Also handle cases in local part if comma is used instead of dot
    // e.g., "timaz,dev@gmail.com" -> "timaz.dev@gmail.com"
    const atIndex = email.indexOf('@');
    if (atIndex > 0) {
      const localPart = email.substring(0, atIndex);
      const domainPart = email.substring(atIndex);
      // Replace commas in local part with dots (common in PDFs)
      const cleanedLocal = localPart.replace(/,/g, '.');
      email = cleanedLocal + domainPart;
    }
    
    // Ensure . has no spaces and is correct
    email = email.replace(/\s*\.\s*/g, '.');
    
    // Final cleanup: replace any remaining commas/semicolons in domain part with dots
    // This handles cases like "gmail,com" or "gmail;com"
    const atIdx = email.indexOf('@');
    if (atIdx > 0) {
      const domain = email.substring(atIdx + 1);
      // Replace commas/semicolons that are likely meant to be dots
      const cleanedDomain = domain.replace(/[,;](?=[a-zA-Z]{2,}$)/, '.');
      email = email.substring(0, atIdx + 1) + cleanedDomain;
    }
    
    // Remove any leading/trailing non-email characters
    email = email.replace(/^[^a-zA-Z0-9]+/, ''); // Remove leading non-alphanumeric
    email = email.replace(/[^a-zA-Z0-9.@-]+$/, ''); // Remove trailing non-email chars
    
    // Validate the cleaned email
    const validEmailRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
    if (validEmailRegex.test(email)) {
      return email;
    }
  }
  
  return undefined;
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
 * Improved to capture full URLs including long usernames
 * Handles URLs that are split across multiple lines
 */
function extractLinkedIn(text: string): string | undefined {
  // First, try to find LinkedIn URL patterns that might be split across lines
  // Look for "linkedin.com/in/" pattern and reconstruct the URL
  const linkedinPattern = /linkedin\.com\/in\//gi;
  const matches = text.match(linkedinPattern);
  
  if (matches && matches.length > 0) {
    // Find the position of the first match
    const matchIndex = text.toLowerCase().indexOf('linkedin.com/in/');
    if (matchIndex >= 0) {
      // Extract context around the match (100 chars before, 100 chars after)
      const start = Math.max(0, matchIndex - 100);
      const end = Math.min(text.length, matchIndex + 150);
      const context = text.substring(start, end);
      
      // Try to reconstruct the URL by finding the start (http/https/www) and end
      // Remove all whitespace (spaces, newlines, tabs) from the context
      const normalizedContext = context.replace(/\s+/g, '');
      
      // Now search for the full URL in normalized context
      const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-]+\/?/gi;
      const urlMatches = normalizedContext.match(linkedinRegex);
      
      if (urlMatches && urlMatches.length > 0) {
        let url = urlMatches[0].trim();
        // Ensure it has https:// prefix
        if (!url.startsWith('http')) {
          url = 'https://' + (url.startsWith('www.') ? url : 'www.' + url);
        }
        // Remove trailing slash if present
        url = url.replace(/\/$/, '');
        return url;
      }
    }
  }
  
  // Fallback: try standard regex on normalized text (without newlines/spaces in URLs)
  // This handles cases where URL is split but still recognizable
  const normalizedText = text.replace(/(https?:\/\/[^\s]+)/g, (match) => {
    // Remove whitespace from URLs
    return match.replace(/\s+/g, '');
  });
  
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-]+\/?/gi;
  const fallbackMatches = normalizedText.match(linkedinRegex);
  if (fallbackMatches && fallbackMatches.length > 0) {
    let url = fallbackMatches[0].trim();
    // Ensure it has https:// prefix
    if (!url.startsWith('http')) {
      url = 'https://' + (url.startsWith('www.') ? url : 'www.' + url);
    }
    // Remove trailing slash if present
    url = url.replace(/\/$/, '');
    return url;
  }
  
  return undefined;
}

/**
 * Extract portfolio/website URL from text
 * Improved to capture full URLs and prioritize portfolio-like domains
 * Handles URLs that are split across multiple lines
 */
function extractPortfolio(text: string): string | undefined {
  // Strategy: Find URL patterns and reconstruct them by removing whitespace
  // This handles URLs split across lines
  
  // Find all potential URL starts (http://, https://, www.)
  const urlStartPattern = /(https?:\/\/|www\.)/gi;
  const urlCandidates: string[] = [];
  let match;
  
  // Reset regex lastIndex
  urlStartPattern.lastIndex = 0;
  
  while ((match = urlStartPattern.exec(text)) !== null) {
    const startIndex = match.index;
    // Extract potential URL (up to 200 chars after start)
    const urlEnd = Math.min(text.length, startIndex + 200);
    let potentialUrl = text.substring(startIndex, urlEnd);
    
    // Find where the URL ends (first space, newline, or closing bracket/paren)
    // But allow / in paths
    const urlEndMatch = potentialUrl.match(/^(https?:\/\/|www\.)[^\s\)\]\}]+/);
    if (urlEndMatch) {
      // Remove all whitespace from the URL
      const cleanUrl = urlEndMatch[0].replace(/\s+/g, '');
      urlCandidates.push(cleanUrl);
    }
  }
  
  if (urlCandidates.length === 0) return undefined;
  
  // Filter out common non-portfolio URLs
  const filtered = urlCandidates.filter(
    url =>
      !url.includes('linkedin.com') &&
      !url.includes('github.com') &&
      !url.includes('gmail.com') &&
      !url.includes('google.com') &&
      !url.includes('facebook.com') &&
      !url.includes('twitter.com')
  );
  
  if (filtered.length === 0) return undefined;
  
  // Prioritize URLs that look like portfolios (vercel.app, netlify.app, personal domains)
  const portfolioUrls = filtered.filter(url => 
    url.includes('vercel.app') || 
    url.includes('netlify.app') || 
    url.includes('portfolio') ||
    url.includes('.dev') ||
    url.includes('.io')
  );
  
  let url = (portfolioUrls.length > 0 ? portfolioUrls[0] : filtered[0]).trim();
  
  // Remove any remaining whitespace that might have been missed
  url = url.replace(/\s+/g, '');
  
  // Ensure it has https:// prefix
  if (!url.startsWith('http')) {
    url = 'https://' + (url.startsWith('www.') ? url : url);
  }
  
  // Remove trailing punctuation
  url = url.replace(/[.,;:!?]+$/, '');
  
  return url;
}

/**
 * Extract name (usually first line or near email)
 * Improved to handle all caps names and clean them properly
 */
function extractName(text: string): string | undefined {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Name is usually in the first few lines, before email
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    let line = lines[i];
    
    // Skip if it's an email, phone, or URL
    if (line.includes('@') || /^\d/.test(line) || line.startsWith('http')) {
      continue;
    }
    
    // Skip common section headers
    if (/^(experience|education|skills|summary|contact|about)/i.test(line)) {
      continue;
    }
    
    // Clean the line (remove null bytes, control chars)
    line = line.replace(/\u0000/g, '').replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
    
    // Name is usually 2-4 words, can be all caps or title case
    const words = line.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2 && words.length <= 4) {
      // If all caps, convert to title case for better display
      if (line === line.toUpperCase() && line.length < 50) {
        return words.map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
      }
      return line;
    }
  }

  return undefined;
}

/**
 * Extract professional role/title from text
 * Improved to prioritize header role over experience roles
 */
function extractRole(text: string): string | undefined {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Role keywords for identification
  const roleKeywords = [
    'developer',
    'engineer',
    'manager',
    'director',
    'specialist',
    'analyst',
    'designer',
    'architect',
    'consultant',
    'lead',
    'senior',
    'junior',
    'full',
    'stack',
    'frontend',
    'backend',
    'front',
    'end',
    'back',
    'software',
    'web',
    'mobile',
    'devops',
    'qa',
    'test',
    'programmer',
    'coder',
  ];

  // First, look for role in header area (first 8 lines) - this is usually the main title
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    let line = lines[i];
    
    // Skip if it's name, email, phone, or URL
    if (
      line.includes('@') ||
      /^\d/.test(line) ||
      line.startsWith('http') ||
      /^[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(line) // Likely a name (2-4 words, title case)
    ) {
      continue;
    }

    // Clean the line
    line = line.replace(/\u0000/g, '').replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();

    // Remove date patterns (e.g., "10/2023 04/2025", "2023-2025", etc.)
    const originalLine = line;
    line = line
      .replace(/\d{1,2}\/\d{4}/g, '')
      .replace(/\d{4}[-–]\d{4}/g, '')
      .replace(/\d{1,2}\/\d{4}\s*[-–]\s*\d{1,2}\/\d{4}/g, '')
      .trim();

    // Skip if line is empty after removing dates
    if (!line) continue;

    // Role is usually 2-6 words, often contains job-related keywords
    const words = line.split(/\s+/).filter(w => w.length > 0);
    const lowerLine = line.toLowerCase();
    
    // Check if it contains role keywords and is in reasonable length
    if (
      words.length >= 1 &&
      words.length <= 6 &&
      roleKeywords.some(keyword => lowerLine.includes(keyword))
    ) {
      // Prefer the cleaned version, but if it's too short, use original
      return line.length >= 3 ? line : originalLine;
    }
  }

  return undefined;
}

/**
 * Extract location from text
 * Improved to handle longer city/country names and special characters
 * Excludes common false positives like technology names
 */
function extractLocation(text: string): string | undefined {
  // Common location keywords to prioritize
  const locationKeywords = [
    'romania', 'usa', 'united states', 'uk', 'united kingdom', 'canada', 'australia',
    'germany', 'france', 'spain', 'italy', 'poland', 'ukraine', 'russia',
    'bucureşti', 'bucharest', 'london', 'paris', 'berlin', 'madrid', 'rome',
    'new york', 'san francisco', 'los angeles', 'chicago', 'boston', 'seattle',
    'toronto', 'vancouver', 'sydney', 'melbourne', 'amsterdam', 'dublin'
  ];
  
  // Technology/framework names to exclude (common false positives)
  const excludeKeywords = [
    'webpack', 'sass', 'scss', 'react', 'vue', 'angular', 'node', 'express',
    'typescript', 'javascript', 'python', 'java', 'php', 'ruby', 'go', 'rust',
    'redux', 'mobx', 'graphql', 'rest', 'api', 'html', 'css', 'json', 'xml',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'mongodb', 'postgresql',
    'mysql', 'redis', 'elasticsearch', 'nginx', 'apache', 'git', 'github'
  ];
  
  // More flexible regex that handles:
  // - City names with multiple words (e.g., "Bucureşti", "San Francisco")
  // - Country names with multiple words (e.g., "United States", "United Kingdom")
  // - Special characters in city names (e.g., "Bucureşti" with ş)
  const locationRegex = /([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+)*),\s*([A-ZÀ-ÿ]{2,}(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+)*)/g;
  const matches = text.match(locationRegex);
  
  if (matches && matches.length > 0) {
    // Filter out false positives (technology names, etc.)
    const validMatches = matches.filter(match => {
      const lowerMatch = match.toLowerCase();
      // Exclude if it contains technology keywords
      if (excludeKeywords.some(keyword => lowerMatch.includes(keyword))) {
        return false;
      }
      // Prefer matches that contain location keywords
      if (locationKeywords.some(keyword => lowerMatch.includes(keyword))) {
        return true;
      }
      // Accept if it looks like a real location (has common location words)
      const hasLocationWords = /\b(city|country|state|province|region|area|location|address)\b/i.test(match);
      if (hasLocationWords) {
        return false; // Skip if it's just a label
      }
      // Accept if it's reasonably long (real locations are usually longer)
      return match.length > 8;
    });
    
    if (validMatches.length > 0) {
      // Sort by length and location keyword priority
      const sorted = validMatches.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const aHasKeyword = locationKeywords.some(k => aLower.includes(k));
        const bHasKeyword = locationKeywords.some(k => bLower.includes(k));
        
        if (aHasKeyword && !bHasKeyword) return -1;
        if (!aHasKeyword && bHasKeyword) return 1;
        return b.length - a.length; // Prefer longer matches
      });
      
      return sorted[0].trim();
    }
    
    // If no valid matches, return the longest match that's not obviously wrong
    const sorted = matches.sort((a, b) => b.length - a.length);
    const longest = sorted[0].trim();
    const lowerLongest = longest.toLowerCase();
    
    // Only return if it doesn't contain obvious technology keywords
    if (!excludeKeywords.some(keyword => lowerLongest.includes(keyword))) {
      return longest;
    }
  }
  
  return undefined;
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
  const experienceKeywords = [
    'experience',
    'employment',
    'work history',
    'professional experience',
  ];
  const lines = text.split('\n').map(line => line.trim());

  let inExperienceSection = false;
  let currentExp: Partial<Experience & { startDate: string | null | undefined; endDate: string | null | undefined }> | null = null;
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
      if (line.includes(' at ') || line.includes(' | ') || /\d{1,2}\/\d{4}/.test(line) || /\d{4}[-–]\d{4}/.test(line)) {
        // Save previous experience if exists
        if (currentExp && currentExp.role && currentExp.company) {
          // Normalize dates: empty strings or undefined should be null
          const normalizedStartDate: string | null = (currentExp.startDate && typeof currentExp.startDate === 'string' && currentExp.startDate.trim() !== '') 
            ? currentExp.startDate 
            : null;
          const normalizedEndDate: string | null = (currentExp.endDate && typeof currentExp.endDate === 'string' && currentExp.endDate.trim() !== '') 
            ? currentExp.endDate 
            : null;
          
          experiences.push({
            id: experiences.length + 1,
            company: currentExp.company,
            role: currentExp.role,
            location: currentExp.location || '',
            startDate: normalizedStartDate ?? '',
            endDate: normalizedEndDate,
            isCurrent: currentExp.isCurrent || false,
            description: descriptionLines.join('\n') || '',
            order: experiences.length,
          });
          descriptionLines.length = 0; // Clear for next experience
        }

        // Start new experience
        // Handle different formats:
        // 1. "Role at Company" or "Role | Company"
        // 2. "Company | Role" (less common but possible)
        // 3. "Role" on one line, "Company" on next
        let role = '';
        let company = '';
        
        if (line.includes(' at ')) {
          const parts = line.split(' at ');
          role = parts[0]?.trim() || '';
          company = parts[1]?.trim() || '';
        } else if (line.includes(' | ')) {
          const parts = line.split(' | ');
          // Usually format is "Role | Company", but check if first part looks like a role
          const firstPart = parts[0]?.trim() || '';
          const secondPart = parts[1]?.trim() || '';
          
          // Check if first part contains role keywords
          const roleKeywords = ['developer', 'engineer', 'manager', 'director', 'specialist', 'analyst', 'designer'];
          const firstLower = firstPart.toLowerCase();
          
          if (roleKeywords.some(keyword => firstLower.includes(keyword))) {
            role = firstPart;
            company = secondPart;
          } else {
            // Might be "Company | Role" format
            role = secondPart;
            company = firstPart;
          }
        } else {
          // No separator, might be just role or just company
          // Check if it looks like a role (contains role keywords)
          const roleKeywords = ['developer', 'engineer', 'manager', 'director', 'specialist', 'analyst', 'designer'];
          const lowerLine = line.toLowerCase();
          if (roleKeywords.some(keyword => lowerLine.includes(keyword))) {
            role = line.trim();
          } else {
            company = line.trim();
          }
        }
        
        currentExp = {
          role: role,
          company: company,
        };

        // Try to extract dates (support both MM/YYYY and YYYY formats)
        const dateMatch = line.match(/(\d{1,2}\/\d{4}|\d{4})\s*[-–]\s*(\d{1,2}\/\d{4}|\d{4}|Present|Current)/i);
        if (dateMatch) {
          let startDate = dateMatch[1];
          let endDate = dateMatch[2];
          
          // Validate and convert startDate
          if (startDate && startDate.trim() !== '' && !startDate.match(/^\/+$/)) {
            // Convert MM/YYYY to YYYY-MM format
            if (startDate.includes('/')) {
              const parts = startDate.split('/');
              if (parts.length === 2 && parts[0] && parts[1]) {
                const month = parts[0].trim();
                const year = parts[1].trim();
                if (month && year && !isNaN(Number(month)) && !isNaN(Number(year))) {
                  startDate = `${year}-${month.padStart(2, '0')}`;
                  currentExp.startDate = startDate;
                } else {
                  console.log(`⚠️ [PDF Parser] Invalid startDate format: "${startDate}", setting to null`);
                  currentExp.startDate = undefined;
                }
              } else {
                console.log(`⚠️ [PDF Parser] Invalid startDate format: "${startDate}", setting to null`);
                currentExp.startDate = undefined;
              }
            } else if (startDate.match(/^\d{4}$/)) {
              // YYYY format
              startDate = startDate + '-01';
              currentExp.startDate = startDate;
            } else {
              console.log(`⚠️ [PDF Parser] Invalid startDate format: "${startDate}", setting to null`);
              currentExp.startDate = undefined;
            }
          } else {
            console.log(`⚠️ [PDF Parser] Empty or invalid startDate: "${startDate}", setting to null`);
            currentExp.startDate = undefined;
          }
          
          // Validate and convert endDate
          if (endDate === 'Present' || endDate === 'Current') {
            currentExp.endDate = undefined;
            currentExp.isCurrent = true;
          } else if (endDate && endDate.trim() !== '' && !endDate.match(/^\/+$/)) {
            if (endDate.includes('/')) {
              const parts = endDate.split('/');
              if (parts.length === 2 && parts[0] && parts[1]) {
                const month = parts[0].trim();
                const year = parts[1].trim();
                if (month && year && !isNaN(Number(month)) && !isNaN(Number(year))) {
                  endDate = `${year}-${month.padStart(2, '0')}`;
                  currentExp.endDate = endDate;
                  currentExp.isCurrent = false;
                } else {
                  console.log(`⚠️ [PDF Parser] Invalid endDate format: "${endDate}", setting to null`);
                  currentExp.endDate = undefined;
                  currentExp.isCurrent = false;
                }
              } else {
                console.log(`⚠️ [PDF Parser] Invalid endDate format: "${endDate}", setting to null`);
                currentExp.endDate = undefined;
                currentExp.isCurrent = false;
              }
            } else if (endDate.match(/^\d{4}$/)) {
              // YYYY format
              endDate = endDate + '-01';
              currentExp.endDate = endDate;
              currentExp.isCurrent = false;
            } else {
              console.log(`⚠️ [PDF Parser] Invalid endDate format: "${endDate}", setting to null`);
              currentExp.endDate = undefined;
              currentExp.isCurrent = false;
            }
          } else {
            console.log(`⚠️ [PDF Parser] Empty or invalid endDate: "${endDate}", setting to null`);
            currentExp.endDate = undefined;
            currentExp.isCurrent = false;
          }
        } else {
          // No date match found - set dates to undefined (will be converted to null later)
          currentExp.startDate = undefined;
          currentExp.endDate = undefined;
          currentExp.isCurrent = false;
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
    // Normalize dates: empty strings or undefined should be null
    const normalizedStartDate: string | null = (currentExp.startDate && typeof currentExp.startDate === 'string' && currentExp.startDate.trim() !== '') 
      ? currentExp.startDate 
      : null;
    const normalizedEndDate: string | null = (currentExp.endDate && typeof currentExp.endDate === 'string' && currentExp.endDate.trim() !== '') 
      ? currentExp.endDate 
      : null;
    
    experiences.push({
      id: experiences.length + 1,
      company: currentExp.company,
      role: currentExp.role,
      location: currentExp.location || '',
      startDate: normalizedStartDate ?? '',
      endDate: normalizedEndDate,
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
      const degreeMatch = line.match(
        /(Bachelor|Master|PhD|Doctorate|Associate).*?(?:in|of)\s+([A-Z][a-z\s]+)/i
      );
      if (degreeMatch) {
        const institutionMatch = lines[i + 1]?.match(
          /^([A-Z][a-z\s&]+(?:University|College|Institute|School))/
        );
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
 * Improved version that filters out garbage and stops at other sections
 */
function extractSkills(text: string): Skill[] {
  const skills: Skill[] = [];
  const skillKeywords = [
    'skills',
    'technical skills',
    'competencies',
    'proficiencies',
    'technologies',
  ];
  const lines = text.split('\n').map(line => line.trim());

  // Keywords that indicate we've left the skills section
  const sectionEndKeywords = [
    'experience',
    'work history',
    'employment',
    'education',
    'academic',
    'projects',
    'portfolio',
    'courses',
    'certifications',
    'interests',
    'languages',
    'references',
    'contact',
    'find me online',
    'linkedin',
    'github',
    'portfolio',
    'website',
    'email',
    'phone',
    'address',
  ];

  // Patterns to exclude (URLs, emails, page numbers, etc.)
  const excludePatterns = [
    /^https?:\/\//i, // URLs
    /^www\./i, // URLs without protocol
    /@.*\.(com|org|net|io|dev)/i, // Email-like
    /^\d+\s*of\s*\d+$/i, // Page numbers "1 of 2"
    /^page\s+\d+/i, // "Page 1"
    /powered by/i, // Footer text
    /^\d{1,2}\/\d{4}/, // Dates
    /^\d{4}[-–]\d{4}/, // Date ranges
    /^[A-Z\s]{3,}$/, // All caps (likely headers)
  ];

  // Valid skill patterns (common tech stack keywords)
  const validSkillKeywords = [
    'javascript',
    'typescript',
    'react',
    'vue',
    'angular',
    'node',
    'python',
    'java',
    'c#',
    'c++',
    'php',
    'ruby',
    'go',
    'rust',
    'swift',
    'kotlin',
    'html',
    'css',
    'sass',
    'less',
    'sql',
    'mongodb',
    'postgresql',
    'mysql',
    'redis',
    'docker',
    'kubernetes',
    'aws',
    'azure',
    'gcp',
    'git',
    'linux',
    'windows',
    'macos',
    'agile',
    'scrum',
    'jira',
    'figma',
    'photoshop',
    'illustrator',
  ];

  let inSkillsSection = false;
  const skillItems: string[] = [];
  let currentCategory = 'General';

  // Find skills section start
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    if (!inSkillsSection && skillKeywords.some(keyword => lowerLine.includes(keyword))) {
      inSkillsSection = true;
      continue;
    }

    if (inSkillsSection) {
      // Check if we've hit another section (more strict check)
      if (
        sectionEndKeywords.some(
          keyword => {
            const normalizedLine = lowerLine.replace(/[:\s]/g, '');
            const normalizedKeyword = keyword.replace(/\s/g, '');
            return normalizedLine === normalizedKeyword || 
                   normalizedLine.startsWith(normalizedKeyword) ||
                   lowerLine === keyword || 
                   lowerLine.startsWith(keyword + ':') ||
                   lowerLine.startsWith(keyword + ' ');
          }
        )
      ) {
        break; // Stop parsing when we hit another section
      }

      // CRITICAL: Stop if we encounter SUMMARY-like content (long sentences)
      // Skills section should not contain long descriptive sentences
      if (line.length > 80 && !line.includes(',')) {
        // This is likely a sentence from SUMMARY, not a skill
        // Check if it contains sentence patterns
        const hasSentencePattern = /\b(and|the|to|with|using|about|passionate|efficiency|optimize|delivering|measurable|value|stakeholders|workflows|product|experienced|proficient|years|building|modern|scalable|applications|technologies|tools|business|clean code|performance)\b/i.test(line);
        if (hasSentencePattern) {
          // This is likely from SUMMARY section, stop parsing skills
          break;
        }
      }

      // Check if line is a category (ends with colon and is short)
      if (line.endsWith(':') && line.length < 50) {
        // Save previous category skills
        if (skillItems.length > 0) {
          skillItems.forEach(item => {
            if (isValidSkill(item)) {
              skills.push({
                id: skills.length + 1,
                name: item,
                category: currentCategory,
                order: skills.length,
              });
            }
          });
          skillItems.length = 0;
        }
        currentCategory = line.slice(0, -1).trim();
        continue;
      }

      // Skip excluded patterns
      if (excludePatterns.some(pattern => pattern.test(line))) {
        continue;
      }

      // Skip if line looks like a header (all caps, short)
      if (
        line.length < 3 ||
        (line === line.toUpperCase() && line.length < 30 && !line.includes(','))
      ) {
        continue;
      }

      // Skip lines that are clearly sentences (start with sentence starters)
      const sentenceStarters = /^(and|the|to|with|using|about|passionate|efficiency|measurable|art|tools|workflows|product|value|stakeholders|experienced|proficient|years|building|modern|scalable|applications|technologies)\s+/i;
      if (sentenceStarters.test(line) && line.length > 30) {
        // This is likely a sentence, not a skill list
        continue;
      }

      // Extract skills (comma, pipe, or semicolon separated)
      const items = line
        .split(/[,|;•\-\*]/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 100); // Reasonable length

      skillItems.push(...items);
    }
  }

  // Save last category skills
  if (skillItems.length > 0) {
    skillItems.forEach(item => {
      if (isValidSkill(item)) {
        skills.push({
          id: skills.length + 1,
          name: item,
          category: currentCategory,
          order: skills.length,
        });
      }
    });
  }

  // Helper function to validate if a string looks like a skill
  function isValidSkill(skill: string): boolean {
    const lowerSkill = skill.toLowerCase().trim();

    // Too short or too long (skills are usually 2-30 chars)
    if (lowerSkill.length < 2 || lowerSkill.length > 30) {
      return false;
    }

    // Contains URL patterns
    if (excludePatterns.some(pattern => pattern.test(skill))) {
      return false;
    }

    // CRITICAL: Reject phrases that start with common sentence starters/connectors
    // These are clearly part of a sentence, not skills
    const sentenceStarters = [
      /^and\s+/i,           // "and Cursoi.ai"
      /^the\s+/i,           // "the art tools"
      /^to\s+/i,            // "to optimize"
      /^and\s+delivering/i, // "and delivering"
      /^with\s+/i,          // "with experience"
      /^using\s+/i,         // "using state"
      /^about\s+/i,         // "about clean code"
      /^passionate\s+/i,    // "passionate about"
      /^efficiency/i,       // "efficiency. Passionate"
      /^measurable/i,       // "measurable value"
      /^art\s+/i,           // "art tools"
      /^tools\s+/i,         // "tools to"
      /^workflows/i,        // "workflows and"
      /^product/i,          // "product efficiency"
      /^value\s+/i,         // "value to users"
      /^stakeholders/i,     // "stakeholders"
    ];

    if (sentenceStarters.some(pattern => pattern.test(skill))) {
      return false;
    }

    // Reject single common words that are not skills
    const singleWordExclusions = ['the', 'and', 'to', 'with', 'using', 'about', 'art', 'tools', 'and', 'delivering', 'measurable', 'value', 'stakeholders'];
    if (singleWordExclusions.includes(lowerSkill)) {
      return false;
    }

    // Reject phrases that end with punctuation (likely part of a sentence)
    if (/[.,;:!?]$/.test(skill.trim())) {
      return false;
    }

    // Reject phrases that contain sentence-like patterns
    // (multiple words that form a sentence, not a skill name)
    const words = lowerSkill.split(/\s+/);
    if (words.length > 4) {
      // Skills are usually 1-3 words, rarely 4+
      // Only accept if it contains a clear tech keyword
      const hasValidKeyword = validSkillKeywords.some(keyword => lowerSkill.includes(keyword));
      if (!hasValidKeyword) {
        return false;
      }
    }

    // Reject phrases that look like sentences (contain verbs, articles, etc.)
    const sentencePatterns = [
      /\b(to|and|the|with|using|about|passionate|efficiency|optimize|delivering|measurable|value|stakeholders|workflows|product)\b/i,
    ];
    
    // If it's a long phrase (3+ words) and contains sentence patterns, reject unless it has tech keywords
    if (words.length >= 3) {
      const hasSentencePattern = sentencePatterns.some(pattern => pattern.test(skill));
      const hasValidKeyword = validSkillKeywords.some(keyword => lowerSkill.includes(keyword));
      
      if (hasSentencePattern && !hasValidKeyword) {
        return false;
      }
    }

    // Contains common non-skill words
    const nonSkillWords = [
      'find me',
      'online',
      'portfolio',
      'linkedin',
      'github',
      'email',
      'phone',
      'address',
      'location',
      'courses',
      'interests',
      'experience',
      'education',
      'projects',
      'social',
      'network',
      'www',
      'http',
      'https',
      'com',
      'org',
      'net',
      'page',
      'powered',
      'by',
      'enhancv',
      'resume',
      'cv',
      'passionate',
      'clean code',
      'performance optimization',
      'business workflows',
      'product efficiency',
      'measurable value',
      'stakeholders',
      'cursoi',
      'state-of-the-art',
      'state of the art',
    ];

    if (nonSkillWords.some(word => lowerSkill.includes(word))) {
      return false;
    }

    // Contains valid skill keywords OR looks like a technical term
    const hasValidKeyword = validSkillKeywords.some(keyword => lowerSkill.includes(keyword));
    const looksLikeTech = /^[a-z]+(?:\.js|\.ts|\.py|\.java|\.net|\.jsx|\.tsx)$/i.test(skill);
    const hasVersion = /\d+\.\d+/.test(skill); // Version numbers often indicate tech
    const looksLikeFramework = /^(react|vue|angular|next|nuxt|svelte|nest|express|django|flask|spring|laravel|rails)/i.test(skill);

    // For short skills (1-2 words), be more lenient
    if (words.length <= 2) {
      return hasValidKeyword || looksLikeTech || hasVersion || looksLikeFramework || (lowerSkill.length >= 2 && lowerSkill.length <= 20);
    }

    // For longer phrases (3+ words), require clear tech indicators
    return hasValidKeyword || looksLikeTech || hasVersion || looksLikeFramework;
  }

  // Remove duplicates and clean up
  const uniqueSkills = Array.from(
    new Map(skills.map(s => [s.name?.toLowerCase().trim(), s])).values()
  ).filter(s => s.name && s.name.trim().length > 0);

  return uniqueSkills.slice(0, 30); // Limit to 30 skills (more reasonable)
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
    role: extractRole(text),
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

  // Log extracted data for debugging
  console.log('📄 [PDF Parser] Extracted experiences:', experiences.length);
  experiences.forEach((exp, index) => {
    console.log(`📄 [PDF Parser] Experience ${index + 1}:`, {
      company: exp.company,
      role: exp.role,
      startDate: exp.startDate,
      endDate: exp.endDate,
      isCurrent: exp.isCurrent,
      startDateType: typeof exp.startDate,
      endDateType: typeof exp.endDate,
    });
  });

  console.log('📄 [PDF Parser] Extracted education:', education.length);
  education.forEach((edu, index) => {
    console.log(`📄 [PDF Parser] Education ${index + 1}:`, {
      institution: edu.institution,
      degree: edu.degree,
      graduationDate: edu.graduationDate,
      graduationDateType: typeof edu.graduationDate,
    });
  });

  const parsedData: ParsedResumeData = {
    personalInfo: Object.keys(personalInfo).some(
      key => personalInfo[key as keyof typeof personalInfo]
    )
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
