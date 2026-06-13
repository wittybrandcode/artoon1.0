/**
 * ARTOON-TYPER Core Types
 * 
 * All type definitions for the block editor.
 * 
 * IMPORTANT: Uses InlineContent[] from @artoon/ast directly for inline content.
 * This ensures perfect compatibility with parser/serializer.
 */

import type {
  InlineContent,
  TextType,
  Direction,
  ListType,
  ListItemType,
  Modifier,
  ContentNode,
} from '@artoon/ast';

// ═══════════════════════════════════════════════════════════════════════════
// Block Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * All supported block types in the editor
 */
export type BlockType =
  // Text blocks
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'heading6'
  | 'quote'
  | 'preformatted'  // Phase 2: pre block
  // List blocks
  | 'list'          // Phase 18: unified list type (per-item listType)
  | 'bullet-list'   // Legacy
  | 'numbered-list' // Legacy
  | 'definition-list'  // Phase 2: dl block
  // Code blocks
  | 'code'
  // Table blocks
  | 'table'
  // Media blocks
  | 'image'
  | 'video'
  | 'audio'
  // Figure blocks
  | 'figure'  // Phase 2: figure block
  // File blocks
  | 'file'  // Phase 2: file block
  // Other blocks
  | 'divider'
  | 'line-break'  // Phase 2: br block
  // Phase 3: Advanced blocks
  | 'details'     // collapsible content
  | 'time-block'  // date/time block
  | 'abbr-block'  // abbreviation block
  | 'meta'        // metadata block
  // Phase 4: Additional blocks
  | 'link-block'  // link as block
  | 'custom'      // custom block
  | 'word-break'; // word break (wbr)

/**
 * Base interface for all blocks
 */
export interface BaseBlock {
  /** Unique block identifier */
  id: string;
  /** Block type */
  type: BlockType;
  /** Text direction (RTL/LTR) */
  direction: Direction;
  /** Block metadata */
  meta?: BlockMeta;
}

/**
 * Text-based block (paragraph, heading, quote)
 */
export interface TextBlock extends BaseBlock {
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6' | 'quote';
  /** Inline content (uses AST InlineContent directly) */
  content: readonly InlineContent[];
}

/**
 * Preformatted text block (preserves whitespace)
 */
export interface PreformattedBlock extends BaseBlock {
  type: 'preformatted';
  /** Plain text content (no inline formatting, preserves whitespace) */
  content: string;
}

/**
 * Line break block
 */
export interface LineBreakBlock extends BaseBlock {
  type: 'line-break';
}

/**
 * List item
 */
export interface ListItem {
  id: string;
  /** Item type matching ARTOON AST (li, dt, dd) — defaults to 'li' for ul/ol */
  itemType?: ListItemType;
  /** List type for THIS item (ul, ol, dl). Overrides block-level type. */
  listType?: ListType;
  /** Type of the nested list container (if different from parent) */
  childListType?: ListType;
  content: readonly InlineContent[];
  /** Nested items for hierarchical lists */
  children?: ListItem[];
}

/**
 * List block
 * 'list' is the new unified type where each item carries its own listType.
 * 'bullet-list' | 'numbered-list' are kept for backward compatibility.
 */
export interface ListBlock extends BaseBlock {
  type: 'list' | 'bullet-list' | 'numbered-list';
  items: ListItem[];
}

/**
 * Definition list item (term + definition)
 */
export interface DefinitionItem {
  id: string;
  /** Term (dt) */
  term: InlineContent[];
  /** Definition (dd) */
  definition: InlineContent[];
}

/**
 * Definition list block
 */
export interface DefinitionListBlock extends BaseBlock {
  type: 'definition-list';
  items: DefinitionItem[];
}

/**
 * Code block
 */
export interface CodeBlock extends BaseBlock {
  type: 'code';
  /** Programming language */
  language: string;
  /** Code content (plain text) */
  code: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
}

/**
 * Table cell
 */
export interface TableCell {
  id: string;
  content: readonly InlineContent[];
  /** Column span */
  colspan?: number;
  /** Row span */
  rowspan?: number;
}

/**
 * Table row
 */
export interface TableRow {
  id: string;
  cells: TableCell[];
  /** Is header row */
  isHeader?: boolean;
}

/**
 * Table block
 */
export interface TableBlock extends BaseBlock {
  type: 'table';
  rows: TableRow[];
  /** Has header row */
  hasHeader?: boolean;
}

/**
 * Media block (image, video, audio)
 */
export interface MediaBlock extends BaseBlock {
  type: 'image' | 'video' | 'audio';
  /** Media source URL */
  src: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Caption */
  caption?: InlineContent[];
  /** Width (px or %) */
  width?: string;
  /** Height (px or %) */
  height?: string;
}

/**
 * Divider block
 */
export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

/**
 * Figure block (media with caption)
 */
export interface FigureBlock extends BaseBlock {
  type: 'figure';
  /** Media type */
  mediaType: 'image' | 'video' | 'audio';
  /** Media source URL */
  src: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Caption content */
  caption?: InlineContent[];
  /** Auto-generated figure number */
  number?: number;
}

/**
 * File block (downloadable file)
 */
export interface FileBlock extends BaseBlock {
  type: 'file';
  /** File source URL */
  src: string;
  /** Display label */
  label: string;
  /** File size in bytes */
  size?: number;
  /** MIME type */
  mimeType?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Phase 3: Advanced Block Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Details block (collapsible content)
 */
export interface DetailsBlock extends BaseBlock {
  type: 'details';
  /** Summary text (clickable header) */
  summary: InlineContent[];
  /** Nested content blocks */
  content: Block[];
  /** Is expanded/open */
  isOpen?: boolean;
}

/**
 * Time block (date/time display)
 */
export interface TimeBlock extends BaseBlock {
  type: 'time-block';
  /** ISO datetime value */
  datetime: string;
  /** Display text (optional, defaults to datetime) */
  displayText?: string;
}

/**
 * Abbreviation block
 */
export interface AbbrBlock extends BaseBlock {
  type: 'abbr-block';
  /** Abbreviation text */
  abbr: string;
  /** Full expansion/title */
  title: string;
}

/**
 * Meta field
 */
export interface MetaField {
  id: string;
  /** Field name */
  name: string;
  /** Field value */
  value: string;
}

/**
 * Meta block (document metadata)
 */
export interface MetaBlock extends BaseBlock {
  type: 'meta';
  /** Metadata fields */
  fields: MetaField[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Phase 4: Additional Block Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Link block (standalone link — mirrors ARTOON LinkNode)
 * 
 * ARTOON syntax: >.a:: url; text
 * With modifiers: >.[b+a:: url; text]
 */
export interface LinkBlock extends BaseBlock {
  type: 'link-block';
  /** Link URL */
  url: string;
  /** Display text */
  text: string;
  /** Text modifiers (bold, italic, etc.) — from ARTOON */
  modifiers: Modifier[];
}

/**
 * Custom block child element
 */
export interface CustomBlockChild {
  id: string;
  /** Child type (e.g., 'p', 't1', 'img') */
  type: string;
  /** Child content */
  content: InlineContent[] | string;
}

/**
 * Custom block (user-defined block type)
 */
export interface CustomBlock extends BaseBlock {
  type: 'custom';
  /** Custom block name */
  name: string;
  /** Block children */
  children: CustomBlockChild[];
  /** Custom fields */
  fields?: Record<string, string>;
}

/**
 * Word break block (wbr)
 */
export interface WordBreakBlock extends BaseBlock {
  type: 'word-break';
}

/**
 * Union type for all blocks
 */
export type Block =
  | TextBlock
  | PreformattedBlock
  | LineBreakBlock
  | ListBlock
  | DefinitionListBlock
  | CodeBlock
  | TableBlock
  | MediaBlock
  | FigureBlock
  | FileBlock
  | DividerBlock
  // Phase 3
  | DetailsBlock
  | TimeBlock
  | AbbrBlock
  | MetaBlock
  // Phase 4
  | LinkBlock
  | CustomBlock
  | WordBreakBlock;

/**
 * Block metadata
 */
export interface BlockMeta {
  /** Custom CSS classes */
  className?: string;
  /** Custom styles */
  style?: Record<string, string>;
  /** Custom data attributes */
  data?: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Editor Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Editor configuration
 */
export interface EditorConfig {
  /** Initial blocks */
  initialBlocks?: Block[];
  /** Initial ARTOON content (alternative to initialBlocks) */
  initialContent?: string;
  /** Default text direction */
  defaultDirection?: Direction;
  /** Placeholder text for empty editor */
  placeholder?: string;
  /** Read-only mode */
  readOnly?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Theme (light/dark) */
  theme?: 'light' | 'dark' | 'system';
  /** Enabled block types (all if not specified) */
  enabledBlocks?: BlockType[];
  /** Custom block definitions */
  customBlocks?: BlockDefinition[];
  /** Event handlers */
  onChange?: (blocks: Block[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * Editor state
 */
export interface EditorState {
  /** All blocks in the editor */
  blocks: Block[];
  /** Currently focused block ID */
  focusedBlockId: string | null;
  /** Selection state */
  selection: SelectionState | null;
  /** Can undo */
  canUndo: boolean;
  /** Can redo */
  canRedo: boolean;
}

/**
 * Selection state within a block
 */
export interface SelectionState {
  /** Block ID containing selection */
  blockId: string;
  /** Selection anchor offset */
  anchorOffset: number;
  /** Selection focus offset */
  focusOffset: number;
  /** Is selection collapsed (cursor) */
  isCollapsed: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// Block Definition Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Block definition for registry
 */
export interface BlockDefinition {
  /** Block type identifier */
  type: BlockType;
  /** Display name */
  name: string;
  /** Arabic display name */
  nameAr: string;
  /** Description */
  description?: string;
  /** Icon (emoji or component) */
  icon: string;
  /** Category for add menu */
  category: BlockCategory;
  /** Keyboard shortcut (e.g., "# " for heading) */
  shortcut?: string;
  /** Create default block */
  create: () => Block;
  /** Can this block be converted to another type */
  canConvertTo?: BlockType[];
}

/**
 * Block categories for add menu
 */
export type BlockCategory = 'text' | 'list' | 'media' | 'advanced';

/**
 * Add menu tab configuration
 */
export interface AddMenuTab {
  id: BlockCategory;
  label: string;
  labelAr: string;
  blocks: BlockType[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Command Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Editor command
 */
export interface EditorCommand {
  /** Command identifier */
  id: string;
  /** Command name */
  name: string;
  /** Execute command */
  execute: (controller: EditorControllerInterface) => void;
  /** Can execute command */
  canExecute?: (controller: EditorControllerInterface) => boolean;
  /** Keyboard shortcut */
  shortcut?: string;
}

/**
 * Editor controller interface (for commands)
 */
export interface EditorControllerInterface {
  getBlocks(): Block[];
  getBlock(id: string): Block | undefined;
  getFocusedBlock(): Block | undefined;
  addBlock(block: Block, index?: number): void;
  removeBlock(id: string): void;
  updateBlock(id: string, updates: Partial<Block>): void;
  moveBlock(id: string, newIndex: number): void;
  focusBlock(id: string): void;
  getSelection(): SelectionState | null;
  setSelection(selection: SelectionState): void;
  undo(): void;
  redo(): void;
}

// ═══════════════════════════════════════════════════════════════════════════
// Inline Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mark types for inline formatting
 * Maps to ARTOON Modifiers: s=bold, e=italic, u=underline, d=strikethrough
 */
export type MarkType = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'link' | 'mark' | 'sub' | 'sup';

/**
 * Map from MarkType to ARTOON Modifier
 */
export const MARK_TO_MODIFIER: Record<MarkType, Modifier | null> = {
  bold: 's',        // strong
  italic: 'e',      // emphasis
  underline: 'u',
  strikethrough: 'd', // deleted
  code: null,       // handled separately as inline component
  link: null,       // handled separately as inline component
  mark: 'mark',
  sub: 'sub',
  sup: 'sup',
};

/**
 * Map from ARTOON Modifier to MarkType
 */
export const MODIFIER_TO_MARK: Record<Modifier, MarkType> = {
  s: 'bold',
  e: 'italic',
  u: 'underline',
  d: 'strikethrough',
  mark: 'mark',
  sub: 'sub',
  sup: 'sup',
};

/**
 * Mark definition
 */
export interface Mark {
  type: MarkType;
  attrs?: MarkAttrs;
}

/**
 * Mark attributes (for links, etc.)
 */
export interface MarkAttrs {
  href?: string;
  title?: string;
}

// Re-export AST types for convenience
export type { InlineContent, Direction, Modifier, ContentNode, TextType, ListType, ListItemType };

// ═══════════════════════════════════════════════════════════════════════════
// Event Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Block event
 */
export interface BlockEvent {
  type: 'add' | 'remove' | 'update' | 'move' | 'focus';
  blockId: string;
  block?: Block;
  previousIndex?: number;
  newIndex?: number;
}

/**
 * Editor event handler
 */
export type EditorEventHandler = (event: BlockEvent) => void;

// ═══════════════════════════════════════════════════════════════════════════
// UI Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Menu position
 */
export interface MenuPosition {
  x: number;
  y: number;
}

/**
 * Drag state
 */
export interface DragState {
  isDragging: boolean;
  draggedBlockId: string | null;
  dropTargetIndex: number | null;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    text: string;
    primary: string;
    border: string;
    hover: string;
  };
}
