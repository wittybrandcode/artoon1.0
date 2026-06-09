/**
 * @artoon/editor-state - Core Type Definitions
 * 
 * Framework-agnostic editor state management for ARTOON documents.
 * Inspired by ProseMirror's architecture.
 */

import type {
  ARTOONDocument,
  ContentNode,
  InlineContent,
  Direction,
  Modifier
} from '@artoon/ast';

// ═══════════════════════════════════════════════════════════════════════════
// POSITION & MAPPING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A position in the document (character offset from start)
 */
export type Position = number;

/**
 * Resolved position with context information
 */
export interface ResolvedPos {
  /** Absolute position in document */
  pos: Position;
  /** Depth in node tree (0 = document root) */
  depth: number;
  /** Parent node at each depth */
  path: ContentNode[];
  /** Index within parent at each depth */
  index: number[];
  /** Node directly after this position (if any) */
  nodeAfter: ContentNode | null;
  /** Node directly before this position (if any) */
  nodeBefore: ContentNode | null;
  /** Parent node (node at depth - 1) */
  parent: ContentNode | null;
  /** Text offset within text node (if applicable) */
  textOffset: number;
  /** Get node at given depth */
  node(depth?: number): ContentNode | null;
  /** Get index at given depth */
  indexAt(depth?: number): number;
  /** Get start position of node at depth */
  start(depth?: number): Position;
  /** Get end position of node at depth */
  end(depth?: number): Position;
}

/**
 * Result of mapping a position through changes
 */
export interface MapResult {
  /** New position after mapping */
  pos: Position;
  /** Whether the position was deleted */
  deleted: boolean;
}

/**
 * Maps positions through document changes
 */
export interface Mapping {
  /** Map a position, returning new position */
  map(pos: Position, bias?: -1 | 1): Position;
  /** Map a position with deletion info */
  mapResult(pos: Position, bias?: -1 | 1): MapResult;
}

// ═══════════════════════════════════════════════════════════════════════════
// SELECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base selection interface
 */
export interface Selection {
  /** Selection type discriminator */
  readonly type: 'text' | 'node' | 'all';
  /** Anchor position (where selection started) */
  readonly anchor: Position;
  /** Head position (where cursor is) */
  readonly head: Position;
  /** Smaller of anchor/head */
  readonly from: Position;
  /** Larger of anchor/head */
  readonly to: Position;
  /** True if from === to */
  readonly empty: boolean;
  /** Resolved anchor position */
  readonly $anchor: ResolvedPos;
  /** Resolved head position */
  readonly $head: ResolvedPos;
  /** Resolved from position */
  readonly $from: ResolvedPos;
  /** Resolved to position */
  readonly $to: ResolvedPos;
  
  /** Map selection through changes */
  map(mapping: Mapping): Selection;
  /** Check equality */
  eq(other: Selection): boolean;
  /** Get selected content as slice */
  content(): Slice;
  /** Convert to JSON */
  toJSON(): SelectionJSON;
}

export interface SelectionJSON {
  type: string;
  anchor: number;
  head: number;
}

/**
 * Text selection (cursor or range)
 */
export interface TextSelection extends Selection {
  readonly type: 'text';
}

/**
 * Node selection (entire node selected)
 */
export interface NodeSelection extends Selection {
  readonly type: 'node';
  /** The selected node */
  readonly node: ContentNode;
}

/**
 * All selection (entire document)
 */
export interface AllSelection extends Selection {
  readonly type: 'all';
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT MODEL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A slice of document content
 */
export interface Slice {
  /** Content nodes */
  readonly content: Fragment;
  /** Open depth at start */
  readonly openStart: number;
  /** Open depth at end */
  readonly openEnd: number;
  /** Total size */
  readonly size: number;
}

/**
 * A fragment of nodes (like an array but with helpers)
 */
export interface Fragment {
  /** Number of child nodes */
  readonly childCount: number;
  /** Total size in positions */
  readonly size: number;
  
  /** Get child at index */
  child(index: number): ContentNode;
  /** Get first child */
  readonly firstChild: ContentNode | null;
  /** Get last child */
  readonly lastChild: ContentNode | null;
  /** Iterate children */
  forEach(fn: (node: ContentNode, offset: number, index: number) => void): void;
  /** Find index at position */
  findIndex(pos: Position): { index: number; offset: number };
  /** Convert to array */
  toArray(): ContentNode[];
}

/**
 * Document wrapper with position-based operations
 */
export interface Document {
  /** The underlying AST */
  readonly ast: ARTOONDocument;
  /** Content as fragment */
  readonly content: Fragment;
  /** Total size in positions */
  readonly size: number;
  /** Text content (for search/display) */
  readonly textContent: string;
  
  /** Get node at position */
  nodeAt(pos: Position): ContentNode | null;
  /** Resolve position to context */
  resolve(pos: Position): ResolvedPos;
  /** Get slice between positions */
  slice(from: Position, to: Position): Slice;
  /** Replace range with slice */
  replace(from: Position, to: Position, slice: Slice): Document;
  /** Convert to AST */
  toAST(): ARTOONDocument;
  /** Convert to JSON */
  toJSON(): unknown;
}

// ═══════════════════════════════════════════════════════════════════════════
// STEPS & TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Result of applying a step
 */
export interface StepResult {
  /** New document (if successful) */
  doc: Document | null;
  /** Error message (if failed) */
  failed: string | null;
}

/**
 * Atomic document change
 */
export interface Step {
  /** Step type discriminator */
  readonly type: string;
  
  /** Apply step to document */
  apply(doc: Document): StepResult;
  /** Create inverse step */
  invert(doc: Document): Step;
  /** Map step through mapping */
  map(mapping: Mapping): Step | null;
  /** Try to merge with another step */
  merge(other: Step): Step | null;
  /** Convert to JSON */
  toJSON(): StepJSON;
}

export interface StepJSON {
  type: string;
  [key: string]: unknown;
}

/**
 * Replace step - replaces content in range
 */
export interface ReplaceStep extends Step {
  readonly type: 'replace';
  readonly from: Position;
  readonly to: Position;
  readonly slice: Slice;
}

/**
 * Add mark step - adds formatting to range
 */
export interface AddMarkStep extends Step {
  readonly type: 'addMark';
  readonly from: Position;
  readonly to: Position;
  readonly mark: Modifier;
}

/**
 * Remove mark step - removes formatting from range
 */
export interface RemoveMarkStep extends Step {
  readonly type: 'removeMark';
  readonly from: Position;
  readonly to: Position;
  readonly mark: Modifier;
}

/**
 * Set node attributes step
 */
export interface SetAttrsStep extends Step {
  readonly type: 'setAttrs';
  readonly pos: Position;
  readonly attrs: Record<string, unknown>;
}

/**
 * Transaction - a set of changes to apply
 */
export interface Transaction {
  /** Steps in this transaction */
  readonly steps: Step[];
  /** Document before each step */
  readonly docs: Document[];
  /** Combined mapping */
  readonly mapping: Mapping;
  /** Current document (after all steps) */
  readonly doc: Document;
  /** Current selection */
  readonly selection: Selection;
  /** Metadata */
  readonly meta: Map<string, unknown>;
  /** Whether selection was explicitly set */
  readonly selectionSet: boolean;
  /** Time of transaction */
  readonly time: number;
  
  // Text operations
  insertText(text: string, from?: Position, to?: Position): Transaction;
  delete(from: Position, to: Position): Transaction;
  replaceWith(from: Position, to: Position, content: ContentNode | ContentNode[]): Transaction;
  replaceRangeWith(from: Position, to: Position, node: ContentNode): Transaction;
  
  // Mark operations
  addMark(from: Position, to: Position, mark: Modifier): Transaction;
  removeMark(from: Position, to: Position, mark: Modifier): Transaction;
  toggleMark(mark: Modifier): Transaction;
  clearMarks(from: Position, to: Position): Transaction;
  
  // Selection operations
  setSelection(selection: Selection): Transaction;
  
  // Node operations
  setNodeAttrs(pos: Position, attrs: Record<string, unknown>): Transaction;
  setBlockType(from: Position, to: Position, nodeType: string, attrs?: Record<string, unknown>): Transaction;
  
  // Metadata
  setMeta(key: string, value: unknown): Transaction;
  getMeta(key: string): unknown;
  
  // Step management
  step(step: Step): Transaction;
  
  // Scrolling hint
  scrollIntoView(): Transaction;
}

// ═══════════════════════════════════════════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A single history entry
 */
export interface HistoryItem {
  /** Steps that were applied */
  readonly steps: Step[];
  /** Inverse steps for undo */
  readonly inverseSteps: Step[];
  /** Selection before changes */
  readonly selection: Selection;
  /** Timestamp */
  readonly timestamp: number;
}

/**
 * History state
 */
export interface HistoryState {
  /** Undo stack */
  readonly undoStack: HistoryItem[];
  /** Redo stack */
  readonly redoStack: HistoryItem[];
  /** Can undo? */
  readonly canUndo: boolean;
  /** Can redo? */
  readonly canRedo: boolean;
  /** Undo depth */
  readonly undoDepth: number;
  /** Redo depth */
  readonly redoDepth: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PLUGINS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Plugin key for accessing plugin state
 */
export interface PluginKey<T = unknown> {
  /** Get plugin state from editor state */
  getState(state: EditorState): T | undefined;
}

/**
 * Plugin specification
 */
export interface PluginSpec<T = unknown> {
  /** Plugin key */
  key?: PluginKey<T>;
  /** Initial state */
  state?: {
    init(config: EditorStateConfig, state: EditorState): T;
    apply(tr: Transaction, value: T, oldState: EditorState, newState: EditorState): T;
  };
  /** Transaction filter */
  filterTransaction?(tr: Transaction, state: EditorState): boolean;
  /** Append transaction */
  appendTransaction?(
    transactions: Transaction[],
    oldState: EditorState,
    newState: EditorState
  ): Transaction | null;
  /** Props for view (if any) */
  props?: Record<string, unknown>;
}

/**
 * Plugin instance
 */
export interface Plugin<T = unknown> {
  /** Plugin specification */
  readonly spec: PluginSpec<T>;
  /** Plugin key */
  readonly key: PluginKey<T>;
  /** Get state from editor state */
  getState(state: EditorState): T | undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// EDITOR STATE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configuration for creating editor state
 */
export interface EditorStateConfig {
  /** Initial document (AST or Document) */
  doc?: ARTOONDocument | Document;
  /** Initial selection */
  selection?: Selection;
  /** Plugins to use */
  plugins?: Plugin[];
}

/**
 * The main editor state - immutable
 */
export interface EditorState {
  /** Current document */
  readonly doc: Document;
  /** Current selection */
  readonly selection: Selection;
  /** History state */
  readonly history: HistoryState;
  /** Active plugins */
  readonly plugins: Plugin[];
  
  /** Create a new transaction */
  readonly tr: Transaction;
  
  /** Apply transaction, returning new state */
  apply(tr: Transaction): EditorState;
  
  /** Get plugin state */
  getPluginState<T>(key: PluginKey<T>): T | undefined;
  
  /** Convert to JSON */
  toJSON(): EditorStateJSON;
}

export interface EditorStateJSON {
  doc: unknown;
  selection: SelectionJSON;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Dispatch function for applying transactions
 */
export type Dispatch = (tr: Transaction) => void;

/**
 * Command function signature
 * Returns true if command can execute, false otherwise
 * If dispatch is provided, executes the command
 */
export type Command = (
  state: EditorState,
  dispatch?: Dispatch
) => boolean;

/**
 * Keymap - maps key combinations to commands
 */
export type Keymap = Record<string, Command>;

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS FROM @artoon/ast
// ═══════════════════════════════════════════════════════════════════════════

export type {
  ARTOONDocument,
  ContentNode,
  InlineContent,
  Direction,
  Modifier,
  TextNode,
  ListNode,
  TableNode,
  BlockNode,
  MediaNode,
  LinkNode,
  CodeNode,
  CommentNode,
  SeparatorNode,
  CompoundNode,
  PlainText,
  InlineComponent
} from '@artoon/ast';
