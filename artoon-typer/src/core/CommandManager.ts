/**
 * CommandManager
 * 
 * Manages and executes editor commands.
 * Provides a centralized way to register and execute commands.
 */

import type { 
  EditorCommand, 
  EditorControllerInterface,
} from '../types';

/**
 * CommandManager - manages editor commands
 */
export class CommandManager {
  private commands: Map<string, EditorCommand> = new Map();
  private controller: EditorControllerInterface | null = null;
  
  /**
   * Set the editor controller
   */
  setController(controller: EditorControllerInterface): void {
    this.controller = controller;
  }
  
  /**
   * Register a command
   */
  register(command: EditorCommand): void {
    if (this.commands.has(command.id)) {
      console.warn(`CommandManager: Overwriting command "${command.id}"`);
    }
    this.commands.set(command.id, command);
  }
  
  /**
   * Register multiple commands
   */
  registerAll(commands: EditorCommand[]): void {
    for (const cmd of commands) {
      this.register(cmd);
    }
  }
  
  /**
   * Unregister a command
   */
  unregister(id: string): void {
    this.commands.delete(id);
  }
  
  /**
   * Get a command by ID
   */
  get(id: string): EditorCommand | undefined {
    return this.commands.get(id);
  }
  
  /**
   * Check if a command exists
   */
  has(id: string): boolean {
    return this.commands.has(id);
  }
  
  /**
   * Get all registered commands
   */
  getAll(): EditorCommand[] {
    return Array.from(this.commands.values());
  }
  
  /**
   * Get commands by shortcut
   */
  getByShortcut(shortcut: string): EditorCommand | undefined {
    return this.getAll().find(cmd => cmd.shortcut === shortcut);
  }
  
  /**
   * Check if a command can be executed
   */
  canExecute(id: string): boolean {
    if (!this.controller) return false;
    
    const command = this.commands.get(id);
    if (!command) return false;
    
    if (command.canExecute) {
      return command.canExecute(this.controller);
    }
    
    return true;
  }
  
  /**
   * Execute a command by ID
   */
  execute(id: string): boolean {
    if (!this.controller) {
      console.warn('CommandManager: No controller set');
      return false;
    }
    
    const command = this.commands.get(id);
    if (!command) {
      console.warn(`CommandManager: Unknown command "${id}"`);
      return false;
    }
    
    if (!this.canExecute(id)) {
      return false;
    }
    
    try {
      command.execute(this.controller);
      return true;
    } catch (error) {
      console.error(`CommandManager: Error executing "${id}"`, error);
      return false;
    }
  }
  
  /**
   * Execute command by shortcut
   */
  executeByShortcut(shortcut: string): boolean {
    const command = this.getByShortcut(shortcut);
    if (!command) return false;
    return this.execute(command.id);
  }
  
  /**
   * Clear all commands
   */
  clear(): void {
    this.commands.clear();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Built-in Commands
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Undo command
 */
export const undoCommand: EditorCommand = {
  id: 'undo',
  name: 'Undo',
  shortcut: 'Ctrl+Z',
  execute: (controller) => controller.undo(),
  canExecute: (controller) => {
    // Check if controller has canUndo method
    const ctrl = controller as any;
    return ctrl.canUndo ? ctrl.canUndo() : true;
  },
};

/**
 * Redo command
 */
export const redoCommand: EditorCommand = {
  id: 'redo',
  name: 'Redo',
  shortcut: 'Ctrl+Y',
  execute: (controller) => controller.redo(),
  canExecute: (controller) => {
    const ctrl = controller as any;
    return ctrl.canRedo ? ctrl.canRedo() : true;
  },
};

/**
 * Delete block command
 */
export const deleteBlockCommand: EditorCommand = {
  id: 'deleteBlock',
  name: 'Delete Block',
  shortcut: 'Ctrl+Shift+Backspace',
  execute: (controller) => {
    const focused = controller.getFocusedBlock();
    if (focused) {
      controller.removeBlock(focused.id);
    }
  },
  canExecute: (controller) => !!controller.getFocusedBlock(),
};

/**
 * Duplicate block command
 */
export const duplicateBlockCommand: EditorCommand = {
  id: 'duplicateBlock',
  name: 'Duplicate Block',
  shortcut: 'Ctrl+D',
  execute: (controller) => {
    const focused = controller.getFocusedBlock();
    if (focused) {
      const ctrl = controller as any;
      if (ctrl.duplicateBlock) {
        ctrl.duplicateBlock(focused.id);
      }
    }
  },
  canExecute: (controller) => !!controller.getFocusedBlock(),
};

/**
 * Move block up command
 */
export const moveBlockUpCommand: EditorCommand = {
  id: 'moveBlockUp',
  name: 'Move Block Up',
  shortcut: 'Ctrl+Shift+ArrowUp',
  execute: (controller) => {
    const focused = controller.getFocusedBlock();
    if (!focused) return;
    
    const blocks = controller.getBlocks();
    const index = blocks.findIndex(b => b.id === focused.id);
    if (index > 0) {
      controller.moveBlock(focused.id, index - 1);
    }
  },
  canExecute: (controller) => {
    const focused = controller.getFocusedBlock();
    if (!focused) return false;
    const blocks = controller.getBlocks();
    const index = blocks.findIndex(b => b.id === focused.id);
    return index > 0;
  },
};

/**
 * Move block down command
 */
export const moveBlockDownCommand: EditorCommand = {
  id: 'moveBlockDown',
  name: 'Move Block Down',
  shortcut: 'Ctrl+Shift+ArrowDown',
  execute: (controller) => {
    const focused = controller.getFocusedBlock();
    if (!focused) return;
    
    const blocks = controller.getBlocks();
    const index = blocks.findIndex(b => b.id === focused.id);
    if (index < blocks.length - 1) {
      controller.moveBlock(focused.id, index + 2);
    }
  },
  canExecute: (controller) => {
    const focused = controller.getFocusedBlock();
    if (!focused) return false;
    const blocks = controller.getBlocks();
    const index = blocks.findIndex(b => b.id === focused.id);
    return index < blocks.length - 1;
  },
};

/**
 * Toggle direction command
 */
export const toggleDirectionCommand: EditorCommand = {
  id: 'toggleDirection',
  name: 'Toggle Direction',
  shortcut: 'Ctrl+Shift+D',
  execute: (controller) => {
    const focused = controller.getFocusedBlock();
    if (focused) {
      const ctrl = controller as any;
      if (ctrl.toggleBlockDirection) {
        ctrl.toggleBlockDirection(focused.id);
      }
    }
  },
  canExecute: (controller) => !!controller.getFocusedBlock(),
};

/**
 * All built-in commands
 */
export const builtInCommands: EditorCommand[] = [
  undoCommand,
  redoCommand,
  deleteBlockCommand,
  duplicateBlockCommand,
  moveBlockUpCommand,
  moveBlockDownCommand,
  toggleDirectionCommand,
];

/**
 * Create a new command manager with built-in commands
 */
export function createCommandManager(includeBuiltIn: boolean = true): CommandManager {
  const manager = new CommandManager();
  if (includeBuiltIn) {
    manager.registerAll(builtInCommands);
  }
  return manager;
}
