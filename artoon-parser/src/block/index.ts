// ARTOON Block Handler
// Handles block structures (code is the ONLY reserved block, all others are custom)

import { Direction } from '../types';
import { Token, BlockNode, BlockField, ParseError } from '../ast/types';

/**
 * Reserved block names with special handling
 * - code: Content is not parsed as ARTOON
 * - meta: Only accepts hidden fields (>.-:field:), hidden in HTML output
 */
export const RESERVED_BLOCKS = ['code', 'meta'] as const;
export type ReservedBlock = typeof RESERVED_BLOCKS[number];

/**
 * Common meta fields (for convenience, not reserved)
 * These are commonly used in meta blocks but any field name is valid
 */
export const COMMON_META_FIELDS = {
  document: ['title', 'description', 'summary'],
  language: ['lang', 'dir', 'locale'],
  author: ['author', 'authors', 'email', 'organization'],
  dates: ['date', 'modified', 'published', 'version'],
  classification: ['tags', 'keywords', 'category', 'type'],
  rights: ['license', 'copyright', 'rights'],
  status: ['status', 'stage', 'visibility'],
  relations: ['source', 'parent', 'prev', 'next', 'related']
} as const;

/**
 * All common meta field names
 */
export const ALL_COMMON_META_FIELDS: string[] = Object.values(COMMON_META_FIELDS).flat();

/**
 * Block parsing state
 */
export interface BlockState {
  name: string;
  lang: string | null;
  startLine: number;
  content: string[];
  fields: BlockField[];
  isCode: boolean;
  isMeta: boolean;
}

/**
 * Create new block state
 */
export function createBlockState(
  name: string,
  lang: string | null,
  line: number
): BlockState {
  return {
    name,
    lang,
    startLine: line,
    content: [],
    fields: [],
    isCode: name === 'code',
    isMeta: name === 'meta'
  };
}

/**
 * Check if block name is reserved
 */
export function isReservedBlock(name: string): boolean {
  return RESERVED_BLOCKS.includes(name as ReservedBlock);
}

/**
 * Check if block is META
 */
export function isMetaBlock(name: string): boolean {
  return name === 'meta';
}

/**
 * Check if block is CODE
 */
export function isCodeBlock(name: string): boolean {
  return name === 'code';
}

/**
 * Check if token starts a block
 */
export function isBlockStart(token: Token): boolean {
  return token.isBlockStart;
}

/**
 * Check if token ends a block
 */
export function isBlockEnd(token: Token): boolean {
  return token.isBlockEnd;
}

/**
 * Add content line to block
 */
export function addBlockContent(state: BlockState, line: string): void {
  state.content.push(line);
}

/**
 * Parse meta field from token
 * Format: >.-:fieldname: value
 */
export function parseMetaField(token: Token): BlockField | null {
  if (!token.isChildElement) return null;
  
  const content = token.content;
  
  // Check for field format: :fieldname: value
  if (!token.componentType?.startsWith(':')) return null;
  
  const fieldPart = token.componentType.slice(1); // remove leading :
  const colonIndex = fieldPart.indexOf(':');
  
  if (colonIndex === -1) return null;
  
  const fieldName = fieldPart.slice(0, colonIndex);
  const value = content || fieldPart.slice(colonIndex + 1).trim();
  
  return {
    name: fieldName,
    direction: token.direction,
    value: value.trim()
  };
}

/**
 * Alternative meta field parsing
 * For format: >.-:field: value (where field is componentType without leading :)
 */
export function parseMetaFieldAlt(token: Token): BlockField | null {
  if (!token.isChildElement) return null;
  
  // componentType should be :fieldname
  const type = token.componentType;
  if (!type || !type.startsWith(':')) return null;
  
  const fieldName = type.slice(1); // remove :
  
  return {
    name: fieldName,
    direction: token.direction,
    value: token.content.trim()
  };
}

/**
 * Add field to block state
 */
export function addBlockField(state: BlockState, field: BlockField): void {
  state.fields.push(field);
}

/**
 * Build block node from state
 */
export function buildBlockNode(state: BlockState): BlockNode {
  const node: BlockNode = {
    type: 'block',
    line: state.startLine,
    direction: 'ltr', // blocks default to LTR
    blockName: state.name,
    isCode: state.isCode,  // Add isCode for compatibility
    content: ''
  };
  
  if (state.lang) {
    node.lang = state.lang;
  }
  
  if (state.isCode) {
    // Code blocks store raw content as string
    node.content = state.content.join('\n');
  } else {
    // All custom blocks (including meta) can have fields
    if (state.fields.length > 0) {
      node.fields = state.fields;
    }
    // Store remaining content
    node.content = state.content.join('\n');
  }
  
  return node;
}

/**
 * Validate block end matches start
 */
export function validateBlockEnd(
  state: BlockState,
  endToken: Token
): { valid: boolean; error?: ParseError } {
  if (endToken.blockName !== state.name) {
    return {
      valid: false,
      error: {
        type: 'structure',
        line: endToken.line,
        column: 0,
        message: `Block end .<${endToken.blockName}> doesn't match start <${state.name}>.`,
        suggestion: `Use .<${state.name}> to close the block`
      }
    };
  }
  
  return { valid: true };
}

/**
 * Check if field name is a common meta field
 */
export function isCommonMetaField(fieldName: string): boolean {
  return ALL_COMMON_META_FIELDS.includes(fieldName);
}

/**
 * Get field category
 */
export function getFieldCategory(fieldName: string): string | null {
  for (const [category, fields] of Object.entries(COMMON_META_FIELDS)) {
    if ((fields as readonly string[]).includes(fieldName)) {
      return category;
    }
  }
  return null;
}

/**
 * Check if token is a hidden field (>.-:field:)
 * Hidden fields start with : after .-
 */
export function isHiddenField(token: Token): boolean {
  return token.isChildElement && 
         token.componentType !== null && 
         token.componentType.startsWith(':');
}

/**
 * Check if token is a child element (>.-element::)
 * Child elements don't start with : after .-
 */
export function isChildElement(token: Token): boolean {
  return token.isChildElement && 
         token.componentType !== null && 
         !token.componentType.startsWith(':');
}

/**
 * Validate that hidden fields are only used in META blocks
 */
export function validateHiddenFieldUsage(
  token: Token,
  currentBlock: BlockState | null
): ParseError | null {
  if (!isHiddenField(token)) return null;
  
  // Hidden fields are only allowed in META blocks
  if (!currentBlock || !currentBlock.isMeta) {
    return {
      type: 'constraint',
      line: token.line,
      column: 0,
      message: `Hidden field syntax '>.-:field:' can only be used inside <meta> block`,
      suggestion: `Move this line inside <meta> block or use regular child element syntax '>.-element::'`
    };
  }
  
  return null;
}

/**
 * Validate that META blocks only contain hidden fields
 */
export function validateMetaContent(
  token: Token,
  currentBlock: BlockState
): ParseError | null {
  if (!currentBlock.isMeta) return null;
  
  // META blocks should only contain hidden fields
  if (!isHiddenField(token)) {
    const isRegularComponent = !token.isChildElement;
    const isVisibleChild = isChildElement(token);
    
    if (isRegularComponent) {
      return {
        type: 'constraint',
        line: token.line,
        column: 0,
        message: `Only hidden fields (>.-:field:) are allowed inside <meta> block`,
        suggestion: `Remove this line or move it outside <meta> block. Use '>.-:fieldname: value' for metadata.`
      };
    }
    
    if (isVisibleChild) {
      return {
        type: 'constraint',
        line: token.line,
        column: 0,
        message: `Child elements (>.-element::) are not allowed inside <meta> block`,
        suggestion: `Use hidden field syntax '>.-:fieldname: value' instead, or move outside <meta>. Note: >.-${token.componentType}:: is a visible child element, not a hidden field.`
      };
    }
  }
  
  return null;
}
