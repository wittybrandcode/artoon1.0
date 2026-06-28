/**
 * Core Utilities
 */

let idCounter = 0;

/**
 * Generate a unique ID with optional prefix
 */
export function generateId(prefix: string = 'block'): string {
  return `${prefix}-${++idCounter}-${Date.now().toString(36)}`;
}

/**
 * Reset ID counter (for testing)
 */
export function resetIdCounter(): void {
  idCounter = 0;
}

/**
 * Generate a random ID (for cases where order doesn't matter)
 */
export function randomId(prefix: string = 'block'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if two arrays are equal (shallow)
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function sanitizeUrl(url: string): string {
  if (!url) return '';
  // Very basic sanitization, preventing javascript: and data: links unless explicitly allowed
  const lowerUrl = url.toLowerCase().trim();
  if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:text/html') || lowerUrl.startsWith('vbscript:')) {
    return 'about:blank';
  }
  return url;
}
