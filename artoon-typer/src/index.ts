/**
 * ARTOON-TYPER
 * 
 * Block-based rich text editor for ARTOON format.
 * Inspired by Notion/TipTap with native RTL support.
 * 
 * @packageDocumentation
 */

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type {
  // Block types
  BlockType,
  BaseBlock,
  TextBlock,
  ListBlock,
  ListItem,
  CodeBlock,
  TableBlock,
  TableRow,
  TableCell,
  MediaBlock,
  DividerBlock,
  Block,
  BlockMeta,
  
  // Editor types
  EditorConfig,
  EditorState,
  SelectionState,
  
  // Definition types
  BlockDefinition,
  BlockCategory,
  AddMenuTab,
  
  // Command types
  EditorCommand,
  EditorControllerInterface,
  
  // Inline types
  MarkType,
  Mark,
  MarkAttrs,
  
  // Event types
  BlockEvent,
  EditorEventHandler,
  
  // UI types
  MenuPosition,
  DragState,
  ThemeConfig,
  
  // Re-exported AST types
  InlineContent,
  Direction,
  Modifier,
  ContentNode,
  TextType,
  ListType,
  ListItemType,
} from './types';

// Export constants
export { MARK_TO_MODIFIER, MODIFIER_TO_MARK } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// Core (Phase 1) 
// ═══════════════════════════════════════════════════════════════════════════

export { EditorController, createEditorController } from './core/EditorControllerV2';
export { BlockRegistry, getDefaultRegistry, createBlockRegistry } from './core/BlockRegistry';
export { 
  CommandManager, 
  createCommandManager,
  builtInCommands,
} from './core/CommandManager';
export {
  KeyboardManager,
  createKeyboardManager,
  type KeyboardShortcut,
  type KeyboardManagerOptions,
  type ShortcutContext,
  type KeyboardCommand,
} from './core/KeyboardManager';
export {
  DragDropManager,
  createDragDropManager,
  type DragDropManagerOptions,
  type DragState as CoreDragState,
  type DropPosition,
} from './core/DragDropManager';
export { generateId, deepClone } from './core/utils';

// ═══════════════════════════════════════════════════════════════════════════
// Integration (Phase 1 & 3) ✅
// ═══════════════════════════════════════════════════════════════════════════

export { 
  ARTOONImporter, 
  createARTOONImporter, 
  importARTOON,
  type ImportOptions,
} from './integration/ARTOONImporter';
export { 
  ARTOONExporter, 
  createARTOONExporter, 
  exportARTOON,
  type ExportOptions,
} from './integration/ARTOONExporter';

// Re-export state kernel types used by the editor integration.
export type {
  EditorState as KernelEditorState,
  Selection as KernelSelection,
  Document as KernelDocument,
  Transaction as KernelTransaction
} from '@artoon/state';

// ═══════════════════════════════════════════════════════════════════════════
// Blocks (Phase 2 & 3)
// ═══════════════════════════════════════════════════════════════════════════

export { defaultBlockDefinitions, getDefinition, getDefinitionsByCategory } from './blocks/definitions';

// Block views (Phase 2 & 3) ✅
export { 
  BaseBlockView, 
  type BlockViewOptions,
} from './blocks/views/BaseBlockView';

export { 
  TextBlockView, 
  createTextBlockView,
  type TextBlockViewOptions,
} from './blocks/views/TextBlockView';

export { 
  ListBlockView, 
  createListBlockView,
  type ListBlockViewOptions,
} from './blocks/views/ListBlockView';

export { 
  CodeBlockView, 
  createCodeBlockView,
  type CodeBlockViewOptions,
} from './blocks/views/CodeBlockView';

export { 
  MediaBlockView, 
  createMediaBlockView,
  type MediaBlockViewOptions,
} from './blocks/views/MediaBlockView';

export { 
  DividerBlockView, 
  createDividerBlockView,
  type DividerBlockViewOptions,
} from './blocks/views/DividerBlockView';

export { 
  TableBlockView, 
  createTableBlockView,
  type TableBlockViewOptions,
} from './blocks/views/TableBlockView';

// ═══════════════════════════════════════════════════════════════════════════
// Inline (Phase 2) ✅
// ═══════════════════════════════════════════════════════════════════════════

export { 
  InlineParser, 
  createInlineParser, 
  parseHtmlToInline,
  type ParseOptions,
} from './inline/InlineParser';

export { 
  InlineRenderer, 
  createInlineRenderer, 
  renderInlineContent,
  type RenderOptions,
} from './inline/InlineRenderer';

export { 
  MarkManager, 
  createMarkManager,
} from './inline/MarkManager';

// ═══════════════════════════════════════════════════════════════════════════
// UI Components (Phase 4) ✅
// ═══════════════════════════════════════════════════════════════════════════

export { 
  EditorContainer,
  type EditorContainerProps,
} from './ui/components/EditorContainer';

export { 
  BlockWrapper,
  type BlockWrapperProps,
} from './ui/components/BlockWrapper';

export { 
  BlockRenderer,
  type BlockRendererProps,
} from './ui/components/BlockRenderer';

export { 
  AddMenu,
  type AddMenuProps,
} from './ui/components/AddMenu';

export { 
  InlineToolbar,
  type InlineToolbarProps,
} from './ui/components/InlineToolbar';

export { 
  ContextMenu,
  type ContextMenuProps,
} from './ui/components/ContextMenu';

// ═══════════════════════════════════════════════════════════════════════════
// Hooks (Phase 4 & 5) ✅
// ═══════════════════════════════════════════════════════════════════════════

export { 
  useEditor, 
  createUseEditor,
  type UseEditorOptions,
  type UseEditorReturn,
  type SlashMenuState,
  type BlockMenuState,
  type LinkDialogState,
  type BlockAction,
} from './ui/hooks/useEditor';

export {
  useKeyboard,
  type UseKeyboardOptions,
  type UseKeyboardReturn,
} from './ui/hooks/useKeyboard';

export {
  useDragDrop,
  type UseDragDropOptions,
  type UseDragDropReturn,
  type DragHandleProps,
  type DropZoneProps,
} from './ui/hooks/useDragDrop';

// ═══════════════════════════════════════════════════════════════════════════
// Context (Phase 6) ✅
// ═══════════════════════════════════════════════════════════════════════════

export {
  ThemeProvider,
  useTheme,
  type EditorTheme,
  type PreviewTheme,
  type EditorMode,
  type EditorPreference,
  type ThemeContextValue,
} from './themes';

// ═══════════════════════════════════════════════════════════════════════════
// Version
// ═══════════════════════════════════════════════════════════════════════════

export const VERSION = '1.0.0';
