// ARTOON Structure Validation Rules

import { ValidationError, ValidationContext, ERROR_CODES } from '../types';

/**
 * Check for unclosed blocks
 */
export function checkUnclosedBlocks(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!ctx.source) return errors;

  const lines = ctx.source.split(/\r?\n/);
  const blockStack: { name: string; line: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Block start: <name>. or <name:lang>.
    const startMatch = line.match(/^<([a-z][a-z0-9]*)(:[a-z]+)?>\.$/i);
    if (startMatch) {
      blockStack.push({ name: startMatch[1], line: i + 1 });
      continue;
    }

    // Block end: .<name>
    const endMatch = line.match(/^\.<([a-z][a-z0-9]*)>$/i);
    if (endMatch) {
      const endName = endMatch[1];

      if (blockStack.length === 0) {
        errors.push({
          code: ERROR_CODES.MISMATCHED_BLOCK_NAME,
          category: 'structure',
          severity: 'error',
          line: i + 1,
          what: `إغلاق بلوك .<${endName}> بدون فتح`,
          why: 'كل إغلاق بلوك يجب أن يسبقه فتح مطابق',
          suggestion: `أضف <${endName}>. قبل هذا السطر أو احذف الإغلاق`
        });
        continue;
      }

      const lastBlock = blockStack[blockStack.length - 1];
      if (lastBlock.name !== endName) {
        errors.push({
          code: ERROR_CODES.MISMATCHED_BLOCK_NAME,
          category: 'structure',
          severity: 'error',
          line: i + 1,
          what: `إغلاق .<${endName}> لا يطابق الفتح <${lastBlock.name}>.`,
          why: 'اسم إغلاق البلوك يجب أن يطابق اسم الفتح',
          suggestion: `استخدم .<${lastBlock.name}> بدلاً من .<${endName}>`
        });
      }

      blockStack.pop();
    }
  }

  // Report unclosed blocks
  for (const block of blockStack) {
    errors.push({
      code: ERROR_CODES.UNCLOSED_BLOCK,
      category: 'structure',
      severity: 'error',
      line: block.line,
      what: `بلوك <${block.name}>. غير مغلق`,
      why: 'كل بلوك يجب أن يُغلق بـ .<name>',
      suggestion: `أضف .<${block.name}> لإغلاق البلوك`
    });
  }

  return errors;
}

/**
 * Check for invalid list nesting (jumping levels)
 */
export function checkListNesting(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!ctx.source) return errors;

  const lines = ctx.source.split(/\r?\n/);
  let currentDepth = -1;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // List container
    if (line.match(/^>\.[uod]l::$/)) {
      inList = true;
      currentDepth = 0;
      continue;
    }

    // List item
    const itemMatch = line.match(/^(-*)(?:li|dt|dd)::/);
    if (itemMatch) {
      const depth = itemMatch[1].length;

      // Check for jumping more than one level
      if (inList && depth > currentDepth + 1) {
        errors.push({
          code: ERROR_CODES.INVALID_NESTING,
          category: 'structure',
          severity: 'error',
          line: i + 1,
          what: `قفز في مستوى التداخل من ${currentDepth} إلى ${depth}`,
          why: 'لا يمكن القفز أكثر من مستوى واحد في القوائم',
          suggestion: `استخدم ${'-'.repeat(currentDepth + 1)}li:: للمستوى التالي`
        });
      }

      currentDepth = depth;
      continue;
    }

    // Non-list component resets
    if (line.match(/^>\.[a-z]/i) && !line.match(/^>\.[uod]l::/)) {
      inList = false;
      currentDepth = -1;
    }
  }

  return errors;
}

/**
 * Check for empty compound components
 */
export function checkEmptyCompounds(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];
  const ast = ctx.ast;

  if (!ast || !ast.content) return errors;

  function checkNode(node: any): void {
    if (node.nodeType === 'compound' || node.type === 'compound') {
      const children = node.children || [];
      if (children.length === 0) {
        errors.push({
          code: ERROR_CODES.EMPTY_COMPOUND,
          category: 'structure',
          severity: 'warning',
          line: node.line || 0,
          what: `مكون مركب ${node.compoundType || node.componentType} فارغ`,
          why: 'المكونات المركبة يجب أن تحتوي على عناصر فرعية',
          suggestion: 'أضف عناصر فرعية باستخدام >.-type::'
        });
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

    // Recurse Lists
    function recurseListItem(item: any): void {
      if (item.children) {
        if (Array.isArray(item.children)) {
          item.children.forEach(recurseListItem);
        } else {
          checkNode(item.children); // V1 Compat
        }
      }
    }
    if (node.items && Array.isArray(node.items)) {
      node.items.forEach(recurseListItem);
    }
  }

  ast.content.forEach(checkNode);

  return errors;
}

/**
 * All structure rules
 */
export const structureRules = [
  checkUnclosedBlocks,
  checkListNesting,
  checkEmptyCompounds
];
