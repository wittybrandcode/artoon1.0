// ARTOON Validator Types

import { ARTOONDocument } from '@artoon/ast';

/**
 * Error severity levels
 */
export type Severity = 'error' | 'warning' | 'philosophy';

/**
 * Error categories
 */
export type ErrorCategory = 'syntax' | 'structure' | 'semantic' | 'constraint' | 'philosophy';

/**
 * Validation error
 */
export interface ValidationError {
  code: string;
  category: ErrorCategory;
  severity: Severity;
  line: number;
  column?: number;
  what: string;      // What happened
  why: string;       // Why it's an error
  suggestion?: string; // How to fix it
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  philosophyBreaches: ValidationError[];
  stats: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    breachCount: number;
  };
}

/**
 * Validation rule
 */
export interface ValidationRule {
  id: string;
  category: ErrorCategory;
  severity: Severity;
  check: (context: ValidationContext) => ValidationError[];
}

/**
 * Validation context
 */
export interface ValidationContext {
  ast: ARTOONDocument | any;
  source?: string;
  options: ValidationOptions;
}

/**
 * Validation options
 */
export interface ValidationOptions {
  strict?: boolean;           // Treat warnings as errors
  allowEmptyComponents?: boolean;
  checkPhilosophy?: boolean;  // Default: true
}

/**
 * Error codes
 */
export const ERROR_CODES = {
  // Syntax errors
  MISSING_SPACE_AFTER_SEPARATOR: 'SYN001',
  UNCLOSED_BRACKET: 'SYN002',
  INVALID_DIRECTION_MARKER: 'SYN003',
  MALFORMED_COMPONENT: 'SYN004',

  // Structure errors
  UNCLOSED_BLOCK: 'STR001',
  MISMATCHED_BLOCK_NAME: 'STR002',
  ORPHAN_LIST_ITEM: 'STR003',
  INVALID_NESTING: 'STR004',
  EMPTY_COMPOUND: 'STR005',

  // Semantic errors
  MODIFIER_ON_NON_TEXT: 'SEM001',
  INVALID_ATTRIBUTE: 'SEM002',
  MISSING_REQUIRED_ATTRIBUTE: 'SEM003',
  UNKNOWN_COMPONENT: 'SEM004',
  INVALID_MODIFIER: 'SEM005',

  // Constraint errors
  INLINE_LIST: 'CON001',
  NESTED_INLINE: 'CON002',
  EMPTY_COMPONENT: 'CON003',

  // Philosophy breaches
  PRESENTATION_LEAK: 'PHI001',
  BEHAVIOR_LEAK: 'PHI002',
  SEMANTIC_VIOLATION: 'PHI003'
} as const;

/**
 * Components that accept modifiers
 */
export const MODIFIER_ACCEPTING = ['p', 't1', 't2', 't3', 't4', 't5', 't6', 'q', 'pre', 'a', 'abbr', 'time'];

/**
 * Components that do NOT accept modifiers
 */
export const NO_MODIFIER = ['img', 'audio', 'video', 'file', 'c'];

/**
 * Valid modifiers
 */
export const VALID_MODIFIERS = ['s', 'e', 'u', 'd', 'mark', 'sub', 'sup'];

/**
 * Required attributes per component
 */
export const REQUIRED_ATTRIBUTES: Record<string, string[]> = {
  img: ['path'],
  audio: ['path'],
  video: ['path'],
  file: ['path'],
  a: ['url'],
  abbr: ['short', 'full'],
  time: ['datetime'],
  c: ['code']
};

/**
 * Optional attributes per component
 */
export const OPTIONAL_ATTRIBUTES: Record<string, string[]> = {
  img: ['alt', 'title'],
  audio: ['title'],
  video: ['title'],
  file: ['label'],
  a: ['text'],
  time: ['display'],
  c: ['lang']
};

/**
 * Presentation keywords (philosophy breach)
 */
export const PRESENTATION_KEYWORDS = [
  'color', 'font', 'size', 'style', 'class', 'css',
  'background', 'border', 'margin', 'padding',
  'width', 'height', 'display', 'position'
];

/**
 * Behavior keywords (philosophy breach)
 */
export const BEHAVIOR_KEYWORDS = [
  'onclick', 'onhover', 'onmouse', 'onkey', 'onfocus',
  'onload', 'onsubmit', 'onchange', 'oninput',
  'javascript:', 'href="#"'
];
