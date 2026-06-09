// ARTOON Lexer - Line Tokenization
// Converts each line to a Token

import { Direction, SEPARATOR_COMPONENTS, VALID_COMPONENTS } from '../types';
import { Token } from '../ast/types';

/**
 * Tokenize a single line of ARTOON
 */
export function tokenizeLine(line: string, lineNumber: number): Token {
  const raw = line;
  const trimmed = line.trim();

  // Empty line
  if (!trimmed) {
    return createEmptyToken(lineNumber, raw);
  }

  // Check for block end: .<name>
  if (trimmed.startsWith('.<')) {
    return parseBlockEnd(trimmed, lineNumber, raw);
  }

  // Check for block end without <: .<name>
  if (trimmed.startsWith('.') && !trimmed.startsWith('.<') && trimmed.length > 1) {
    const blockName = trimmed.slice(1);
    if (isValidBlockName(blockName)) {
      return {
        line: lineNumber,
        raw,
        direction: 'ltr',
        hasComponent: false,
        componentType: null,
        isChildElement: false,
        depth: 0,
        separator: null,
        content: '',
        isBlockStart: false,
        isBlockEnd: true,
        blockName,
        blockLang: null,
        isComment: false
      };
    }
  }

  // Check for block start: <name>. or <name:lang>.
  // Block start must be ONLY <name>. with nothing after the dot
  // NOT <.p:: which is a LTR component
  if (trimmed.startsWith('<') && trimmed.endsWith('.') && !trimmed.includes('::')) {
    // Make sure it's not a direction marker like <.p
    // Block format: <name>. or <name:lang>.
    const inner = trimmed.slice(1, -1); // remove < and .
    if (inner.endsWith('>') || inner.includes('>')) {
      return parseBlockStart(trimmed, lineNumber, raw);
    }
  }

  // Check for list items without direction marker: li::, -li::, --li::
  if (isListItemLine(trimmed)) {
    return parseListItemLine(trimmed, lineNumber, raw);
  }

  // Check for table rows without direction marker: th::, tr::
  if (isTableRowLine(trimmed)) {
    return parseTableRowLine(trimmed, lineNumber, raw);
  }

  // Must start with direction marker
  if (!trimmed.startsWith('>') && !trimmed.startsWith('<')) {
    // Could be content inside a block (like code)
    return createRawContentToken(lineNumber, raw, trimmed);
  }

  // Parse direction-prefixed line
  return parseDirectionLine(trimmed, lineNumber, raw);
}

/**
 * Parse a line starting with > or <
 */
function parseDirectionLine(trimmed: string, lineNumber: number, raw: string): Token {
  const direction: Direction = trimmed[0] === '>' ? 'rtl' : 'ltr';
  let rest = trimmed.slice(1);

  // Check for child element: >.- or <.-
  const isChildElement = rest.startsWith('.-');
  if (isChildElement) {
    rest = rest.slice(1); // keep the dashes, remove the dot

    // Count depth (leading dashes)
    let depth = 0;
    while (rest.startsWith('-')) {
      depth++;
      rest = rest.slice(1);
    }

    // For child elements, the rest is the component type and content
    // Format: >.-type:: content or >.-:field: value (for meta)
    const separatorIndex = rest.indexOf(':: ');

    if (separatorIndex !== -1) {
      const componentType = rest.slice(0, separatorIndex).trim();
      const content = rest.slice(separatorIndex + 3).trim();

      return {
        line: lineNumber,
        raw,
        direction,
        hasComponent: true,
        componentType,
        isChildElement: true,
        depth,
        separator: '::',
        content,
        isBlockStart: false,
        isBlockEnd: false,
        blockName: null,
        blockLang: null,
        isComment: false
      };
    }

    // No :: separator - check for meta field format :field: value
    if (rest.startsWith(':')) {
      const colonIndex = rest.indexOf(':', 1);
      if (colonIndex !== -1) {
        const fieldName = rest.slice(1, colonIndex); // skip leading :, exclude trailing :
        const content = rest.slice(colonIndex + 1).trim();

        return {
          line: lineNumber,
          raw,
          direction,
          hasComponent: true,
          componentType: ':' + fieldName, // meta field marker
          isChildElement: true,
          depth: 0,
          separator: '::',
          content,
          isBlockStart: false,
          isBlockEnd: false,
          blockName: null,
          blockLang: null,
          isComment: false
        };
      }
    }
  }

  // Check for component declaration: >.type or just >
  const hasComponent = rest.startsWith('.');
  if (hasComponent) {
    rest = rest.slice(1); // remove .
  }

  // Count depth (leading dashes for lists) - only if not child element
  let depth = 0;
  if (!isChildElement) {
    while (rest.startsWith('-')) {
      depth++;
      rest = rest.slice(1);
    }
  }

  // Check for comment: >.:::
  if (rest.startsWith('::') && rest[2] === ':') {
    return {
      line: lineNumber,
      raw,
      direction,
      hasComponent: true,
      componentType: null,
      isChildElement,
      depth,
      separator: '::',
      content: rest.slice(3).trim(),
      isBlockStart: false,
      isBlockEnd: false,
      blockName: null,
      blockLang: null,
      isComment: true
    };
  }

  // Find separator ::
  const separatorIndex = rest.indexOf('::');

  if (separatorIndex === -1) {
    // No separator - could be separator component (br, hr, wbr) or list container
    const componentType = rest.trim();

    // Check for combined separators: br;hr;br
    if (componentType.includes(';')) {
      const parts = componentType.split(';');
      const allSeparators = parts.every(p => SEPARATOR_COMPONENTS.includes(p.trim()));
      if (allSeparators) {
        return {
          line: lineNumber,
          raw,
          direction,
          hasComponent: true,
          componentType: componentType,
          isChildElement,
          depth,
          separator: null,
          content: '',
          isBlockStart: false,
          isBlockEnd: false,
          blockName: null,
          blockLang: null,
          isComment: false
        };
      }
    }

    // Single separator or list container
    if (SEPARATOR_COMPONENTS.includes(componentType) ||
      ['ul', 'ol', 'dl'].includes(componentType)) {
      return {
        line: lineNumber,
        raw,
        direction,
        hasComponent: true,
        componentType,
        isChildElement,
        depth,
        separator: null,
        content: '',
        isBlockStart: false,
        isBlockEnd: false,
        blockName: null,
        blockLang: null,
        isComment: false
      };
    }

    // Plain text without component
    return {
      line: lineNumber,
      raw,
      direction,
      hasComponent: false,
      componentType: null,
      isChildElement,
      depth,
      separator: null,
      content: rest.trim(),
      isBlockStart: false,
      isBlockEnd: false,
      blockName: null,
      blockLang: null,
      isComment: false
    };
  }

  // Has separator - extract component type and content
  const componentType = rest.slice(0, separatorIndex).trim();
  const content = rest.slice(separatorIndex + 2).trimStart(); // :: + space

  return {
    line: lineNumber,
    raw,
    direction,
    hasComponent: hasComponent || componentType.length > 0,
    componentType: componentType || null,
    isChildElement,
    depth,
    separator: '::',
    content,
    isBlockStart: false,
    isBlockEnd: false,
    blockName: null,
    blockLang: null,
    isComment: false
  };
}

/**
 * Parse block start: <name>. or <name:lang>.
 */
function parseBlockStart(trimmed: string, lineNumber: number, raw: string): Token {
  // Format: <name>. or <name:lang>.
  // Remove < at start and . at end
  const inner = trimmed.slice(1, -1); // remove < and .

  // Now inner is "name>" or "name:lang>"
  // Remove trailing >
  const withoutGt = inner.endsWith('>') ? inner.slice(0, -1) : inner;

  // Check for language: code:js
  const colonIndex = withoutGt.indexOf(':');
  let blockName: string;
  let blockLang: string | null = null;

  if (colonIndex !== -1) {
    blockName = withoutGt.slice(0, colonIndex);
    blockLang = withoutGt.slice(colonIndex + 1);
  } else {
    blockName = withoutGt;
  }

  return {
    line: lineNumber,
    raw,
    direction: 'ltr', // blocks default to LTR
    hasComponent: false,
    componentType: null,
    isChildElement: false,
    depth: 0,
    separator: null,
    content: '',
    isBlockStart: true,
    isBlockEnd: false,
    blockName,
    blockLang,
    isComment: false
  };
}

/**
 * Parse block end: .<name>
 */
function parseBlockEnd(trimmed: string, lineNumber: number, raw: string): Token {
  // .<name> format
  const blockName = trimmed.slice(2, -1); // remove .< and >

  return {
    line: lineNumber,
    raw,
    direction: 'ltr',
    hasComponent: false,
    componentType: null,
    isChildElement: false,
    depth: 0,
    separator: null,
    content: '',
    isBlockStart: false,
    isBlockEnd: true,
    blockName,
    blockLang: null,
    isComment: false
  };
}

/**
 * Create empty token
 */
function createEmptyToken(lineNumber: number, raw: string): Token {
  return {
    line: lineNumber,
    raw,
    direction: 'ltr',
    hasComponent: false,
    componentType: null,
    isChildElement: false,
    depth: 0,
    separator: null,
    content: '',
    isBlockStart: false,
    isBlockEnd: false,
    blockName: null,
    blockLang: null,
    isComment: false
  };
}

/**
 * Create raw content token (for block content)
 */
function createRawContentToken(lineNumber: number, raw: string, content: string): Token {
  return {
    line: lineNumber,
    raw,
    direction: 'ltr',
    hasComponent: false,
    componentType: null,
    isChildElement: false,
    depth: 0,
    separator: null,
    content,
    isBlockStart: false,
    isBlockEnd: false,
    blockName: null,
    blockLang: null,
    isComment: false
  };
}

/**
 * Check if name is valid block name
 */
function isValidBlockName(name: string): boolean {
  return /^[a-z][a-z0-9]*$/i.test(name);
}

/**
 * Tokenize entire document
 */
export function tokenize(source: string): Token[] {
  const lines = source.split(/\r?\n/);
  return lines.map((line, index) => tokenizeLine(line, index + 1));
}


/**
 * Check if line is a list item (without direction marker)
 * Format: li::, -li::, --li::, dt::, dd::
 */
function isListItemLine(trimmed: string): boolean {
  // Count leading dashes
  let i = 0;
  while (trimmed[i] === '-') i++;

  const rest = trimmed.slice(i);
  return rest.startsWith('li::') || rest.startsWith('dt::') || rest.startsWith('dd::');
}

/**
 * Parse list item line
 */
function parseListItemLine(trimmed: string, lineNumber: number, raw: string): Token {
  // Count depth
  let depth = 0;
  while (trimmed[depth] === '-') depth++;

  const rest = trimmed.slice(depth);
  const separatorIndex = rest.indexOf('::');
  const componentType = rest.slice(0, separatorIndex);
  const content = rest.slice(separatorIndex + 2).trimStart();

  return {
    line: lineNumber,
    raw,
    direction: 'rtl', // Will inherit from parent list
    hasComponent: true,
    componentType,
    isChildElement: false,
    depth,
    separator: '::',
    content,
    isBlockStart: false,
    isBlockEnd: false,
    blockName: null,
    blockLang: null,
    isComment: false
  };
}

/**
 * Check if line is a table row (without direction marker)
 * Format: th::, tr::
 */
function isTableRowLine(trimmed: string): boolean {
  return trimmed.startsWith('th::') || trimmed.startsWith('tr::');
}

/**
 * Parse table row line
 */
function parseTableRowLine(trimmed: string, lineNumber: number, raw: string): Token {
  const separatorIndex = trimmed.indexOf('::');
  const componentType = trimmed.slice(0, separatorIndex);
  const content = trimmed.slice(separatorIndex + 2).trimStart();

  return {
    line: lineNumber,
    raw,
    direction: 'rtl', // Will inherit from parent table
    hasComponent: true,
    componentType,
    isChildElement: false,
    depth: 0,
    separator: '::',
    content,
    isBlockStart: false,
    isBlockEnd: false,
    blockName: null,
    blockLang: null,
    isComment: false
  };
}
