/**
 * Resume Theme Utilities
 * Handles dynamic theming for resume templates using CSS variables
 */

/**
 * Converts hex color to RGB values for CSS variables
 * @param hex - Hex color code (e.g., "#3B82F6")
 * @returns RGB string (e.g., "59 130 246")
 */
export function hexToRgb(hex: string): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `${r} ${g} ${b}`;
}

/**
 * Generates lighter/darker variations of a color
 * @param rgb - RGB string (e.g., "59 130 246")
 * @param factor - Adjustment factor (>1 for lighter, <1 for darker)
 * @returns RGB string
 */
function adjustColor(rgb: string, factor: number): string {
  const [r, g, b] = rgb.split(' ').map(Number);

  const adjust = (value: number) => {
    if (factor > 1) {
      // Lighten: move towards 255
      return Math.round(value + (255 - value) * (factor - 1));
    } else {
      // Darken: move towards 0
      return Math.round(value * factor);
    }
  };

  return `${adjust(r)} ${adjust(g)} ${adjust(b)}`;
}

/**
 * Applies accent color theme to resume preview
 * @param accentColor - Hex color code for the accent color
 * @param elementId - ID of the resume preview element (default: "resume-preview")
 */
export function applyResumeTheme(accentColor: string, elementId: string = 'resume-preview'): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id "${elementId}" not found`);
    return;
  }

  const rgbColor = hexToRgb(accentColor);
  const lightColor = adjustColor(rgbColor, 1.3); // 30% lighter
  const darkColor = adjustColor(rgbColor, 0.8); // 20% darker

  // Apply CSS variables to the element
  element.style.setProperty('--resume-accent-color', rgbColor);
  element.style.setProperty('--resume-accent-light', lightColor);
  element.style.setProperty('--resume-accent-dark', darkColor);
}

/**
 * Resets resume theme to default values
 * @param elementId - ID of the resume preview element (default: "resume-preview")
 */
export function resetResumeTheme(elementId: string = 'resume-preview'): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id "${elementId}" not found`);
    return;
  }

  // Reset to default blue accent
  element.style.removeProperty('--resume-accent-color');
  element.style.removeProperty('--resume-accent-light');
  element.style.removeProperty('--resume-accent-dark');
}

/**
 * Gets the current accent color from CSS variables
 * @param elementId - ID of the resume preview element (default: "resume-preview")
 * @returns RGB string or null if not found
 */
export function getCurrentAccentColor(elementId: string = 'resume-preview'): string | null {
  const element = document.getElementById(elementId);
  if (!element) {
    return null;
  }

  const computedStyle = getComputedStyle(element);
  return computedStyle.getPropertyValue('--resume-accent-color').trim();
}
