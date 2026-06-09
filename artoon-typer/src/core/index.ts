/**
 * Core Module
 * 
 * Contains the main editor logic:
 * - EditorController: Main editor controller
 * - BlockRegistry: Block type registry
 * - CommandManager: Command execution
 * - KeyboardManager: Keyboard shortcuts
 * - DragDropManager: Drag and drop handling
 */

// Phase 1 exports
export { EditorController, createEditorController } from './EditorControllerV2';
export { BlockRegistry, getDefaultRegistry, createBlockRegistry } from './BlockRegistry';
export { 
  CommandManager, 
  createCommandManager,
  builtInCommands,
  undoCommand,
  redoCommand,
  deleteBlockCommand,
  duplicateBlockCommand,
  moveBlockUpCommand,
  moveBlockDownCommand,
  toggleDirectionCommand,
} from './CommandManager';
export { generateId, resetIdCounter, randomId, deepClone, arraysEqual } from './utils';

// Phase 5 exports will be added here
// export { KeyboardManager } from './KeyboardManager';
// export { DragDropManager } from './DragDropManager';
