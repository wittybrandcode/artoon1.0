/**
 * @artoon/editor-state
 * 
 * Framework-agnostic editor state management for ARTOON documents.
 * Inspired by ProseMirror's architecture.
 * 
 * @packageDocumentation
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export type {
  // Position & Mapping
  Position,
  ResolvedPos,
  MapResult,
  Mapping,
  
  // Selection
  Selection,
  SelectionJSON,
  TextSelection,
  NodeSelection,
  AllSelection,
  
  // Document
  Slice,
  Fragment,
  Document,
  
  // Steps & Transactions
  Step,
  StepJSON,
  StepResult,
  Transaction,
  
  // History
  HistoryItem,
  HistoryState,
  
  // Plugins
  Plugin,
  PluginKey,
  PluginSpec,
  
  // Editor State
  EditorState,
  EditorStateConfig,
  EditorStateJSON,
  
  // Commands
  Command,
  Dispatch,
  Keymap,
  
  // Re-exports from @artoon/ast
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
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// STATE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { EditorStateImpl } from './state/EditorState';
export { DocumentImpl, nodeSize } from './state/Document';
export { FragmentImpl } from './state/Fragment';
export { SliceImpl } from './state/Slice';
export { ResolvedPosImpl, resolvePos } from './state/ResolvedPos';

// ═══════════════════════════════════════════════════════════════════════════
// SELECTION EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { 
  TextSelectionImpl, 
  NodeSelectionImpl, 
  AllSelectionImpl,
  selectionFromJSON 
} from './selection/Selection';

export {
  findSelectionNear,
  findSelectionAtStart,
  findSelectionAtEnd,
  findSelectionIn,
  atBlockBoundary,
  selectionDepth
} from './selection/helpers';

// ═══════════════════════════════════════════════════════════════════════════
// TRANSACTION EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { TransactionImpl } from './transaction/Transaction';
export { MappingImpl } from './transaction/Mapping';
export { 
  ReplaceStep, 
  AddMarkStep, 
  RemoveMarkStep, 
  SetAttrsStep,
  stepFromJSON 
} from './transaction/Step';

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

// Text commands
export {
  insertText,
  deleteBackward,
  deleteForward,
  deleteWordBackward,
  deleteWordForward,
  selectAll,
  insertLineBreak,
  insertParagraph,
  joinBackward,
  joinForward,
  textKeymap
} from './commands/text';

// Format commands
export {
  toggleStrong,
  toggleEmphasis,
  toggleUnderline,
  toggleStrikethrough,
  toggleHighlight,
  toggleSubscript,
  toggleSuperscript,
  toggleInlineCode,
  toggleMark,
  addMark,
  removeMark,
  clearMarks,
  isMarkActive,
  formatKeymap,
  formatCommands
} from './commands/format';

// Command utilities
export { createCommand, chainCommands, canRun } from './commands/types';
export type { NamedCommand, CommandMeta } from './commands/types';

// ═══════════════════════════════════════════════════════════════════════════
// HISTORY EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { 
  HistoryManager, 
  HistoryStateImpl, 
  HistoryItemImpl,
  createHistory 
} from './history/History';

export type { HistoryConfig } from './history/History';

export { undo, redo, historyKeymap } from './history/commands';

// ═══════════════════════════════════════════════════════════════════════════
// PLUGIN EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { PluginImpl, PluginKeyImpl, createPlugin, createPluginKey } from './plugins/Plugin';
export { historyPlugin, historyPluginKey } from './plugins/builtin/history';
export { keymapPlugin, keymapPluginKey, combineKeymaps } from './plugins/builtin/keymap';

// ═══════════════════════════════════════════════════════════════════════════
// VERSION
// ═══════════════════════════════════════════════════════════════════════════

export const VERSION = '1.0.0';
