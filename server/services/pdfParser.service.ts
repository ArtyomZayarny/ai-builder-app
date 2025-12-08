/**
 * PDF Parser Service
 * Extracts resume data from uploaded PDF files
 */

import type { Experience, Education, Project, Skill } from '@resume-builder/shared';

// Lazy import pdfjs-dist to avoid loading it on module initialization
// pdfjs-dist works in serverless environments without native dependencies
let pdfjsLib: any = null;

async function getPdfJs() {
  if (!pdfjsLib) {
    try {
      // Dynamic import for serverless compatibility
      pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      // No worker configuration needed - worker is disabled in getDocument()
      // Worker is only for browser environments to avoid blocking UI thread
    } catch (error) {
      throw new Error(
        'PDF parsing is not available in this environment. pdfjs-dist failed to load.'
      );
    }
  }
  return pdfjsLib;
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
 * Extract text from PDF buffer using pdfjs-dist
 * Works in serverless environments without native dependencies
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfjs = await getPdfJs();
    const { getDocument } = pdfjs;

    // Convert Buffer to Uint8Array for pdfjs-dist
    const pdfData = new Uint8Array(buffer);

    // Load PDF document from buffer
    // disableWorker: true - Worker is NOT needed in Node.js/serverless
    // Worker is only for browser environments to avoid blocking UI thread
    const loadingTask = getDocument({
      data: pdfData,
      disableWorker: true, // Disable worker in Node.js/serverless
    });
    const pdfDocument = await loadingTask.promise;

    // Extract text from all pages
    let fullText = '';
    const numPages = pdfDocument.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combine text items from the page
      const pageText = textContent.items.map((item: any) => item.str || '').join(' ');

      fullText += pageText;

      // Add newline between pages (except for last page)
      if (pageNum < numPages) {
        fullText += '\n';
      }
    }

    let text = fullText;

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

    // Handle pdfjs-dist specific errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('Invalid or corrupted PDF file');
      }
      if (error.message.includes('password')) {
        throw new Error('Password-protected PDFs are not supported');
      }
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

  // Strategy 1: Look for "Email:" or "E-mail:" label pattern first (most reliable)
  const emailLabelMatch = text.match(
    /(?:^|\n)\s*(?:e[-]?mail|contact|email address):\s*([^\n]{5,80})/i
  );
  if (emailLabelMatch && emailLabelMatch[1]) {
    let email = emailLabelMatch[1].trim();
    // Remove common suffixes that might be on the same line
    email = email.split(/\s+/)[0]; // Take first word/token
    email = email.replace(/[.,;:!?]+$/, ''); // Remove trailing punctuation

    // Try to extract email from this
    const emailInLabel = email.match(
      /\b[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}\b/
    );
    if (emailInLabel && emailInLabel[0]) {
      const cleaned = cleanEmail(emailInLabel[0]);
      if (cleaned) return cleaned;
    }
  }

  // Strategy 1.5: Look for email in line with other contact info separated by "I" or "|"
  // Format: "Bucharest, Romania I timaz.dev@gmail.com I +40 765 019 311"
  const contactLineMatch = text.match(
    /(?:^|\n)([^\n]{20,150}(?:[I|]\s*[^\n@]{5,}@[^\n]{5,}[I|][^\n]{5,})[^\n]{0,50})/
  );
  if (contactLineMatch && contactLineMatch[1]) {
    const contactLine = contactLineMatch[1];
    // Split by "I" or "|" and look for email in each part
    const parts = contactLine.split(/[I|]/).map(p => p.trim());
    for (const part of parts) {
      if (part.includes('@')) {
        const emailMatch = part.match(
          /\b[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}\b/
        );
        if (emailMatch && emailMatch[0]) {
          const cleaned = cleanEmail(emailMatch[0]);
          if (cleaned) return cleaned;
        }
      }
    }
  }

  // Standard email regex - more reliable
  // Pattern: local-part@domain.tld
  // Local part can contain: letters, numbers, dots, underscores, hyphens, plus signs
  // Domain can contain: letters, numbers, dots, hyphens
  const emailRegex =
    /\b[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}\b/g;

  // First try standard regex
  let matches = text.match(emailRegex);

  // If no matches, try more flexible pattern (handles spaces/newlines in email)
  if (!matches || matches.length === 0) {
    // Pattern that allows spaces/newlines between parts
    const flexibleRegex =
      /[a-zA-Z0-9](?:[a-zA-Z0-9._\s-]*[a-zA-Z0-9])?\s*@\s*[a-zA-Z0-9](?:[a-zA-Z0-9.\s-]*[a-zA-Z0-9])?\s*\.\s*[a-zA-Z]{2,}/g;
    matches = text.match(flexibleRegex);
  }

  // If still no matches, try pattern that handles comma instead of dot (common PDF issue)
  if (!matches || matches.length === 0) {
    // Pattern that allows comma or other punctuation before TLD
    // e.g., "timaz.dev@gmail,com" or "timaz.dev@gmail.com"
    const commaRegex =
      /[a-zA-Z0-9](?:[a-zA-Z0-9._\s-]*[a-zA-Z0-9])?\s*@\s*[a-zA-Z0-9](?:[a-zA-Z0-9.\s-]*[a-zA-Z0-9])?\s*[,\.]\s*[a-zA-Z]{2,}/g;
    matches = text.match(commaRegex);
  }

  // Also try to find email-like patterns with @ symbol even if TLD separator is wrong
  if (!matches || matches.length === 0) {
    // Very flexible pattern: anything@anything followed by comma/dot and 2+ letters
    const veryFlexibleRegex =
      /[a-zA-Z0-9](?:[a-zA-Z0-9._\s-]*[a-zA-Z0-9])?\s*@\s*[a-zA-Z0-9](?:[a-zA-Z0-9._\s-]*[a-zA-Z0-9])?\s*[,\.;]\s*[a-zA-Z]{2,}/g;
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
      const contextRegex =
        /[a-zA-Z0-9](?:[a-zA-Z0-9._\s-]*[a-zA-Z0-9])?\s*@\s*[a-zA-Z0-9](?:[a-zA-Z0-9._\s-]*[a-zA-Z0-9])?\s*[,\.;]?\s*[a-zA-Z]{2,}/g;
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
    email = email.replace(
      /[\u2600-\u26FF\u2700-\u27BF\uFE00-\uFE0F\u200D\u200B-\u200D\uFEFF]/g,
      ''
    ); // Emoji and symbols
    email = email.replace(/[^\x00-\x7F]/g, char => {
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
    const validEmailRegex =
      /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
    if (validEmailRegex.test(email)) {
      return email;
    }
  }

  return undefined;
}

/**
 * Helper function to clean and validate email
 */
function cleanEmail(email: string): string | undefined {
  if (!email || !email.includes('@')) return undefined;

  // Remove all whitespace (spaces, newlines, tabs) from email first
  let cleaned = email.replace(/\s+/g, '');

  // Remove common icon/symbol characters (Unicode ranges for icons)
  cleaned = cleaned.replace(
    /[\u2600-\u26FF\u2700-\u27BF\uFE00-\uFE0F\u200D\u200B-\u200D\uFEFF]/g,
    ''
  );
  cleaned = cleaned.replace(/[^\x00-\x7F]/g, char => {
    // Keep only ASCII printable characters, @, and dots
    const code = char.charCodeAt(0);
    if (code >= 32 && code <= 126) return char; // ASCII printable
    if (char === '@' || char === '.') return char;
    return ''; // Remove other Unicode
  });

  // CRITICAL: Remove leading digits that might be from phone numbers
  if (/^\d{4,}/.test(cleaned)) {
    const atIdx = cleaned.indexOf('@');
    if (atIdx > 0) {
      const localPart = cleaned.substring(0, atIdx);
      const firstLetterMatch = localPart.match(/[a-zA-Z]/);
      if (firstLetterMatch && firstLetterMatch.index !== undefined) {
        cleaned = cleaned.substring(firstLetterMatch.index);
      } else {
        cleaned = cleaned.replace(/^\d+/, '');
      }
    } else {
      cleaned = cleaned.replace(/^\d+/, '');
    }
  }

  // Fix common formatting issues
  cleaned = cleaned.replace(/\.\s*\./g, '.');
  cleaned = cleaned.replace(/\s*@\s*/g, '@');

  // CRITICAL: Replace comma/semicolon before TLD with dot
  cleaned = cleaned.replace(/@([a-zA-Z0-9-]+)[,;]([a-zA-Z]{2,})$/, '@$1.$2');

  // Handle commas in local part
  const atIndex = cleaned.indexOf('@');
  if (atIndex > 0) {
    const localPart = cleaned.substring(0, atIndex);
    const domainPart = cleaned.substring(atIndex);
    const cleanedLocal = localPart.replace(/,/g, '.');
    cleaned = cleanedLocal + domainPart;
  }

  // Ensure . has no spaces
  cleaned = cleaned.replace(/\s*\.\s*/g, '.');

  // Final cleanup: replace any remaining commas/semicolons in domain
  const atIdx = cleaned.indexOf('@');
  if (atIdx > 0) {
    const domain = cleaned.substring(atIdx + 1);
    const cleanedDomain = domain.replace(/[,;](?=[a-zA-Z]{2,}$)/, '.');
    cleaned = cleaned.substring(0, atIdx + 1) + cleanedDomain;
  }

  // Remove any leading/trailing non-email characters
  cleaned = cleaned.replace(/^[^a-zA-Z0-9]+/, '');
  cleaned = cleaned.replace(/[^a-zA-Z0-9.@-]+$/, '');

  // Validate the cleaned email
  const validEmailRegex =
    /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
  if (validEmailRegex.test(cleaned)) {
    return cleaned;
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
  // Strategy 1: Look for "LinkedIn:" label pattern first (most reliable)
  const linkedinLabelMatch = text.match(/(?:^|\n)\s*linkedin:?\s*([^\n]{5,100})/i);
  if (linkedinLabelMatch && linkedinLabelMatch[1]) {
    let url = linkedinLabelMatch[1].trim();
    // Remove trailing punctuation
    url = url.replace(/[.,;:!?]+$/, '');
    // Remove all whitespace
    url = url.replace(/\s+/g, '');

    // If it's just the path (linkedin.com/in/...), add https://
    if (url.includes('linkedin.com')) {
      if (!url.startsWith('http')) {
        url = 'https://' + (url.startsWith('www.') ? url : 'www.' + url);
      }
      // Remove trailing slash if present
      url = url.replace(/\/$/, '');
      return url;
    }
  }

  // Strategy 2: First, try to find LinkedIn URL patterns that might be split across lines
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
  const normalizedText = text.replace(/(https?:\/\/[^\s]+)/g, match => {
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
  // Strategy 1: Look for "Portfolio:" label pattern first (most reliable)
  const portfolioLabelMatch = text.match(/(?:^|\n)\s*portfolio:?\s*([^\n]{5,100})/i);
  if (portfolioLabelMatch && portfolioLabelMatch[1]) {
    let url = portfolioLabelMatch[1].trim();
    // Remove trailing punctuation
    url = url.replace(/[.,;:!?]+$/, '');
    // Remove all whitespace
    url = url.replace(/\s+/g, '');

    // If it doesn't start with http, add https://
    if (!url.startsWith('http')) {
      url = 'https://' + (url.startsWith('www.') ? url : url);
    }

    // Validate it's a portfolio-like URL
    if (
      url.includes('vercel.app') ||
      url.includes('netlify.app') ||
      url.includes('portfolio') ||
      url.includes('.dev') ||
      url.includes('.io') ||
      url.includes('.com') ||
      url.includes('.app')
    ) {
      return url;
    }
  }

  // Strategy 2: Find URL patterns and reconstruct them by removing whitespace
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
  const portfolioUrls = filtered.filter(
    url =>
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

  // Strategy 1: Look in first 15 lines (expanded from 8)
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    let line = lines[i];

    // Skip if it's an email, phone, or URL (but check if name is on same line)
    const hasEmail = line.includes('@');
    const hasPhone = /^\d/.test(line);
    const hasUrl = line.startsWith('http');

    // Skip common section headers
    if (
      /^(experience|education|skills|summary|contact|about|work|employment|professional)/i.test(
        line
      )
    ) {
      continue;
    }

    // Clean the line (remove null bytes, control chars)
    line = line
      .replace(/\u0000/g, '')
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim();

    // Handle case where name and role are on same line separated by "|"
    // Format: "ARTEM ZAIARNYI | Full-Stack Software Engineer | React / Node.js"
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      // First part is usually the name
      if (parts.length > 0 && !hasEmail && !hasPhone && !hasUrl) {
        let namePart = parts[0];
        // Remove common prefixes
        namePart = namePart.replace(/^(resume|cv|curriculum vitae|name:?|full name:?)\s*/i, '');
        const nameWords = namePart.split(/\s+/).filter(w => w.length > 0);
        if (nameWords.length >= 2 && nameWords.length <= 5 && /[a-zA-Z]/.test(namePart)) {
          // If all caps, convert to title case
          if (namePart === namePart.toUpperCase() && namePart.length < 60) {
            return nameWords.map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
          }
          return namePart;
        }
      }
    }

    // Skip if it's an email, phone, or URL (and not a name on same line)
    if (hasEmail || hasPhone || hasUrl) {
      continue;
    }

    // Remove common prefixes/suffixes that might be in header
    line = line.replace(/^(resume|cv|curriculum vitae|name:?|full name:?)\s*/i, '');
    line = line.replace(/\s*(resume|cv|curriculum vitae)$/i, '');

    // Name is usually 2-5 words (expanded from 4), can be all caps or title case
    const words = line.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2 && words.length <= 5) {
      // Check if it looks like a name (contains letters, not just numbers/symbols)
      const hasLetters = /[a-zA-Z]/.test(line);
      if (!hasLetters) continue;

      // If all caps, convert to title case for better display
      if (line === line.toUpperCase() && line.length < 60) {
        return words.map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
      }
      return line;
    }
  }

  // Strategy 2: Look for name patterns near email (name often appears before email)
  const emailMatch = text.match(
    /\b[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}\b/
  );
  if (emailMatch) {
    const emailIndex = text.indexOf(emailMatch[0]);
    // Look 200 characters before email
    const beforeEmail = text.substring(Math.max(0, emailIndex - 200), emailIndex);
    const beforeLines = beforeEmail
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    // Check last few lines before email
    for (let i = Math.max(0, beforeLines.length - 5); i < beforeLines.length; i++) {
      let line = beforeLines[i];

      // Skip if it's an email, phone, or URL
      if (line.includes('@') || /^\d/.test(line) || line.startsWith('http')) {
        continue;
      }

      // Skip section headers
      if (
        /^(experience|education|skills|summary|contact|about|work|employment|professional)/i.test(
          line
        )
      ) {
        continue;
      }

      // Clean the line
      line = line
        .replace(/\u0000/g, '')
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .trim();

      const words = line.split(/\s+/).filter(w => w.length > 0);
      if (words.length >= 2 && words.length <= 5 && /[a-zA-Z]/.test(line)) {
        if (line === line.toUpperCase() && line.length < 60) {
          return words.map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
        }
        return line;
      }
    }
  }

  // Strategy 3: Look for "Name:" pattern
  const nameLabelMatch = text.match(/(?:^|\n)\s*(?:name|full name|fullname):\s*([^\n]{2,50})/i);
  if (nameLabelMatch && nameLabelMatch[1]) {
    let name = nameLabelMatch[1].trim();
    name = name.replace(/\u0000/g, '').replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    const words = name.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2 && words.length <= 5 && /[a-zA-Z]/.test(name)) {
      return name;
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

  // Strategy 1: Look for role in header area (first 15 lines, expanded from 8) - this is usually the main title
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    let line = lines[i];

    // Handle case where name and role are on same line separated by "|"
    // Format: "ARTEM ZAIARNYI | Full-Stack Software Engineer | React / Node.js"
    if (
      line.includes('|') &&
      !line.includes('@') &&
      !/^\d/.test(line) &&
      !line.startsWith('http')
    ) {
      const parts = line.split('|').map(p => p.trim());
      // Second part (index 1) is usually the role, skip first part (name)
      for (let j = 1; j < parts.length; j++) {
        let rolePart = parts[j];

        // Skip if it looks like tech stack (contains slashes or common tech terms without role keywords)
        if (
          rolePart.includes('/') &&
          !roleKeywords.some(kw => rolePart.toLowerCase().includes(kw))
        ) {
          continue;
        }

        // Clean the role part
        rolePart = rolePart
          .replace(/\u0000/g, '')
          .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
          .trim();

        // Remove date patterns
        const originalRolePart = rolePart;
        rolePart = rolePart
          .replace(/\d{1,2}\/\d{4}/g, '')
          .replace(/\d{4}[-–]\d{4}/g, '')
          .trim();

        if (!rolePart) continue;

        const words = rolePart.split(/\s+/).filter(w => w.length > 0);
        const lowerRolePart = rolePart.toLowerCase();

        // Check if it contains role keywords
        if (
          words.length >= 1 &&
          words.length <= 7 &&
          roleKeywords.some(keyword => lowerRolePart.includes(keyword))
        ) {
          // Take only the role part, not the tech stack
          // If there's a "/" or multiple tech terms, take only the part before them
          const roleOnly = rolePart.split(/\s*\/\s*/)[0].trim();
          return roleOnly.length >= 3 ? roleOnly : originalRolePart.split(/\s*\/\s*/)[0].trim();
        }
      }
    }

    // Skip if it's name, email, phone, or URL (and not a name|role line)
    if (
      line.includes('@') ||
      /^\d/.test(line) ||
      line.startsWith('http') ||
      (/^[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(line) && !line.includes('|')) // Likely a name (2-4 words, title case) but not with role
    ) {
      continue;
    }

    // Clean the line
    line = line
      .replace(/\u0000/g, '')
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim();

    // Remove common prefixes
    line = line.replace(/^(title|position|role|job title|current position):\s*/i, '');

    // Remove date patterns (e.g., "10/2023 04/2025", "2023-2025", etc.)
    const originalLine = line;
    line = line
      .replace(/\d{1,2}\/\d{4}/g, '')
      .replace(/\d{4}[-–]\d{4}/g, '')
      .replace(/\d{1,2}\/\d{4}\s*[-–]\s*\d{1,2}\/\d{4}/g, '')
      .trim();

    // Skip if line is empty after removing dates
    if (!line) continue;

    // Role is usually 1-7 words (expanded from 6), often contains job-related keywords
    const words = line.split(/\s+/).filter(w => w.length > 0);
    const lowerLine = line.toLowerCase();

    // Check if it contains role keywords and is in reasonable length
    if (
      words.length >= 1 &&
      words.length <= 7 &&
      roleKeywords.some(keyword => lowerLine.includes(keyword))
    ) {
      // Prefer the cleaned version, but if it's too short, use original
      return line.length >= 3 ? line : originalLine;
    }
  }

  // Strategy 2: Look for role in first experience entry (often the current/most recent role)
  const experienceMatch = text.match(
    /(?:experience|work history|employment|professional experience)[:\s]*\n/i
  );
  if (experienceMatch) {
    const experienceIndex = text.toLowerCase().indexOf(experienceMatch[0].toLowerCase());
    const experienceText = text.substring(experienceIndex);
    const experienceLines = experienceText
      .split('\n')
      .slice(0, 20)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    for (const line of experienceLines) {
      // Look for role patterns in experience (usually "Role at Company" or "Role | Company")
      if (line.includes(' at ') || line.includes(' | ') || line.includes(' - ')) {
        const parts = line.split(/\s+(?:at|\\||-)\s+/);
        if (parts.length >= 1) {
          let potentialRole = parts[0].trim();

          // Clean the role
          potentialRole = potentialRole
            .replace(/\u0000/g, '')
            .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .replace(/\d{1,2}\/\d{4}/g, '')
            .replace(/\d{4}[-–]\d{4}/g, '')
            .trim();

          const words = potentialRole.split(/\s+/).filter(w => w.length > 0);
          const lowerRole = potentialRole.toLowerCase();

          if (
            words.length >= 1 &&
            words.length <= 7 &&
            roleKeywords.some(keyword => lowerRole.includes(keyword))
          ) {
            return potentialRole;
          }
        }
      }
    }
  }

  // Strategy 3: Look for "Role:" or "Title:" pattern
  const roleLabelMatch = text.match(
    /(?:^|\n)\s*(?:role|title|position|job title|current position):\s*([^\n]{2,80})/i
  );
  if (roleLabelMatch && roleLabelMatch[1]) {
    let role = roleLabelMatch[1].trim();
    role = role
      .replace(/\u0000/g, '')
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\d{1,2}\/\d{4}/g, '')
      .replace(/\d{4}[-–]\d{4}/g, '')
      .trim();

    const words = role.split(/\s+/).filter(w => w.length > 0);
    const lowerRole = role.toLowerCase();

    if (
      words.length >= 1 &&
      words.length <= 7 &&
      (roleKeywords.some(keyword => lowerRole.includes(keyword)) || words.length <= 3)
    ) {
      return role;
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
    'romania',
    'usa',
    'united states',
    'uk',
    'united kingdom',
    'canada',
    'australia',
    'germany',
    'france',
    'spain',
    'italy',
    'poland',
    'ukraine',
    'russia',
    'bucureşti',
    'bucharest',
    'london',
    'paris',
    'berlin',
    'madrid',
    'rome',
    'new york',
    'san francisco',
    'los angeles',
    'chicago',
    'boston',
    'seattle',
    'toronto',
    'vancouver',
    'sydney',
    'melbourne',
    'amsterdam',
    'dublin',
  ];

  // Technology/framework names to exclude (common false positives)
  const excludeKeywords = [
    'webpack',
    'sass',
    'scss',
    'react',
    'vue',
    'angular',
    'node',
    'express',
    'typescript',
    'javascript',
    'python',
    'java',
    'php',
    'ruby',
    'go',
    'rust',
    'redux',
    'mobx',
    'graphql',
    'rest',
    'api',
    'html',
    'css',
    'json',
    'xml',
    'docker',
    'kubernetes',
    'aws',
    'azure',
    'gcp',
    'mongodb',
    'postgresql',
    'mysql',
    'redis',
    'elasticsearch',
    'nginx',
    'apache',
    'git',
    'github',
  ];

  // More flexible regex that handles:
  // - City names with multiple words (e.g., "Bucureşti", "San Francisco")
  // - Country names with multiple words (e.g., "United States", "United Kingdom")
  // - Special characters in city names (e.g., "Bucureşti" with ş)
  const locationRegex =
    /([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+)*),\s*([A-ZÀ-ÿ]{2,}(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+)*)/g;
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
      const hasLocationWords =
        /\b(city|country|state|province|region|area|location|address)\b/i.test(match);
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
  let currentExp: Partial<
    Experience & { startDate: string | null | undefined; endDate: string | null | undefined }
  > | null = null;
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
      if (
        line.includes(' at ') ||
        line.includes(' | ') ||
        /\d{1,2}\/\d{4}/.test(line) ||
        /\d{4}[-–]\d{4}/.test(line)
      ) {
        // Save previous experience if exists
        if (currentExp && currentExp.role && currentExp.company) {
          // Normalize dates: empty strings or undefined should be null
          const normalizedStartDate: string | null =
            currentExp.startDate &&
            typeof currentExp.startDate === 'string' &&
            currentExp.startDate.trim() !== ''
              ? currentExp.startDate
              : null;
          const normalizedEndDate: string | null =
            currentExp.endDate &&
            typeof currentExp.endDate === 'string' &&
            currentExp.endDate.trim() !== ''
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
          const roleKeywords = [
            'developer',
            'engineer',
            'manager',
            'director',
            'specialist',
            'analyst',
            'designer',
          ];
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
          const roleKeywords = [
            'developer',
            'engineer',
            'manager',
            'director',
            'specialist',
            'analyst',
            'designer',
          ];
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
        const dateMatch = line.match(
          /(\d{1,2}\/\d{4}|\d{4})\s*[-–]\s*(\d{1,2}\/\d{4}|\d{4}|Present|Current)/i
        );
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
                  console.log(
                    `⚠️ [PDF Parser] Invalid startDate format: "${startDate}", setting to null`
                  );
                  currentExp.startDate = undefined;
                }
              } else {
                console.log(
                  `⚠️ [PDF Parser] Invalid startDate format: "${startDate}", setting to null`
                );
                currentExp.startDate = undefined;
              }
            } else if (startDate.match(/^\d{4}$/)) {
              // YYYY format
              startDate = startDate + '-01';
              currentExp.startDate = startDate;
            } else {
              console.log(
                `⚠️ [PDF Parser] Invalid startDate format: "${startDate}", setting to null`
              );
              currentExp.startDate = undefined;
            }
          } else {
            console.log(
              `⚠️ [PDF Parser] Empty or invalid startDate: "${startDate}", setting to null`
            );
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
                  console.log(
                    `⚠️ [PDF Parser] Invalid endDate format: "${endDate}", setting to null`
                  );
                  currentExp.endDate = undefined;
                  currentExp.isCurrent = false;
                }
              } else {
                console.log(
                  `⚠️ [PDF Parser] Invalid endDate format: "${endDate}", setting to null`
                );
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
    const normalizedStartDate: string | null =
      currentExp.startDate &&
      typeof currentExp.startDate === 'string' &&
      currentExp.startDate.trim() !== ''
        ? currentExp.startDate
        : null;
    const normalizedEndDate: string | null =
      currentExp.endDate &&
      typeof currentExp.endDate === 'string' &&
      currentExp.endDate.trim() !== ''
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
    // Languages
    'javascript',
    'typescript',
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
    'dart',
    'scala',
    'r',
    'matlab',
    // Frontend
    'react',
    'vue',
    'angular',
    'svelte',
    'next',
    'nuxt',
    'gatsby',
    'remix',
    'astro',
    'html',
    'css',
    'sass',
    'scss',
    'less',
    'stylus',
    'tailwind',
    'bootstrap',
    'material-ui',
    'chakra',
    // Backend
    'node',
    'express',
    'nest',
    'fastify',
    'koa',
    'django',
    'flask',
    'fastapi',
    'spring',
    'laravel',
    'rails',
    'asp.net',
    'graphql',
    'rest',
    'api',
    // Databases
    'sql',
    'mongodb',
    'postgresql',
    'mysql',
    'redis',
    'elasticsearch',
    'dynamodb',
    'cassandra',
    'neo4j',
    'firebase',
    'supabase',
    // DevOps & Cloud
    'docker',
    'kubernetes',
    'aws',
    'azure',
    'gcp',
    'terraform',
    'ansible',
    'jenkins',
    'ci/cd',
    'github actions',
    'gitlab',
    // Tools & Others
    'git',
    'linux',
    'windows',
    'macos',
    'agile',
    'scrum',
    'jira',
    'confluence',
    'figma',
    'photoshop',
    'illustrator',
    'sketch',
    'xd',
    'webpack',
    'vite',
    'esbuild',
    'rollup',
    'jest',
    'cypress',
    'playwright',
    'selenium',
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
        sectionEndKeywords.some(keyword => {
          const normalizedLine = lowerLine.replace(/[:\s]/g, '');
          const normalizedKeyword = keyword.replace(/\s/g, '');
          return (
            normalizedLine === normalizedKeyword ||
            normalizedLine.startsWith(normalizedKeyword) ||
            lowerLine === keyword ||
            lowerLine.startsWith(keyword + ':') ||
            lowerLine.startsWith(keyword + ' ')
          );
        })
      ) {
        break; // Stop parsing when we hit another section
      }

      // CRITICAL: Stop if we encounter SUMMARY-like content (long sentences)
      // Skills section should not contain long descriptive sentences
      if (line.length > 80 && !line.includes(',')) {
        // This is likely a sentence from SUMMARY, not a skill
        // Check if it contains sentence patterns
        const hasSentencePattern =
          /\b(and|the|to|with|using|about|passionate|efficiency|optimize|delivering|measurable|value|stakeholders|workflows|product|experienced|proficient|years|building|modern|scalable|applications|technologies|tools|business|clean code|performance)\b/i.test(
            line
          );
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
      const sentenceStarters =
        /^(and|the|to|with|using|about|passionate|efficiency|measurable|art|tools|workflows|product|value|stakeholders|experienced|proficient|years|building|modern|scalable|applications|technologies)\s+/i;
      if (sentenceStarters.test(line) && line.length > 30) {
        // This is likely a sentence, not a skill list
        continue;
      }

      // Extract skills (comma, pipe, semicolon, bullet points, or newline separated)
      // Also handle skills separated by spaces when they're clearly tech terms
      const items = line
        .split(/[,|;•\-\*\/]/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 100); // Reasonable length

      // If no separators found but line contains tech keywords, try to split by common patterns
      if (items.length === 1 && items[0].length > 20) {
        // Try to split by common tech term patterns
        const techTerms = items[0].match(
          /\b(react|vue|angular|node|python|java|typescript|javascript|html|css|sql|aws|docker|kubernetes|git|linux|windows|agile|scrum|jira|figma)\b/gi
        );
        if (techTerms && techTerms.length > 1) {
          // Line likely contains multiple skills, try to extract them
          const potentialSkills = items[0].split(
            /\s+(?=(?:react|vue|angular|node|python|java|typescript|javascript|html|css|sql|aws|docker|kubernetes|git|linux|windows|agile|scrum|jira|figma))/i
          );
          skillItems.push(
            ...potentialSkills.map(s => s.trim()).filter(s => s.length > 0 && s.length < 50)
          );
        } else {
          skillItems.push(...items);
        }
      } else {
        skillItems.push(...items);
      }
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

  // FALLBACK: Extract skills from summary and experience sections
  // Look for skills mentioned in summary (often lists technologies)
  const summaryMatch = text.match(/(?:summary|about|profile|overview)[:\s]*\n([^\n]{50,500})/i);
  if (summaryMatch && summaryMatch[1]) {
    const summaryText = summaryMatch[1];
    // Extract tech keywords from summary
    const techMatches = summaryText.match(
      /\b(react|vue|angular|node|python|java|typescript|javascript|html|css|sql|aws|docker|kubernetes|git|linux|windows|agile|scrum|jira|figma|mongodb|postgresql|mysql|redis|express|django|flask|spring|laravel|rails|next|nuxt|gatsby|tailwind|bootstrap|material|webpack|vite|jest|cypress|playwright|selenium|redux|mobx|graphql|rest|api|sass|less|stylus|typescript|javascript|node\.js|react\.js|vue\.js|angular\.js)\b/gi
    );
    if (techMatches) {
      techMatches.forEach(match => {
        const skillName = match.trim();
        if (
          isValidSkill(skillName) &&
          !skills.some(s => s.name?.toLowerCase() === skillName.toLowerCase())
        ) {
          skills.push({
            id: skills.length + 1,
            name: skillName,
            category: 'General',
            order: skills.length,
          });
        }
      });
    }
  }

  // FALLBACK: If still no skills found, try to extract from experience section
  if (skills.length < 5) {
    // Look for skills mentioned in experience descriptions
    const experienceSection = text.match(
      /experience|work history|employment|professional experience/i
    );
    if (experienceSection) {
      const experienceIndex = text.toLowerCase().indexOf(experienceSection[0].toLowerCase());
      const experienceText = text.substring(experienceIndex);
      const experienceLines = experienceText.split('\n').slice(0, 50); // First 50 lines of experience

      // Extract potential skills from experience descriptions
      for (const line of experienceLines) {
        // Skip if it's a job title or company name
        if (line.includes(' at ') || line.includes(' | ') || /\d{1,2}\/\d{4}/.test(line)) {
          continue;
        }

        // Look for tech keywords in the line
        const techMatches = line.match(
          /\b(react|vue|angular|node|python|java|typescript|javascript|html|css|sql|aws|docker|kubernetes|git|linux|windows|agile|scrum|jira|figma|mongodb|postgresql|mysql|redis|express|django|flask|spring|laravel|rails|next|nuxt|gatsby|tailwind|bootstrap|material|webpack|vite|jest|cypress|playwright|selenium)\b/gi
        );
        if (techMatches) {
          techMatches.forEach(match => {
            const skillName = match.trim();
            if (
              isValidSkill(skillName) &&
              !skills.some(s => s.name?.toLowerCase() === skillName.toLowerCase())
            ) {
              skills.push({
                id: skills.length + 1,
                name: skillName,
                category: 'General',
                order: skills.length,
              });
            }
          });
        }

        // Also try to extract from comma-separated lists in experience
        if (line.includes(',') && line.length < 200) {
          const items = line
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0 && s.length < 50);
          items.forEach(item => {
            if (
              isValidSkill(item) &&
              !skills.some(s => s.name?.toLowerCase() === item.toLowerCase())
            ) {
              skills.push({
                id: skills.length + 1,
                name: item,
                category: 'General',
                order: skills.length,
              });
            }
          });
        }
      }
    }
  }

  // Helper function to validate if a string looks like a skill
  function isValidSkill(skill: string): boolean {
    const lowerSkill = skill.toLowerCase().trim();

    // Too short or too long (skills are usually 2-50 chars, allow longer for compound names)
    if (lowerSkill.length < 2 || lowerSkill.length > 50) {
      return false;
    }

    // Contains URL patterns
    if (excludePatterns.some(pattern => pattern.test(skill))) {
      return false;
    }

    // CRITICAL: Reject phrases that start with common sentence starters/connectors
    // These are clearly part of a sentence, not skills
    const sentenceStarters = [
      /^and\s+/i, // "and Cursoi.ai"
      /^the\s+/i, // "the art tools"
      /^to\s+/i, // "to optimize"
      /^and\s+delivering/i, // "and delivering"
      /^with\s+/i, // "with experience"
      /^using\s+/i, // "using state"
      /^about\s+/i, // "about clean code"
      /^passionate\s+/i, // "passionate about"
      /^efficiency/i, // "efficiency. Passionate"
      /^measurable/i, // "measurable value"
      /^art\s+/i, // "art tools"
      /^tools\s+/i, // "tools to"
      /^workflows/i, // "workflows and"
      /^product/i, // "product efficiency"
      /^value\s+/i, // "value to users"
      /^stakeholders/i, // "stakeholders"
    ];

    if (sentenceStarters.some(pattern => pattern.test(skill))) {
      return false;
    }

    // Reject single common words that are not skills
    const singleWordExclusions = [
      'the',
      'and',
      'to',
      'with',
      'using',
      'about',
      'art',
      'tools',
      'and',
      'delivering',
      'measurable',
      'value',
      'stakeholders',
    ];
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
    if (words.length > 5) {
      // Skills are usually 1-4 words, rarely 5+
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
      'ensured',
      'cross',
      'institute',
      'refrigeration',
      'cryotechnology',
      'eco',
      '—', // em dash
      '–', // en dash
    ];

    if (nonSkillWords.some(word => lowerSkill.includes(word))) {
      return false;
    }

    // Reject if contains organization/institution patterns
    if (
      /institute|university|college|school|academy|organization|association|foundation/i.test(skill)
    ) {
      return false;
    }

    // Reject if starts with common verbs (likely part of a sentence)
    const verbStarters = [
      /^ensured/i,
      /^ensuring/i,
      /^developed/i,
      /^created/i,
      /^built/i,
      /^designed/i,
      /^implemented/i,
      /^managed/i,
      /^led/i,
      /^worked/i,
      /^collaborated/i,
      /^improved/i,
      /^optimized/i,
      /^maintained/i,
    ];
    if (verbStarters.some(pattern => pattern.test(skill))) {
      return false;
    }

    // Reject if contains em/en dashes (likely organization or range)
    if (/[—–]/.test(skill)) {
      return false;
    }

    // Reject incomplete phrases (ends with common words that suggest continuation)
    if (/^(ensured|ensuring|cross|&|and|or|the|a|an)\s*$/i.test(skill.trim())) {
      return false;
    }

    // Contains valid skill keywords OR looks like a technical term
    const hasValidKeyword = validSkillKeywords.some(keyword => lowerSkill.includes(keyword));
    const looksLikeTech = /^[a-z]+(?:\.js|\.ts|\.py|\.java|\.net|\.jsx|\.tsx)$/i.test(skill);
    const hasVersion = /\d+\.\d+/.test(skill); // Version numbers often indicate tech
    const looksLikeFramework =
      /^(react|vue|angular|next|nuxt|svelte|nest|express|django|flask|spring|laravel|rails)/i.test(
        skill
      );

    // For short skills (1-2 words), be more lenient - accept most reasonable tech terms
    if (words.length <= 2) {
      return (
        hasValidKeyword ||
        looksLikeTech ||
        hasVersion ||
        looksLikeFramework ||
        // Accept if it looks like a tech term (contains common tech patterns)
        /^(api|sdk|cli|ide|orm|mvc|mvp|saas|paas|iaas|devops|ml|ai|ui|ux|qa|tdd|bdd)$/i.test(
          skill
        ) ||
        // Accept if it's a reasonable length and doesn't look like a sentence
        (lowerSkill.length >= 2 && lowerSkill.length <= 30 && !/[.,;:!?]$/.test(skill.trim()))
      );
    }

    // For longer phrases (3-4 words), require clear tech indicators but be more lenient
    if (words.length <= 4) {
      return (
        hasValidKeyword ||
        looksLikeTech ||
        hasVersion ||
        looksLikeFramework ||
        // Accept compound tech terms like "React Native", "Material UI", etc.
        /^(react|vue|angular|node|python|java|spring|django|flask|laravel|rails|express|nest|next|nuxt|gatsby|remix|astro|tailwind|bootstrap|material|chakra|aws|azure|gcp|docker|kubernetes|terraform|jenkins|github|gitlab|jira|figma|photoshop|illustrator|sketch|xd|webpack|vite|jest|cypress|playwright|selenium)\s+/i.test(
          skill
        )
      );
    }

    // For very long phrases (5+ words), require clear tech indicators
    return hasValidKeyword || looksLikeTech || hasVersion || looksLikeFramework;
  }

  // Remove duplicates and clean up
  const uniqueSkills = Array.from(
    new Map(skills.map(s => [s.name?.toLowerCase().trim(), s])).values()
  ).filter(s => s.name && s.name.trim().length > 0);

  return uniqueSkills.slice(0, 50); // Limit to 50 skills (increased from 30)
}

/**
 * Calculate confidence score based on extracted data
 */
function calculateConfidence(data: ParsedResumeData): number {
  let score = 0;
  let maxScore = 0;

  // Personal info (35% - increased importance)
  maxScore += 35;
  if (data.personalInfo?.name) score += 15; // Increased from 10
  if (data.personalInfo?.email) score += 12; // Increased from 10
  if (data.personalInfo?.role) score += 8; // Added role as important
  if (data.personalInfo?.phone) score += 3; // Decreased from 5
  if (data.personalInfo?.location) score += 3; // Decreased from 5

  // Summary (10%)
  maxScore += 10;
  if (data.summary?.content && data.summary.content.length > 50) {
    score += 10;
  }

  // Experience (25% - decreased slightly)
  maxScore += 25;
  if (data.experiences && data.experiences.length > 0) {
    // Give more points for more experiences
    const expScore = Math.min(25, 5 + data.experiences.length * 4);
    score += expScore;
  }

  // Education (10% - decreased)
  maxScore += 10;
  if (data.education && data.education.length > 0) {
    score += Math.min(10, data.education.length * 5);
  }

  // Skills (20% - increased importance)
  maxScore += 20;
  if (data.skills && data.skills.length > 0) {
    // Give more points for more skills (up to 20)
    const skillsScore = Math.min(20, 5 + data.skills.length * 1.5);
    score += skillsScore;
  }

  const confidence = score / maxScore;

  // Log for debugging
  console.log('📊 [PDF Parser] Confidence calculation:', {
    score,
    maxScore,
    confidence: (confidence * 100).toFixed(1) + '%',
    hasName: !!data.personalInfo?.name,
    hasEmail: !!data.personalInfo?.email,
    hasRole: !!data.personalInfo?.role,
    experiencesCount: data.experiences?.length || 0,
    skillsCount: data.skills?.length || 0,
    educationCount: data.education?.length || 0,
  });

  return Math.min(1, confidence);
}

/**
 * Parse PDF resume and extract structured data
 */
export async function parsePDFResume(buffer: Buffer): Promise<ParsedResumeData> {
  const text = await extractTextFromPDF(buffer);

  if (!text || text.length < 100) {
    throw new Error('PDF appears to be empty or unreadable');
  }

  // Log first 500 chars for debugging
  console.log('📄 [PDF Parser] First 500 chars of extracted text:', text.substring(0, 500));

  const personalInfo = {
    name: extractName(text),
    role: extractRole(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    location: extractLocation(text),
    linkedinUrl: extractLinkedIn(text),
    portfolioUrl: extractPortfolio(text),
  };

  // Log extracted personal info for debugging
  console.log('📄 [PDF Parser] Extracted personal info:', {
    name: personalInfo.name || 'NOT FOUND',
    role: personalInfo.role || 'NOT FOUND',
    email: personalInfo.email || 'NOT FOUND',
    phone: personalInfo.phone || 'NOT FOUND',
    location: personalInfo.location || 'NOT FOUND',
  });

  const summary = {
    content: extractSummary(text),
  };

  const experiences = extractExperiences(text);
  const education = extractEducation(text);
  const skills = extractSkills(text);

  // Log extracted data for debugging
  console.log('📄 [PDF Parser] Extracted skills:', skills.length);
  console.log('📄 [PDF Parser] Skills list:', skills.map(s => s.name).join(', '));
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
