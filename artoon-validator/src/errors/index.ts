// ARTOON Validation Errors - Utilities

import { ValidationError, ERROR_CODES } from '../types';

/**
 * Create a validation error
 */
export function createError(
  code: string,
  category: 'syntax' | 'structure' | 'semantic' | 'constraint' | 'philosophy',
  severity: 'error' | 'warning' | 'philosophy',
  line: number,
  what: string,
  why: string,
  suggestion?: string,
  column?: number
): ValidationError {
  return {
    code,
    category,
    severity,
    line,
    column,
    what,
    why,
    suggestion
  };
}

type ErrorTemplate = {
  what: string | ((...args: string[]) => string);
  why: string | ((...args: string[]) => string);
  suggestion?: string | ((...args: string[]) => string);
};

/**
 * English-first templates for consistent CI output.
 */
export const ERROR_MESSAGES: Record<string, ErrorTemplate> = {
  [ERROR_CODES.MISSING_SPACE_AFTER_SEPARATOR]: {
    what: 'Missing space after ::',
    why: 'The :: separator must be followed by a space to clearly distinguish the component type from its content.',
    suggestion: 'Add a single space immediately after the :: separator.'
  },
  [ERROR_CODES.UNCLOSED_BRACKET]: {
    what: 'Unclosed [ bracket',
    why: 'Inline components and modifiers starting with [ must be terminated with a matching ] on the same line.',
    suggestion: 'Append a ] to correctly close the inline component or modifier block.'
  },
  [ERROR_CODES.UNCLOSED_BLOCK]: {
    what: (name: string) => `Unclosed <${name}> block`,
    why: 'Multi-line blocks initiated with <name>. require a corresponding .<name> termination marker to maintain structural integrity.',
    suggestion: (name: string) => `Insert .<${name}> on a new line to close the block.`
  },
  [ERROR_CODES.MODIFIER_ON_NON_TEXT]: {
    what: (mod: string, comp: string) => `Modifier "${mod}" applied to non-text component: ${comp}`,
    why: (comp: string) => `Semantic modifiers (like bold or italic) are only applicable to text-based components. The "${comp}" component does not support these modifiers.`,
    suggestion: 'Remove the modifier from the component or move the content to a text-capable component.'
  },
  [ERROR_CODES.INLINE_LIST]: {
    what: 'List component embedded inline',
    why: 'Lists are structural block-level elements in ARTOON and cannot be nested within inline text content.',
    suggestion: 'Extract the list and define it as a standalone block-level list component.'
  },
  [ERROR_CODES.PRESENTATION_LEAK]: {
    what: (keyword: string) => `Presentation leak detected: "${keyword}"`,
    why: 'ARTOON is a semantic-first format. Visual styling information (like colors or explicit sizes) violates the separation of content and presentation.',
    suggestion: 'Remove the styling keyword and rely on the renderer to determine visual appearance based on component semantics.'
  },
  [ERROR_CODES.BEHAVIOR_LEAK]: {
    what: (keyword: string) => `Behavior leak detected: "${keyword}"`,
    why: 'ARTOON describes what the content is, not how it behaves at runtime. Interactive logic and event handlers should be handled by the application layer.',
    suggestion: 'Remove the behavioral reference or event handler from the content.'
  }
};

/**
 * Get error template by code.
 */
export function getErrorTemplate(code: string): ErrorTemplate | undefined {
  return ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES];
}

/**
 * Normalize error text to bilingual output if Arabic-only text is detected.
 */
export function withBilingualFallback(error: ValidationError): ValidationError {
  const template = getErrorTemplate(error.code);
  if (!template) return error;

  const englishWhat = typeof template.what === 'function' ? template.what('value', 'value') : template.what;
  const englishWhy = typeof template.why === 'function' ? template.why('value', 'value') : template.why;
  const englishSuggestion = template.suggestion
    ? (typeof template.suggestion === 'function' ? template.suggestion('value') : template.suggestion)
    : undefined;

  return {
    ...error,
    what: needsEnglishFallback(error.what) ? `${englishWhat} | ${error.what}` : error.what,
    why: needsEnglishFallback(error.why) ? `${englishWhy} | ${error.why}` : error.why,
    suggestion: error.suggestion
      ? (needsEnglishFallback(error.suggestion)
          ? `${englishSuggestion || 'Suggested fix'} | ${error.suggestion}`
          : error.suggestion)
      : englishSuggestion
  };
}

function needsEnglishFallback(value: string): boolean {
  return /[^\x00-\x7F]/.test(value);
}

// Re-export ERROR_CODES
export { ERROR_CODES };
