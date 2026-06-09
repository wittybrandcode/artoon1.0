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
    why: 'Separator :: should be followed by a space between component type and content.',
    suggestion: 'Add one space after ::'
  },
  [ERROR_CODES.UNCLOSED_BRACKET]: {
    what: 'Unclosed [ bracket',
    why: 'Each [ must be closed with ] on the same line.',
    suggestion: 'Add ] to close the bracket'
  },
  [ERROR_CODES.UNCLOSED_BLOCK]: {
    what: (name: string) => `Unclosed <${name}> block`,
    why: 'Every opened block must have a matching closing marker.',
    suggestion: (name: string) => `Add .<${name}> to close the block`
  },
  [ERROR_CODES.MODIFIER_ON_NON_TEXT]: {
    what: (mod: string, comp: string) => `Modifier "${mod}" used on non-text component ${comp}`,
    why: (comp: string) => `Text modifiers are only valid on text-capable components, not ${comp}.`,
    suggestion: 'Move modifier usage to a text component'
  },
  [ERROR_CODES.INLINE_LIST]: {
    what: 'List component used inline',
    why: 'List components are structural blocks and cannot be embedded inline.',
    suggestion: 'Create the list as standalone list nodes'
  },
  [ERROR_CODES.PRESENTATION_LEAK]: {
    what: (keyword: string) => `Presentation leak: "${keyword}"`,
    why: 'ARTOON should describe semantics, not visual styling details.',
    suggestion: 'Remove style/presentation terms from content'
  },
  [ERROR_CODES.BEHAVIOR_LEAK]: {
    what: (keyword: string) => `Behavior leak: "${keyword}"`,
    why: 'ARTOON should describe content semantics, not runtime behavior.',
    suggestion: 'Remove behavior/event handler references from content'
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
