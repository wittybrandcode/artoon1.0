// ARTOON Constraint Validation Rules (Anti-patterns)

import { ValidationError, ValidationContext, ERROR_CODES } from '../types';

/**
 * Check for inline lists (forbidden)
 */
export function checkInlineLists(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!ctx.source) return errors;
  
  const lines = ctx.source.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for [li:: ...] or [ul:: ...] etc.
    if (line.match(/\[(li|ul|ol|dl|dt|dd)::/)) {
      errors.push({
        code: ERROR_CODES.INLINE_LIST,
        category: 'constraint',
        severity: 'error',
        line: i + 1,
        what: 'قائمة داخل inline',
        why: 'القوائم مكونات بنيوية فقط، لا يمكن تضمينها داخل النص',
        suggestion: 'استخدم القوائم كمكونات مستقلة: >.ul:: ثم li::'
      });
    }
  }
  
  return errors;
}

/**
 * Check for nested inline components (forbidden)
 */
export function checkNestedInline(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!ctx.source) return errors;
  
  const lines = ctx.source.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for nested brackets like [s:: [e:: text]]
    let depth = 0;
    let maxDepth = 0;
    
    for (const char of line) {
      if (char === '[') {
        depth++;
        maxDepth = Math.max(maxDepth, depth);
      } else if (char === ']') {
        depth--;
      }
    }
    
    if (maxDepth > 1) {
      errors.push({
        code: ERROR_CODES.NESTED_INLINE,
        category: 'constraint',
        severity: 'error',
        line: i + 1,
        what: 'تداخل في المكونات الداخلية',
        why: 'لا يُسمح بتداخل [...] داخل [...]. استخدم مُعدِّلات متعددة بدلاً من ذلك.',
        suggestion: 'استخدم [s+e:: text] بدلاً من [s:: [e:: text]]'
      });
    }
  }
  
  return errors;
}

/**
 * Check for empty components
 */
export function checkEmptyComponents(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (ctx.options.allowEmptyComponents) return errors;
  if (!ctx.source) return errors;
  
  const lines = ctx.source.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for >.type:: with nothing after (excluding separators)
    const match = line.match(/^[><]\.[a-z0-9]+::\s*$/i);
    if (match && !line.match(/\.(br|hr|wbr)/)) {
      errors.push({
        code: ERROR_CODES.EMPTY_COMPONENT,
        category: 'constraint',
        severity: 'warning',
        line: i + 1,
        what: 'مكون فارغ',
        why: 'المكونات يجب أن تحتوي على محتوى',
        suggestion: 'أضف محتوى بعد :: أو احذف السطر'
      });
    }
  }
  
  return errors;
}

/**
 * All constraint rules
 */
export const constraintRules = [
  checkInlineLists,
  checkNestedInline,
  checkEmptyComponents
];
