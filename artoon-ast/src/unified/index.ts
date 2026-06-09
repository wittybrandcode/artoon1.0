/**
 * UNIFIED TYPES - Version 2.0
 * 
 * Target structure for all ARTOON packages.
 * Created before migration to enable parallel development.
 * 
 * KEY CHANGES from v1.0:
 * 1. nodeType → type (property name change)
 * 2. ListItem.children: ListNode → ListItem.children?: ListItem[]
 * 3. SeparatorNode.separators: SeparatorType[] → SeparatorNode.separatorType: SeparatorType
 * 
 * @migration This file defines the END STATE of the migration.
 */

import type {
  Direction,
  Modifier,
  ListItemType,
  ListType,
  SeparatorType,
  TextType,
  CompoundType,
  InlineComponentType,
  TableRow,
  CompoundChild,
  MetaField,
  DocumentMeta,
  ParseError
} from '../types';

// Re-export unchanged types
export type {
  Direction,
  Modifier,
  ListItemType,
  ListType,
  SeparatorType,
  TextType,
  CompoundType,
  InlineComponentType,
  TableRow,
  CompoundChild,
  MetaField,
  DocumentMeta,
  ParseError
};

// ═══════════════════════════════════════════════════════════════════════════
// BASE NODE (Unified)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base node interface - all nodes extend this
 * 
 * CHANGE: Uses `type` instead of `nodeType`
 */
export interface UnifiedBaseNode {
  /** Node type discriminator (replaces nodeType) */
  readonly type: string;
  /** Source line number */
  readonly line: number;
  /** Text direction */
  readonly direction: Direction;
  /** Optional ID (used by editor) */
  readonly id?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// INLINE CONTENT (Unified)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Plain text content - unchanged from v1.0
 */
export interface UnifiedPlainText {
  readonly type: 'plain';
  readonly value: string;
}

/**
 * Inline component - unchanged from v1.0
 */
export interface UnifiedInlineComponent {
  readonly type: 'inline';
  readonly component?: InlineComponentType;
  readonly modifiers?: ReadonlyArray<Modifier>;
  readonly attributes?: Readonly<Record<string, string>>;
  readonly value?: string;
}

export type UnifiedInlineContent = UnifiedPlainText | UnifiedInlineComponent;

// ═══════════════════════════════════════════════════════════════════════════
// TEXT NODE (Unified)
// ═══════════════════════════════════════════════════════════════════════════

export interface UnifiedTextNode extends UnifiedBaseNode {
  readonly type: 'text';
  readonly textType: TextType;
  readonly content: ReadonlyArray<UnifiedInlineContent>;
}

// ═══════════════════════════════════════════════════════════════════════════
// LIST (Unified)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * List item - KEY CHANGE
 * 
 * OLD: children?: ListNode (wrapped in ListNode)
 * NEW: children?: ListItem[] (direct array of items)
 */
export interface UnifiedListItem {
  /** Optional ID (used by editor) */
  readonly id?: string;
  /** Item type (li, dt, dd) */
  readonly itemType: ListItemType;
  /** Item content */
  readonly content: ReadonlyArray<UnifiedInlineContent>;
  /** 
   * Nested items - DIRECT children, not wrapped in ListNode
   * This is the KEY CHANGE from the old structure
   */
  readonly children?: ReadonlyArray<UnifiedListItem>;
}

export interface UnifiedListNode extends UnifiedBaseNode {
  readonly type: 'list';
  readonly listType: ListType;
  readonly items: ReadonlyArray<UnifiedListItem>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEPARATOR (Unified)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Separator node - KEY CHANGE
 * 
 * OLD: separators: SeparatorType[] (array)
 * NEW: separatorType: SeparatorType (single value)
 */
export interface UnifiedSeparatorNode extends UnifiedBaseNode {
  readonly type: 'separator';
  /** 
   * Single separator type - replaces separators[] array
   * This is the KEY CHANGE from the old structure
   */
  readonly separatorType: SeparatorType;
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLE (Unified)
// ═══════════════════════════════════════════════════════════════════════════

export interface UnifiedTableNode extends UnifiedBaseNode {
  readonly type: 'table';
  readonly headers?: TableRow; // using TableRow from types.ts directly, which we made readonly
  readonly rows: ReadonlyArray<TableRow>;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOUND (Unified)
// ═══════════════════════════════════════════════════════════════════════════

export interface UnifiedCompoundNode extends UnifiedBaseNode {
  readonly type: 'compound';
  readonly compoundType: CompoundType;
  readonly children: ReadonlyArray<CompoundChild>; // CompoundChild is imported from types.ts
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOCK (Unified)
// ═══════════════════════════════════════════════════════════════════════════

export interface UnifiedBlockNode extends UnifiedBaseNode {
  readonly type: 'block';
  readonly blockName: string;
  readonly isCode: boolean;
  readonly language?: string;
  readonly content: ReadonlyArray<UnifiedContentNode> | string;
  readonly fields?: ReadonlyArray<MetaField>;
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDIA (Unified)
// ═══════════════════════════════════════════════════════════════════════════

export interface UnifiedMediaNode extends UnifiedBaseNode {
  readonly type: 'media';
  readonly mediaType: 'img' | 'video' | 'audio' | 'file';
  readonly src: string;
  readonly alt?: string;
  readonly title?: string;
  readonly label?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// LINK (Unified)
// ═══════════════════════════════════════════════════════════════════════════

export interface UnifiedLinkNode extends UnifiedBaseNode {
  readonly type: 'link';
  readonly url: string;
  readonly text?: string;
  readonly modifiers: ReadonlyArray<Modifier>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CODE (Unified)
// ═══════════════════════════════════════════════════════════════════════════

export interface UnifiedCodeNode extends UnifiedBaseNode {
  readonly type: 'code';
  readonly code: string;
  readonly language?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMENT (Unified)
// ═══════════════════════════════════════════════════════════════════════════

export interface UnifiedCommentNode extends UnifiedBaseNode {
  readonly type: 'comment';
  readonly content: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT NODE UNION (Unified)
// ═══════════════════════════════════════════════════════════════════════════

export type UnifiedContentNode =
  | UnifiedTextNode
  | UnifiedSeparatorNode
  | UnifiedListNode
  | UnifiedTableNode
  | UnifiedCompoundNode
  | UnifiedBlockNode
  | UnifiedMediaNode
  | UnifiedLinkNode
  | UnifiedCodeNode
  | UnifiedCommentNode;

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT (Unified)
// ═══════════════════════════════════════════════════════════════════════════

export interface UnifiedARTOONDocument {
  readonly version: '2.0';
  readonly meta?: DocumentMeta; // Imported from types.ts, now readonly
  readonly content: ReadonlyArray<UnifiedContentNode>;
  readonly errors?: ReadonlyArray<ParseError>; // Imported from types.ts, now readonly
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARDS (Unified)
// ═══════════════════════════════════════════════════════════════════════════

export function isUnifiedTextNode(node: UnifiedContentNode): node is UnifiedTextNode {
  return node.type === 'text';
}

export function isUnifiedListNode(node: UnifiedContentNode): node is UnifiedListNode {
  return node.type === 'list';
}

export function isUnifiedTableNode(node: UnifiedContentNode): node is UnifiedTableNode {
  return node.type === 'table';
}

export function isUnifiedCompoundNode(node: UnifiedContentNode): node is UnifiedCompoundNode {
  return node.type === 'compound';
}

export function isUnifiedBlockNode(node: UnifiedContentNode): node is UnifiedBlockNode {
  return node.type === 'block';
}

export function isUnifiedMediaNode(node: UnifiedContentNode): node is UnifiedMediaNode {
  return node.type === 'media';
}

export function isUnifiedLinkNode(node: UnifiedContentNode): node is UnifiedLinkNode {
  return node.type === 'link';
}

export function isUnifiedCodeNode(node: UnifiedContentNode): node is UnifiedCodeNode {
  return node.type === 'code';
}

export function isUnifiedSeparatorNode(node: UnifiedContentNode): node is UnifiedSeparatorNode {
  return node.type === 'separator';
}

export function isUnifiedCommentNode(node: UnifiedContentNode): node is UnifiedCommentNode {
  return node.type === 'comment';
}

export function isUnifiedPlainText(content: UnifiedInlineContent): content is UnifiedPlainText {
  return content.type === 'plain';
}

export function isUnifiedInlineComponent(content: UnifiedInlineContent): content is UnifiedInlineComponent {
  return content.type === 'inline';
}

// ═══════════════════════════════════════════════════════════════════════════
// MIGRATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mapping from old property names to new ones.
 * Used for documentation and migration scripts.
 */
export const PROPERTY_MIGRATION_MAP = {
  'nodeType': 'type',
  'ListItem.children: ListNode': 'ListItem.children: ListItem[]',
  'SeparatorNode.separators: string[]': 'SeparatorNode.separatorType: string',
} as const;

/**
 * Node type values - unchanged between versions
 */
export const NODE_TYPES = [
  'text',
  'separator',
  'list',
  'table',
  'compound',
  'block',
  'media',
  'link',
  'code',
  'comment'
] as const;

export type NodeType = typeof NODE_TYPES[number];
