// ARTOON Philosophy Validation Rules
// These are the most critical - philosophy breaches are FULL STOP

import { 
  ValidationError, 
  ValidationContext, 
  ERROR_CODES,
  PRESENTATION_KEYWORDS,
  BEHAVIOR_KEYWORDS
} from '../types';

/**
 * Check for presentation leaks (style, CSS, etc.)
 */
export function checkPresentationLeak(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!ctx.source) return errors;
  if (ctx.options.checkPhilosophy === false) return errors;
  
  const lines = ctx.source.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    for (const keyword of PRESENTATION_KEYWORDS) {
      if (line.includes(keyword)) {
        // Skip if inside code block
        if (isInsideCodeBlock(ctx.source, i)) continue;
        
        errors.push({
          code: ERROR_CODES.PRESENTATION_LEAK,
          category: 'philosophy',
          severity: 'philosophy',
          line: i + 1,
          what: `تسرب عرضي: "${keyword}"`,
          why: 'ARTOON يصف "ما هو" وليس "كيف يبدو". معلومات العرض ممنوعة.',
          suggestion: 'احذف أي إشارة للعرض. الـ Renderer هو المسؤول عن الشكل.'
        });
      }
    }
  }
  
  return errors;
}

/**
 * Check for behavior leaks (onclick, javascript, etc.)
 */
export function checkBehaviorLeak(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!ctx.source) return errors;
  if (ctx.options.checkPhilosophy === false) return errors;
  
  const lines = ctx.source.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    for (const keyword of BEHAVIOR_KEYWORDS) {
      if (line.includes(keyword)) {
        // Skip if inside code block
        if (isInsideCodeBlock(ctx.source, i)) continue;
        
        errors.push({
          code: ERROR_CODES.BEHAVIOR_LEAK,
          category: 'philosophy',
          severity: 'philosophy',
          line: i + 1,
          what: `تسرب سلوكي: "${keyword}"`,
          why: 'ARTOON يصف "ما هو" وليس "ماذا يفعل". السلوك التفاعلي ممنوع.',
          suggestion: 'احذف أي إشارة للسلوك. التفاعل مسؤولية التطبيق.'
        });
      }
    }
  }
  
  return errors;
}

/**
 * Check for semantic violations (using components for wrong purpose)
 */
export function checkSemanticViolation(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];
  const ast = ctx.ast;
  
  if (!ast || !ast.content) return errors;
  if (ctx.options.checkPhilosophy === false) return errors;
  
  // Check for suspicious patterns
  function checkNode(node: any): void {
    // Check for empty headings (might be used just for size)
    if ((node.nodeType === 'text' || node.type === 'text')) {
      const textType = node.textType || node.componentType;
      if (textType && textType.match(/^t[1-6]$/)) {
        const content = node.content;
        if (content && content.length === 1 && content[0].type === 'plain') {
          const text = content[0].value.trim();
          // Very short heading might be misuse
          if (text.length < 2) {
            errors.push({
              code: ERROR_CODES.SEMANTIC_VIOLATION,
              category: 'philosophy',
              severity: 'warning',
              line: node.line || 0,
              what: `عنوان ${textType} قصير جداً`,
              why: 'العناوين للتنظيم الدلالي، ليست للتكبير. تأكد من الاستخدام الصحيح.',
              suggestion: 'استخدم العناوين للتنظيم الهرمي للمحتوى'
            });
          }
        }
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
 * Helper: Check if line is inside a code block
 */
function isInsideCodeBlock(source: string, lineIndex: number): boolean {
  const lines = source.split(/\r?\n/);
  let inCode = false;
  
  for (let i = 0; i <= lineIndex; i++) {
    const line = lines[i].trim();
    if (line.match(/^<code/)) inCode = true;
    if (line.match(/^\.<code>/)) inCode = false;
  }
  
  return inCode;
}

/**
 * All philosophy rules
 */
export const philosophyRules = [
  checkPresentationLeak,
  checkBehaviorLeak,
  checkSemanticViolation
];
