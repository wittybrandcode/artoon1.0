// ARTOON Inline Tokenizer
// Parses [...] tokens within content

import { Modifier, VALID_MODIFIERS, NO_MODIFIER_COMPONENTS } from '../types';
import { InlineToken, ParsedContent, ParseError } from '../ast/types';

/**
 * Parse content for inline tokens
 */
export function parseInlineContent(content: string, lineNumber: number): { 
  result: ParsedContent; 
  errors: ParseError[] 
} {
  const errors: ParseError[] = [];
  const inlines: InlineToken[] = [];
  let text = '';
  let index = 0;
  let inlineIndex = 0;
  
  let i = 0;
  while (i < content.length) {
    if (content[i] === '[') {
      // Find matching ]
      const closeIndex = findMatchingBracket(content, i);
      
      if (closeIndex === -1) {
        errors.push({
          type: 'syntax',
          line: lineNumber,
          column: i + 1,
          message: 'Unclosed inline bracket [',
          suggestion: 'Add closing ]'
        });
        text += content[i];
        i++;
        continue;
      }
      
      // Extract inline content
      const inlineContent = content.slice(i + 1, closeIndex);
      const { token, error } = parseInlineToken(inlineContent, inlineIndex, lineNumber, i + 1);
      
      if (error) {
        errors.push(error);
      }
      
      if (token) {
        inlines.push(token);
        text += `{${inlineIndex}}`;
        inlineIndex++;
      }
      
      i = closeIndex + 1;
    } else {
      text += content[i];
      i++;
    }
  }
  
  return {
    result: { text, inlines },
    errors
  };
}

/**
 * Find matching closing bracket
 */
function findMatchingBracket(content: string, start: number): number {
  let depth = 0;
  for (let i = start; i < content.length; i++) {
    if (content[i] === '[') depth++;
    if (content[i] === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Parse single inline token content
 * Format: [modifiers+type:: attr1; attr2; ...]
 */
function parseInlineToken(
  content: string, 
  index: number, 
  lineNumber: number,
  column: number
): { token: InlineToken | null; error: ParseError | null } {
  
  // Find :: separator
  const separatorIndex = content.indexOf('::');
  
  if (separatorIndex === -1) {
    return {
      token: null,
      error: {
        type: 'syntax',
        line: lineNumber,
        column,
        message: 'Inline token missing :: separator',
        suggestion: 'Use format [type:: content] or [modifier+type:: content]'
      }
    };
  }
  
  const prefix = content.slice(0, separatorIndex).trim();
  const attrPart = content.slice(separatorIndex + 2).trim();
  
  // Parse prefix: modifiers+type or just modifiers or just type
  const { modifiers, componentType, error } = parsePrefix(prefix, lineNumber, column);
  
  if (error) {
    return { token: null, error };
  }
  
  // Validate: modifiers not allowed on certain components
  if (modifiers.length > 0 && componentType && NO_MODIFIER_COMPONENTS.includes(componentType)) {
    return {
      token: null,
      error: {
        type: 'semantic',
        line: lineNumber,
        column,
        message: `Modifiers not allowed on ${componentType}`,
        suggestion: `Remove modifiers: [${componentType}:: ${attrPart}]`
      }
    };
  }
  
  // Parse attributes (separated by ;)
  const attributes = attrPart ? attrPart.split(';').map(a => a.trim()) : [];
  
  return {
    token: {
      index,
      modifiers,
      componentType,
      attributes,
      raw: content
    },
    error: null
  };
}

/**
 * Parse prefix part (before ::)
 * Can be: type, modifier+type, modifier1+modifier2+type, or just modifiers
 */
function parsePrefix(prefix: string, lineNumber: number, column: number): {
  modifiers: Modifier[];
  componentType: string | null;
  error: ParseError | null;
} {
  if (!prefix) {
    return { modifiers: [], componentType: null, error: null };
  }
  
  const parts = prefix.split('+');
  const modifiers: Modifier[] = [];
  let componentType: string | null = null;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    
    if (VALID_MODIFIERS.includes(part as Modifier)) {
      modifiers.push(part as Modifier);
    } else if (i === parts.length - 1) {
      // Last part could be component type
      componentType = part || null;
    } else {
      // Invalid modifier in middle
      return {
        modifiers: [],
        componentType: null,
        error: {
          type: 'syntax',
          line: lineNumber,
          column,
          message: `Invalid modifier: ${part}`,
          suggestion: `Valid modifiers: ${VALID_MODIFIERS.join(', ')}`
        }
      };
    }
  }
  
  return { modifiers, componentType, error: null };
}

/**
 * Check if content has inline tokens
 */
export function hasInlineTokens(content: string): boolean {
  return content.includes('[') && content.includes(']');
}
