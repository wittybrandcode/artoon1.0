// ARTOON Error Handler
// Error detection and classification

import { ParseError } from '../ast/types';

/**
 * Error types
 */
export type ErrorType = 'syntax' | 'structure' | 'semantic' | 'constraint';

/**
 * Error severity
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Extended error with severity
 */
export interface ExtendedError extends ParseError {
  severity: ErrorSeverity;
  code?: string;
}

/**
 * Error codes
 */
export const ERROR_CODES = {
  // Syntax errors
  MISSING_SEPARATOR_SPACE: 'E001',
  UNCLOSED_BRACKET: 'E002',
  INVALID_DIRECTION: 'E003',
  INVALID_MODIFIER: 'E004',
  
  // Structure errors
  UNCLOSED_BLOCK: 'E101',
  MISMATCHED_BLOCK: 'E102',
  ORPHAN_CHILD: 'E103',
  INVALID_NESTING: 'E104',
  
  // Semantic errors
  MODIFIER_ON_MEDIA: 'E201',
  INVALID_COMPONENT: 'E202',
  MISSING_REQUIRED_ATTR: 'E203',
  
  // Constraint errors
  INLINE_LIST: 'E301',
  NESTED_BLOCK: 'E302'
} as const;

/**
 * Create syntax error
 */
export function syntaxError(
  line: number,
  column: number,
  message: string,
  suggestion?: string,
  code?: string
): ExtendedError {
  return {
    type: 'syntax',
    severity: 'error',
    line,
    column,
    message,
    suggestion,
    code
  };
}

/**
 * Create structure error
 */
export function structureError(
  line: number,
  column: number,
  message: string,
  suggestion?: string,
  code?: string
): ExtendedError {
  return {
    type: 'structure',
    severity: 'error',
    line,
    column,
    message,
    suggestion,
    code
  };
}

/**
 * Create semantic error
 */
export function semanticError(
  line: number,
  column: number,
  message: string,
  suggestion?: string,
  code?: string
): ExtendedError {
  return {
    type: 'semantic',
    severity: 'error',
    line,
    column,
    message,
    suggestion,
    code
  };
}

/**
 * Create constraint error
 */
export function constraintError(
  line: number,
  column: number,
  message: string,
  suggestion?: string,
  code?: string
): ExtendedError {
  return {
    type: 'constraint',
    severity: 'error',
    line,
    column,
    message,
    suggestion,
    code
  };
}

/**
 * Create warning
 */
export function warning(
  line: number,
  column: number,
  message: string,
  suggestion?: string
): ExtendedError {
  return {
    type: 'semantic',
    severity: 'warning',
    line,
    column,
    message,
    suggestion
  };
}

/**
 * Error collector
 */
export class ErrorCollector {
  private errors: ExtendedError[] = [];
  
  /**
   * Add error
   */
  add(error: ExtendedError): void {
    this.errors.push(error);
  }
  
  /**
   * Add parse error
   */
  addParseError(error: ParseError): void {
    this.errors.push({
      ...error,
      severity: 'error'
    });
  }
  
  /**
   * Get all errors
   */
  getAll(): ExtendedError[] {
    return [...this.errors];
  }
  
  /**
   * Get errors only (no warnings)
   */
  getErrors(): ExtendedError[] {
    return this.errors.filter(e => e.severity === 'error');
  }
  
  /**
   * Get warnings only
   */
  getWarnings(): ExtendedError[] {
    return this.errors.filter(e => e.severity === 'warning');
  }
  
  /**
   * Check if has errors
   */
  hasErrors(): boolean {
    return this.errors.some(e => e.severity === 'error');
  }
  
  /**
   * Get error count
   */
  errorCount(): number {
    return this.getErrors().length;
  }
  
  /**
   * Get warning count
   */
  warningCount(): number {
    return this.getWarnings().length;
  }
  
  /**
   * Clear all errors
   */
  clear(): void {
    this.errors = [];
  }
  
  /**
   * Sort errors by line number
   */
  sorted(): ExtendedError[] {
    return [...this.errors].sort((a, b) => a.line - b.line);
  }
  
  /**
   * Format errors for display
   */
  format(): string {
    return this.sorted()
      .map(e => `[${e.severity.toUpperCase()}] Line ${e.line}: ${e.message}`)
      .join('\n');
  }
}

/**
 * Create error collector
 */
export function createErrorCollector(): ErrorCollector {
  return new ErrorCollector();
}

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  MISSING_SPACE_AFTER_SEPARATOR: 'Space required after ::',
  UNCLOSED_INLINE_BRACKET: 'Unclosed inline bracket [',
  UNCLOSED_BLOCK: (name: string) => `Block <${name}> not closed`,
  MISMATCHED_BLOCK_END: (expected: string, got: string) => 
    `Expected .<${expected}> but got .<${got}>`,
  MODIFIER_NOT_ALLOWED: (modifier: string, component: string) =>
    `Modifier ${modifier} not allowed on ${component}`,
  INVALID_CHILD: (child: string, parent: string) =>
    `${child} is not valid inside ${parent}`,
  ORPHAN_CHILD_ELEMENT: 'Child element >.- without parent compound',
  INLINE_LIST_NOT_ALLOWED: 'Lists cannot be inline'
};
