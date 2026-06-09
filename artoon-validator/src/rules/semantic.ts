// ARTOON Semantic Validation Rules

import {
  ValidationError,
  ValidationContext,
  ERROR_CODES,
  MODIFIER_ACCEPTING,
  NO_MODIFIER,
  VALID_MODIFIERS,
  REQUIRED_ATTRIBUTES
} from '../types';

/**
 * Check for modifiers on non-text components
 * Checks both AST and source (since parser may reject invalid combinations)
 */
export function checkModifierApplicability(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check source directly for modifier+non-text patterns
  // This catches cases where parser rejects the combination
  if (ctx.source) {
    const lines = ctx.source.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Pattern: [modifier+component:: ...] where component is in NO_MODIFIER
      for (const component of NO_MODIFIER) {
        // Match patterns like [s+img::, [e+video::, [s+e+c::, etc.
        const pattern = new RegExp(`\\[([seu]|mark|sub|sup)(\\+([seu]|mark|sub|sup))*\\+${component}::`, 'i');
        const match = line.match(pattern);

        if (match) {
          const modifierPart = match[0].slice(1, match[0].indexOf('+' + component));
          errors.push({
            code: ERROR_CODES.MODIFIER_ON_NON_TEXT,
            category: 'semantic',
            severity: 'error',
            line: i + 1,
            what: `مُعدِّل على مكون ${component}`,
            why: `المُعدِّلات للنصوص فقط. ${component} مكون وسائط/كود لا يقبل تعديل العرض.`,
            suggestion: `أزل المُعدِّل: [${component}:: ...] بدلاً من [${modifierPart}+${component}:: ...]`
          });
        }
      }
    }
  }

  // Also check AST for any that slipped through
  const ast = ctx.ast;
  if (!ast || !ast.content) return errors;

  function checkInlineContent(content: any[], line: number): void {
    if (!content) return;

    for (const item of content) {
      if (item.type === 'inline' && item.modifiers && item.modifiers.length > 0) {
        const component = item.component;

        if (component && NO_MODIFIER.includes(component)) {
          errors.push({
            code: ERROR_CODES.MODIFIER_ON_NON_TEXT,
            category: 'semantic',
            severity: 'error',
            line,
            what: `مُعدِّل على مكون ${component}`,
            why: `المُعدِّلات للنصوص فقط. ${component} مكون وسائط/كود لا يقبل تعديل العرض.`,
            suggestion: `أزل المُعدِّل: [${component}:: ...] بدلاً من [${item.modifiers.join('+')}+${component}:: ...]`
          });
        }

        // Check for invalid modifiers
        for (const mod of item.modifiers) {
          if (!VALID_MODIFIERS.includes(mod)) {
            errors.push({
              code: ERROR_CODES.INVALID_MODIFIER,
              category: 'semantic',
              severity: 'error',
              line,
              what: `مُعدِّل غير صالح: ${mod}`,
              why: `المُعدِّلات الصالحة هي: ${VALID_MODIFIERS.join(', ')}`,
              suggestion: `استخدم أحد المُعدِّلات الصالحة`
            });
          }
        }
      }
    }
  }

  function checkNode(node: any): void {
    function checkListItem(item: any, line: number): void {
      if (item.content) {
        checkInlineContent(item.content, line);
      }
      if (item.children) {
        if (Array.isArray(item.children)) {
          item.children.forEach((c: any) => checkListItem(c, line));
        } else {
          checkNode(item.children); // V1 Compatibility
        }
      }
    }

    // Check text nodes
    if ((node.nodeType === 'text' || node.type === 'text') && node.content) {
      checkInlineContent(node.content, node.line || 0);
    }

    // Check list items
    if (node.items && Array.isArray(node.items)) {
      for (const item of node.items) {
        checkListItem(item, node.line || 0);
      }
    }

    // Recurse into children
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(checkNode);
    }
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((c: any) => {
        if (c.node) checkNode(c.node);
        else checkNode(c);
      });
    }
  }

  ast.content.forEach(checkNode);

  return errors;
}

/**
 * Check for missing required attributes
 */
export function checkRequiredAttributes(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];
  const ast = ctx.ast;

  if (!ast || !ast.content) return errors;

  function checkInlineContent(content: any[], line: number): void {
    if (!content) return;

    for (const item of content) {
      if (item.type === 'inline' && item.component) {
        const component = item.component;
        const required = REQUIRED_ATTRIBUTES[component];

        if (required) {
          for (const attr of required) {
            if (!item.attributes || !item.attributes[attr]) {
              // Check if first attribute exists (often unnamed)
              const hasValue = item.attributes && Object.keys(item.attributes).length > 0;
              if (!hasValue) {
                errors.push({
                  code: ERROR_CODES.MISSING_REQUIRED_ATTRIBUTE,
                  category: 'semantic',
                  severity: 'error',
                  line,
                  what: `سمة مطلوبة مفقودة: ${attr} في ${component}`,
                  why: `المكون ${component} يتطلب السمة ${attr}`,
                  suggestion: `أضف السمة: [${component}:: ${attr}; ...]`
                });
              }
            }
          }
        }
      }
    }
  }

  function checkNode(node: any): void {
    function checkListItem(item: any, line: number): void {
      if (item.content) {
        checkInlineContent(item.content, line);
      }
      if (item.children) {
        if (Array.isArray(item.children)) {
          item.children.forEach((c: any) => checkListItem(c, line));
        } else {
          checkNode(item.children); // V1 Compatibility
        }
      }
    }

    // Check media nodes
    if (node.nodeType === 'media' || node.type === 'media') {
      if (!node.src) {
        errors.push({
          code: ERROR_CODES.MISSING_REQUIRED_ATTRIBUTE,
          category: 'semantic',
          severity: 'error',
          line: node.line || 0,
          what: `مسار مفقود في ${node.mediaType || node.type}`,
          why: `المكون ${node.mediaType || node.type} يتطلب مسار الملف`,
          suggestion: `أضف المسار: >.${node.mediaType || node.type}:: path/to/file`
        });
      }
    }

    // Check link nodes
    if (node.nodeType === 'link' || node.type === 'link') {
      if (!node.url) {
        errors.push({
          code: ERROR_CODES.MISSING_REQUIRED_ATTRIBUTE,
          category: 'semantic',
          severity: 'error',
          line: node.line || 0,
          what: 'رابط مفقود في a',
          why: 'المكون a يتطلب رابط URL',
          suggestion: 'أضف الرابط: >.a:: https://...'
        });
      }
    }

    // Check text nodes for inline content
    if ((node.nodeType === 'text' || node.type === 'text') && node.content) {
      checkInlineContent(node.content, node.line || 0);
    }

    // Check list items
    if (node.items && Array.isArray(node.items)) {
      for (const item of node.items) {
        checkListItem(item, node.line || 0);
      }
    }

    // Recurse
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(checkNode);
    }
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((c: any) => {
        if (c.node) checkNode(c.node);
        else checkNode(c);
      });
    }
  }

  ast.content.forEach(checkNode);

  return errors;
}

/**
 * All semantic rules
 */
export const semanticRules = [
  checkModifierApplicability,
  checkRequiredAttributes
];
