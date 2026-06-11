/**
 * ARTOON Parser AST Types
 * Version 2.0 - Unified with @artoon/ast
 * 
 * This file imports types from @artoon/ast and defines internal-only types.
 * 
 * @migration v2.0 Changes:
 * - Import most types from @artoon/ast
 * - Keep Token, InlineToken, ParsedContent as internal types
 * - ListItemNode removed - use ListItem from @artoon/ast
 */

// Import unified types from @artoon/ast
import type {
  Direction,
  Modifier,
  TextType,
  ListType,
  ListItemType,
  SeparatorType,
  CompoundType,
  InlineComponentType,
  BaseNode,
  ContentNode,
  ListItem,
  TableRow,
  TableCell,
  CompoundChild,
  MetaField,
  InlineContent,
  PlainText,
  InlineComponent,
} from '@artoon/ast';

import { isTextNode as isTextNodeInternal } from '@artoon/ast';

export const isTextNode = isTextNodeInternal;

// Re-export types for internal use
export type {
  Direction,
  Modifier,
  TextType,
  ListType,
  ListItemType,
  SeparatorType,
  CompoundType,
  InlineComponentType,
  BaseNode,
  ContentNode,
  ListItem,
  TableRow,
  TableCell,
  CompoundChild,
  MetaField,
  InlineContent,
  PlainText,
  InlineComponent,
};

// ═══════════════════════════════════════════════════════════════════════════
// PARSER-SPECIFIC NODE TYPES
// These extend AST types with parser-specific properties
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Text node as output by parser
 */
export interface TextNode extends BaseNode {
  type: 'text';
  textType: TextType;
  content: InlineContent[];
}

/**
 * Separator node as output by parser
 */
export interface SeparatorNode extends BaseNode {
  type: 'separator';
  separatorType: SeparatorType;
}

/**
 * List node as output by parser
 */
export interface ListNode extends BaseNode {
  type: 'list';
  listType: ListType;
  items: ListItem[];
}

/**
 * Table node as output by parser
 */
export interface TableNode extends BaseNode {
  type: 'table';
  headers: string[];
  rows: string[][];
}

/**
 * Compound node as output by parser
 */
export interface CompoundNode extends BaseNode {
  type: 'compound';
  compoundType: CompoundType;
  children: ASTNode[];
}

/**
 * Block node as output by parser
 */
export interface BlockNode extends BaseNode {
  type: 'block';
  blockName: string;
  isCode?: boolean;  // Added for compatibility with @artoon/ast
  lang?: string;
  content: ASTNode[] | string;
  fields?: BlockField[];
}

/**
 * Block field (for meta blocks)
 */
export interface BlockField {
  name: string;
  direction: Direction;
  value: string;
}

/**
 * Comment node as output by parser
 */
export interface CommentNode extends BaseNode {
  type: 'comment';
  content: string;
}

/**
 * Media node as output by parser
 */
export interface MediaNode extends BaseNode {
  type: 'media';
  mediaType: 'img' | 'video' | 'audio' | 'file';
  src: string;
  alt?: string;
  title?: string;
  label?: string;
}

/**
 * Link node as output by parser
 */
export interface LinkNode extends BaseNode {
  type: 'link';
  url: string;
  text?: string;
  modifiers: Modifier[];
}

/**
 * Code node (inline) as output by parser
 */
export interface CodeNode extends BaseNode {
  type: 'code';
  code: string;
  lang?: string;
}

/**
 * Union of all AST node types
 */
export type ASTNode = 
  | TextNode 
  | SeparatorNode 
  | ListNode 
  | TableNode 
  | CompoundNode 
  | BlockNode 
  | CommentNode 
  | MediaNode 
  | LinkNode 
  | CodeNode;

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL TYPES (not exported to consumers)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Token from lexer (line-level)
 * @internal
 */
export interface Token {
  line: number;
  raw: string;
  direction: Direction;
  hasComponent: boolean;
  componentType: string | null;
  isChildElement: boolean;
  depth: number;
  separator: '::' | null;
  content: string;
  isBlockStart: boolean;
  isBlockEnd: boolean;
  blockName: string | null;
  blockLang: string | null;
  isComment: boolean;
}

/**
 * Inline token (within content)
 * @internal
 */
export interface InlineToken {
  index: number;
  modifiers: Modifier[];
  componentType: string | null;
  attributes: string[];
  raw: string;
}

/**
 * Parsed content with inline tokens
 * @internal - converted to InlineContent[] before output
 */
export interface ParsedContent {
  text: string;
  inlines: InlineToken[];
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT AND RESULT TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Document root
 */
export interface DocumentNode {
  type: 'document';
  meta?: BlockNode;
  children: ASTNode[];
}

/**
 * Parser error
 */
export interface ParseError {
  type: 'syntax' | 'structure' | 'semantic' | 'constraint';
  line: number;
  column: number;
  message: string;
  suggestion?: string;
}

/**
 * Parser result
 */
export interface ParseResult {
  ast: DocumentNode;
  errors: ParseError[];
}
