/**
 * ARTOON Canonical AST Types
 * Version 2.0
 * 
 * @migration v2.0 Changes:
 * - `type` is now the canonical property (replaces `nodeType`)
 * - `nodeType` is deprecated but kept for backward compatibility
 * - `ListItem.children` is now `ListItem[]` (was `ListNode`)
 * - `SeparatorNode.separatorType` replaces `separators[]`
 * - Added `id?: string` to nodes for editor support
 */

// ═══════════════════════════════════════════════════════════════════════════
// PRIMITIVE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Direction of content
 */
export type Direction = 'rtl' | 'ltr';

/**
 * Text modifiers - ONLY for text-based components
 */
export type Modifier = 's' | 'e' | 'u' | 'd' | 'mark' | 'sub' | 'sup';

/**
 * Text component types
 * - p: paragraph
 * - t1-t6: headings
 * - q: blockquote
 * - pre: preformatted
 * - time: date/time (line component)
 * - abbr: abbreviation (line component)
 */
export type TextType = 'p' | 't1' | 't2' | 't3' | 't4' | 't5' | 't6' | 'q' | 'pre' | 'time' | 'abbr';

/**
 * List types
 */
export type ListType = 'ul' | 'ol' | 'dl';

/**
 * List item types
 */
export type ListItemType = 'li' | 'dt' | 'dd';

/**
 * Compound component types
 */
export type CompoundType = 'figure' | 'details';

/**
 * Inline component types
 */
export type InlineComponentType = 'a' | 'img' | 'audio' | 'video' | 'file' | 'abbr' | 'time' | 'c';

/**
 * Separator types
 */
export type SeparatorType = 'br' | 'hr' | 'wbr';

// ═══════════════════════════════════════════════════════════════════════════
// BASE NODE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base node - all nodes extend this
 * 
 * @migration v2.0
 * - `type` is the canonical property (use this in new code)
 * - `nodeType` is deprecated, kept for backward compatibility
 */
export interface BaseNode {
  /** 
   * Node type discriminator.
   * This is the canonical property - use this in new code.
   */
  readonly type: string;

  /** 
   * @deprecated Since v2.0. Use `type` instead.
   * Kept for backward compatibility. Will be removed in v3.0.
   */
  readonly nodeType?: string;

  /** Source line number */
  readonly line: number;

  /** Text direction */
  readonly direction: Direction;

  /** Optional ID (used by editor) */
  readonly id?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// INLINE CONTENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Plain text content
 */
export interface PlainText {
  readonly type: 'plain';
  readonly value: string;
}

/**
 * Inline component (links, media, code, etc.)
 */
export interface InlineComponent {
  readonly type: 'inline';
  readonly component?: InlineComponentType;
  readonly modifiers?: ReadonlyArray<Modifier>;
  readonly attributes: Readonly<Record<string, string>>;
  readonly value?: string;
}

/**
 * Inline content - either plain text or inline component
 */
export type InlineContent = PlainText | InlineComponent;

// ═══════════════════════════════════════════════════════════════════════════
// TEXT NODES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Text node (p, t1-t6, q, pre)
 */
export interface TextNode extends BaseNode {
  readonly type: 'text';
  readonly nodeType?: 'text';
  readonly textType: TextType;
  readonly content: ReadonlyArray<InlineContent>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEPARATOR NODES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Separator node (br, hr, wbr)
 * 
 * @migration v2.0
 * - `separatorType` is the canonical property (single value)
 * - `separators` is deprecated (was array)
 */
export interface SeparatorNode extends BaseNode {
  readonly type: 'separator';
  readonly nodeType?: 'separator';

  /** 
   * Separator type - single value.
   * Multiple separators should be separate nodes.
   */
  readonly separatorType: SeparatorType;

  /**
   * @deprecated Since v2.0. Use `separatorType` instead.
   * Kept for backward compatibility. Will be removed in v3.0.
   */
  readonly separators?: ReadonlyArray<SeparatorType>;
}

// ═══════════════════════════════════════════════════════════════════════════
// LIST NODES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * List item
 * 
 * @migration v2.0
 * - `children` is now `ListItem[]` (was `ListNode`)
 * - Added `id?: string` for editor support
 */
export interface ListItem {
  /** Optional ID (used by editor) */
  readonly id?: string;

  /** Item type (li, dt, dd) */
  readonly itemType: ListItemType;

  /** 
   * List type for THIS item's own rendering (ul, ol, dl).
   * When present, overrides the parent ListNode.listType.
   * Enables mixed-type lists at the same nesting level.
   * @since v2.1
   */
  readonly listType?: ListType;

  /** Item content */
  readonly content: ReadonlyArray<InlineContent>;

  /** Type of the nested list container (if different from parent) */
  readonly childListType?: ListType;

  /** 
   * Nested items - direct children, NOT wrapped in ListNode.
   * This simplifies traversal and matches the logical structure.
   * 
   * @migration v2.0 Changed from `ListNode` to `ListItem[]`
   */
  readonly children?: ReadonlyArray<ListItem>;
}

/**
 * List node (ul, ol, dl)
 */
export interface ListNode extends BaseNode {
  readonly type: 'list';
  readonly nodeType?: 'list';
  readonly listType: ListType;
  readonly items: ReadonlyArray<ListItem>;
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLE NODES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Table cell
 */
export interface TableCell {
  readonly content: ReadonlyArray<InlineContent>;
}

/**
 * Table row
 */
export interface TableRow {
  readonly rowType: 'th' | 'tr';
  readonly cells: ReadonlyArray<TableCell>;
}

/**
 * Table node
 */
export interface TableNode extends BaseNode {
  readonly type: 'table';
  readonly nodeType?: 'table';
  readonly headers?: TableRow;
  readonly rows: ReadonlyArray<TableRow>;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOUND NODES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compound child role
 */
export type CompoundChildRole = 'content' | 'caption' | 'summary';

/**
 * Compound child
 */
export interface CompoundChild {
  readonly role: CompoundChildRole;
  readonly node: ContentNode | InlineComponent;
}

/**
 * Compound node (figure, details)
 */
export interface CompoundNode extends BaseNode {
  readonly type: 'compound';
  readonly nodeType?: 'compound';
  readonly compoundType: CompoundType;
  readonly children: ReadonlyArray<CompoundChild>;
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOCK NODES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Meta field
 */
export interface MetaField {
  readonly name: string;
  readonly direction: Direction;
  readonly value: string;
}

/**
 * Block node (meta, code, custom)
 */
export interface BlockNode extends BaseNode {
  readonly type: 'block';
  readonly nodeType?: 'block';
  readonly blockName: string;
  readonly isCode: boolean;
  readonly language?: string;
  readonly content: ReadonlyArray<ContentNode> | string;
  readonly fields?: ReadonlyArray<MetaField>;
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDIA NODES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Media node (img, video, audio, file)
 */
export interface MediaNode extends BaseNode {
  readonly type: 'media';
  readonly nodeType?: 'media';
  readonly mediaType: 'img' | 'video' | 'audio' | 'file';
  readonly src: string;
  readonly alt?: string;
  readonly title?: string;
  readonly label?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// LINK NODES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Link node
 */
export interface LinkNode extends BaseNode {
  readonly type: 'link';
  readonly nodeType?: 'link';
  readonly url: string;
  readonly text?: string;
  readonly modifiers: ReadonlyArray<Modifier>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CODE NODES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Inline code node
 */
export interface CodeNode extends BaseNode {
  readonly type: 'code';
  readonly nodeType?: 'code';
  readonly code: string;
  readonly language?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMENT NODES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Comment node
 */
export interface CommentNode extends BaseNode {
  readonly type: 'comment';
  readonly nodeType?: 'comment';
  readonly content: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT NODE UNION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * All content node types
 */
export type ContentNode =
  | TextNode
  | SeparatorNode
  | ListNode
  | TableNode
  | CompoundNode
  | BlockNode
  | MediaNode
  | LinkNode
  | CodeNode
  | CommentNode;

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Document meta information
 */
export interface DocumentMeta {
  readonly title?: string;
  readonly description?: string;
  readonly author?: string;
  readonly date?: string;
  readonly lang?: string;
  readonly dir?: Direction;
  readonly version?: string;
  readonly status?: string;
  readonly license?: string;
  readonly tags?: ReadonlyArray<string>;
  readonly custom?: Readonly<Record<string, string>>;
}

/**
 * Parse error
 */
export interface ParseError {
  readonly type: 'syntax' | 'structure' | 'semantic' | 'constraint';
  readonly line: number;
  readonly column?: number;
  readonly message: string;
  readonly suggestion?: string;
}

/**
 * ARTOON Document - root node
 */
export interface ARTOONDocument {
  readonly version: '1.0' | '2.0';
  readonly meta?: DocumentMeta;
  readonly content: ReadonlyArray<ContentNode>;
  readonly errors?: ReadonlyArray<ParseError>;
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the type value from a node, supporting both old and new formats.
 * @internal
 */
function getTypeValue(node: any): string {
  return node.type || node.nodeType;
}

/**
 * Type guard for TextNode.
 * Works with both old (nodeType) and new (type) formats.
 */
export function isTextNode(node: ContentNode): node is TextNode {
  return getTypeValue(node) === 'text';
}

/**
 * Type guard for ListNode.
 * Works with both old (nodeType) and new (type) formats.
 */
export function isListNode(node: ContentNode): node is ListNode {
  return getTypeValue(node) === 'list';
}

/**
 * Type guard for TableNode.
 * Works with both old (nodeType) and new (type) formats.
 */
export function isTableNode(node: ContentNode): node is TableNode {
  return getTypeValue(node) === 'table';
}

/**
 * Type guard for CompoundNode.
 * Works with both old (nodeType) and new (type) formats.
 */
export function isCompoundNode(node: ContentNode): node is CompoundNode {
  return getTypeValue(node) === 'compound';
}

/**
 * Type guard for BlockNode.
 * Works with both old (nodeType) and new (type) formats.
 */
export function isBlockNode(node: ContentNode): node is BlockNode {
  return getTypeValue(node) === 'block';
}

/**
 * Type guard for MediaNode.
 * Works with both old (nodeType) and new (type) formats.
 */
export function isMediaNode(node: ContentNode): node is MediaNode {
  return getTypeValue(node) === 'media';
}

/**
 * Type guard for LinkNode.
 * Works with both old (nodeType) and new (type) formats.
 */
export function isLinkNode(node: ContentNode): node is LinkNode {
  return getTypeValue(node) === 'link';
}

/**
 * Type guard for CodeNode.
 * Works with both old (nodeType) and new (type) formats.
 */
export function isCodeNode(node: ContentNode): node is CodeNode {
  return getTypeValue(node) === 'code';
}

/**
 * Type guard for SeparatorNode.
 * Works with both old (nodeType) and new (type) formats.
 */
export function isSeparatorNode(node: ContentNode): node is SeparatorNode {
  return getTypeValue(node) === 'separator';
}

/**
 * Type guard for CommentNode.
 * Works with both old (nodeType) and new (type) formats.
 */
export function isCommentNode(node: ContentNode): node is CommentNode {
  return getTypeValue(node) === 'comment';
}

/**
 * Type guard for PlainText.
 */
export function isPlainText(content: InlineContent): content is PlainText {
  return content.type === 'plain';
}

/**
 * Type guard for InlineComponent.
 */
export function isInlineComponent(content: InlineContent): content is InlineComponent {
  return content.type === 'inline';
}

/**
 * Check if a TextNode is a time line component
 */
export function isTimeTextNode(node: TextNode): boolean {
  return node.textType === 'time';
}

/**
 * Check if a TextNode is an abbreviation line component
 */
export function isAbbrTextNode(node: TextNode): boolean {
  return node.textType === 'abbr';
}
