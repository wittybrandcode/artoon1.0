// ARTOON Syntax Validation Rules

import { ValidationError, ValidationContext, ERROR_CODES } from '../types';

/**
 * Check for space after separator ::
 */
export function checkSpaceAfterSeparator(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!ctx.source) return errors;
  
  const lines = ctx.source.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/::[^\s\n]/);
    
    if (match && !line.includes(':::')) { // Exclude comments
      errors.push({
        code: ERROR_CODES.MISSING_SPACE_AFTER_SEPARATOR,
        category: 'syntax',
        severity: 'error',
        line: i + 1,
        column: match.index! + 1,
        what: 'مسافة مفقودة بعد ::',
        why: 'الفاصل :: يجب أن يُتبع بمسافة لفصل النوع عن المحتوى',
        suggestion: 'أضف مسافة بعد ::'
      });
    }
  }
  
  return errors;
}

/**
 * Check for unclosed brackets in inline content
 */
export function checkUnclosedBrackets(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!ctx.source) return errors;
  
  const lines = ctx.source.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let depth = 0;
    let lastOpenIndex = -1;
    
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '[') {
        if (depth === 0) lastOpenIndex = j;
        depth++;
      } else if (line[j] === ']') {
        depth--;
      }
    }
    
    if (depth > 0) {
      errors.push({
        code: ERROR_CODES.UNCLOSED_BRACKET,
        category: 'syntax',
        severity: 'error',
        line: i + 1,
        column: lastOpenIndex + 1,
        what: 'قوس [ غير مغلق',
        why: 'كل قوس [ يجب أن يُغلق بـ ] في نفس السطر',
        suggestion: 'أضف ] لإغلاق القوس'
      });
    }
  }
  
  return errors;
}

/**
 * Check for valid direction markers
 */
export function checkDirectionMarkers(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!ctx.source) return errors;
  
  const lines = ctx.source.split(/\r?\n/);
  let inBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Track block state
    if (line.startsWith('<') && line.endsWith('.')) {
      inBlock = true;
      continue;
    }
    if (line.startsWith('.<') || line.startsWith('.')) {
      inBlock = false;
      continue;
    }
    
    // Skip block content
    if (inBlock) continue;
    
    // Skip list items and table rows (they don't need direction)
    if (line.match(/^-*(?:li|dt|dd|th|tr)::/)) continue;
    
    // Check for direction marker
    if (!line.startsWith('>') && !line.startsWith('<')) {
      // Could be valid (block content, etc.)
      continue;
    }
  }
  
  return errors;
}

/**
 * All syntax rules
 */
export const syntaxRules = [
  checkSpaceAfterSeparator,
  checkUnclosedBrackets,
  checkDirectionMarkers
];
