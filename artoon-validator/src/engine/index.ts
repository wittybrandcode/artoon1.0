// ARTOON Validation Engine

import {
  ValidationResult,
  ValidationError,
  ValidationContext,
  ValidationOptions,
  ValidationRule
} from '../types';
import type { ARTOONDocument } from '@artoon/ast';
import { syntaxRules } from '../rules/syntax';
import { structureRules } from '../rules/structure';
import { semanticRules } from '../rules/semantic';
import { constraintRules } from '../rules/constraint';
import { philosophyRules } from '../rules/philosophy';
import { withBilingualFallback } from '../errors';

/**
 * Default validation options
 */
const DEFAULT_OPTIONS: ValidationOptions = {
  strict: false,
  allowEmptyComponents: false,
  checkPhilosophy: true
};

const customRules: Map<string, ValidationRule> = new Map();

export interface StateValidationInput {
  doc?: {
    toAST?: () => unknown;
    ast?: unknown;
  };
  toJSON?: () => { doc?: unknown };
}

/**
 * Run all validation rules
 */
export function validate(
  ast: any,
  source?: string,
  options: ValidationOptions = {}
): ValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const context: ValidationContext = {
    ast,
    source,
    options: opts
  };

  const allErrors: ValidationError[] = [];

  const ruleCategories = [
    syntaxRules,
    structureRules,
    semanticRules,
    constraintRules,
    philosophyRules
  ];

  for (const rules of ruleCategories) {
    for (const rule of rules) {
      const errors = rule(context);
      allErrors.push(...errors);
    }
  }

  for (const rule of customRules.values()) {
    allErrors.push(...rule.check(context));
  }

  // Include parser errors if present
  if (ast.errors) {
    for (const err of ast.errors) {
      allErrors.push({
        code: 'PARSER_ERROR',
        category: err.type || 'syntax',
        severity: 'error',
        line: err.line,
        column: err.column,
        what: err.message,
        why: 'Parser error',
        suggestion: err.suggestion
      });
    }
  }

  const normalizedErrors = allErrors.map(withBilingualFallback);

  const errors = normalizedErrors.filter(e => e.severity === 'error');
  const warnings = normalizedErrors.filter(e => e.severity === 'warning');
  const breaches = normalizedErrors.filter(e => e.severity === 'philosophy');

  if (opts.strict) {
    errors.push(...warnings);
    warnings.length = 0;
  }

  const valid = errors.length === 0 && breaches.length === 0;

  return {
    valid,
    errors,
    warnings,
    philosophyBreaches: breaches,
    stats: {
      totalIssues: allErrors.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      breachCount: breaches.length
    }
  };
}

/**
 * Register a custom rule.
 */
export function addRule(rule: ValidationRule): void {
  customRules.set(rule.id, rule);
}

/**
 * Remove a custom rule by id.
 */
export function removeRule(id: string): void {
  customRules.delete(id);
}

/**
 * Clear all custom rules.
 */
export function clearRules(): void {
  customRules.clear();
}

/**
 * List custom rule IDs.
 */
export function listRules(): string[] {
  return Array.from(customRules.keys());
}

/**
 * Quick validation - returns true/false.
 */
export function isValid(ast: any, source?: string): boolean {
  const result = validate(ast, source);
  return result.valid;
}

/**
 * Validate and throw on errors.
 */
export function validateStrict(ast: any, source?: string): void {
  const result = validate(ast, source, { strict: true });

  if (!result.valid) {
    const messages = [
      ...result.errors.map(e => `[ERROR] Line ${e.line}: ${e.what}`),
      ...result.philosophyBreaches.map(e => `[PHILOSOPHY] Line ${e.line}: ${e.what}`)
    ];

    throw new Error(`Validation failed:\n${messages.join('\n')}`);
  }
}

/**
 * Validate from state kernel shape (EditorState-like).
 */
export function validateState(
  state: StateValidationInput,
  source?: string,
  options: ValidationOptions = {}
): ValidationResult {
  return validate(resolveStateDocument(state), source, options);
}

/**
 * Quick state validation - returns true/false.
 */
export function isValidState(
  state: StateValidationInput,
  source?: string
): boolean {
  return isValid(resolveStateDocument(state), source);
}

/**
 * Strict state validation - throws on errors.
 */
export function validateStateStrict(
  state: StateValidationInput,
  source?: string
): void {
  validateStrict(resolveStateDocument(state), source);
}

/**
 * Human-readable report.
 */
export function formatReport(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push('=== ARTOON Validation Report ===\n');

  if (result.valid) {
    lines.push('? Document is valid\n');
  } else {
    lines.push('? Document has issues\n');
  }

  lines.push('Statistics:');
  lines.push(`  Total issues: ${result.stats.totalIssues}`);
  lines.push(`  Errors: ${result.stats.errorCount}`);
  lines.push(`  Warnings: ${result.stats.warningCount}`);
  lines.push(`  Philosophy breaches: ${result.stats.breachCount}`);
  lines.push('');

  if (result.philosophyBreaches.length > 0) {
    lines.push('[PHILOSOPHY BREACHES]');
    for (const err of result.philosophyBreaches) {
      lines.push(`  Line ${err.line}: ${err.what}`);
      lines.push(`    Why: ${err.why}`);
      if (err.suggestion) lines.push(`    Fix: ${err.suggestion}`);
    }
    lines.push('');
  }

  if (result.errors.length > 0) {
    lines.push('[ERRORS]');
    for (const err of result.errors) {
      lines.push(`  Line ${err.line}: ${err.what}`);
      lines.push(`    Why: ${err.why}`);
      if (err.suggestion) lines.push(`    Fix: ${err.suggestion}`);
    }
    lines.push('');
  }

  if (result.warnings.length > 0) {
    lines.push('[WARNINGS]');
    for (const err of result.warnings) {
      lines.push(`  Line ${err.line}: ${err.what}`);
      if (err.suggestion) lines.push(`    Fix: ${err.suggestion}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Machine-readable JSON report for CI/CD.
 */
export function formatReportJSON(result: ValidationResult, pretty: boolean = true): string {
  const payload = {
    valid: result.valid,
    stats: result.stats,
    issues: {
      errors: result.errors,
      warnings: result.warnings,
      philosophyBreaches: result.philosophyBreaches
    }
  };

  return JSON.stringify(payload, null, pretty ? 2 : 0);
}

function resolveStateDocument(state: StateValidationInput): ARTOONDocument {
  const doc = state?.doc;
  if (doc?.toAST) {
    const ast = doc.toAST();
    if (isArtoonDocument(ast)) return ast;
  }

  if (isArtoonDocument(doc?.ast)) {
    return doc.ast;
  }

  const jsonDoc = state?.toJSON?.().doc;
  if (isArtoonDocument(jsonDoc)) {
    return jsonDoc;
  }

  throw new Error('Invalid state input: expected state.doc.toAST() or state.toJSON().doc');
}

function isArtoonDocument(value: unknown): value is ARTOONDocument {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { version?: unknown; content?: unknown };
  return typeof candidate.version === 'string' && Array.isArray(candidate.content);
}
