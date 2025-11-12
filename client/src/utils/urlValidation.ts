/**
 * URL Validation and Sanitization Utilities
 * Prevents XSS attacks via javascript: protocol and other malicious URLs
 */

/**
 * Validates if a URL is safe to use in href attributes
 * Only allows http://, https://, mailto:, and tel: protocols
 *
 * @param url - The URL string to validate
 * @returns true if the URL is safe, false otherwise
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return false;
  }

  const trimmedUrl = url.trim().toLowerCase();

  // Block javascript: protocol and data: URIs
  if (trimmedUrl.startsWith('javascript:') || trimmedUrl.startsWith('data:')) {
    return false;
  }

  // Allow safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  try {
    const urlObj = new URL(trimmedUrl);
    return safeProtocols.includes(urlObj.protocol);
  } catch {
    // If URL parsing fails, check if it's a relative URL or starts with safe protocol
    // For relative URLs, we'll allow them (they're safe)
    if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('#')) {
      return true;
    }
    // Check if it starts with a safe protocol (case-insensitive)
    return safeProtocols.some(protocol => trimmedUrl.startsWith(protocol));
  }
}

/**
 * Sanitizes a URL for safe use in href attributes
 * Returns the original URL if valid, or '#' if invalid
 *
 * @param url - The URL string to sanitize
 * @returns Safe URL string or '#' as fallback
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return '#';
  }

  if (isValidUrl(url)) {
    return url.trim();
  }

  // Return safe fallback for invalid URLs
  return '#';
}

/**
 * Validates and returns a safe URL, or null if invalid
 * Useful when you want to conditionally render links
 *
 * @param url - The URL string to validate
 * @returns Safe URL string or null if invalid
 */
export function getSafeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  if (isValidUrl(url)) {
    return url.trim();
  }

  return null;
}
