/**
 * CommandManager Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  CommandManager, 
  createCommandManager,
  builtInCommands,
  undoCommand,
  redoCommand,
} from '../../src/core/CommandManager';
import type { EditorCommand, EditorControllerInterface, Block, TextBlock } from '../../src/types';

// Mock controller
function createMockController(overrides: Partial<EditorControllerInterface> = {}): EditorControllerInterface {
  const blocks: Block[] = [
    { id: 'b1', type: 'paragraph', direction: 'rtl', content: [] } as TextBlock,
    { id: 'b2', type: 'paragraph', direction: 'rtl', content: [] } as TextBlock,
  ];
  
  return {
    getBlocks: vi.fn(() => blocks),
    getBlock: vi.fn((id) => blocks.find(b => b.id === id)),
    getFocusedBlock: vi.fn(() => blocks[0]),
    addBlock: vi.fn(),
    removeBlock: vi.fn(),
    updateBlock: vi.fn(),
    moveBlock: vi.fn(),
    focusBlock: vi.fn(),
    getSelection: vi.fn(() => null),
    setSelection: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    ...overrides,
  };
}

describe('CommandManager', () => {
  let manager: CommandManager;
  let controller: EditorControllerInterface;

  beforeEach(() => {
    manager = new CommandManager();
    controller = createMockController();
    manager.setController(controller);
  });

  describe('register', () => {
    it('should register a command', () => {
      const cmd: EditorCommand = {
        id: 'test',
        name: 'Test',
        execute: vi.fn(),
      };
      
      manager.register(cmd);
      expect(manager.has('test')).toBe(true);
    });

    it('should overwrite existing command', () => {
      const cmd1: EditorCommand = { id: 'test', name: 'Test 1', execute: vi.fn() };
      const cmd2: EditorCommand = { id: 'test', name: 'Test 2', execute: vi.fn() };
      
      manager.register(cmd1);
      manager.register(cmd2);
      
      expect(manager.get('test')?.name).toBe('Test 2');
    });
  });

  describe('registerAll', () => {
    it('should register multiple commands', () => {
      const commands: EditorCommand[] = [
        { id: 'cmd1', name: 'Command 1', execute: vi.fn() },
        { id: 'cmd2', name: 'Command 2', execute: vi.fn() },
      ];
      
      manager.registerAll(commands);
      
      expect(manager.has('cmd1')).toBe(true);
      expect(manager.has('cmd2')).toBe(true);
    });
  });

  describe('unregister', () => {
    it('should remove a command', () => {
      manager.register({ id: 'test', name: 'Test', execute: vi.fn() });
      manager.unregister('test');
      
      expect(manager.has('test')).toBe(false);
    });
  });

  describe('get', () => {
    it('should return command by ID', () => {
      const cmd: EditorCommand = { id: 'test', name: 'Test', execute: vi.fn() };
      manager.register(cmd);
      
      expect(manager.get('test')).toBe(cmd);
    });

    it('should return undefined for unknown ID', () => {
      expect(manager.get('unknown')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all commands', () => {
      manager.register({ id: 'cmd1', name: 'Command 1', execute: vi.fn() });
      manager.register({ id: 'cmd2', name: 'Command 2', execute: vi.fn() });
      
      expect(manager.getAll()).toHaveLength(2);
    });
  });

  describe('getByShortcut', () => {
    it('should find command by shortcut', () => {
      const cmd: EditorCommand = {
        id: 'test',
        name: 'Test',
        shortcut: 'Ctrl+T',
        execute: vi.fn(),
      };
      manager.register(cmd);
      
      expect(manager.getByShortcut('Ctrl+T')).toBe(cmd);
    });

    it('should return undefined for unknown shortcut', () => {
      expect(manager.getByShortcut('Ctrl+Unknown')).toBeUndefined();
    });
  });

  describe('canExecute', () => {
    it('should return true when no canExecute defined', () => {
      manager.register({ id: 'test', name: 'Test', execute: vi.fn() });
      expect(manager.canExecute('test')).toBe(true);
    });

    it('should use canExecute function', () => {
      manager.register({
        id: 'test',
        name: 'Test',
        execute: vi.fn(),
        canExecute: () => false,
      });
      
      expect(manager.canExecute('test')).toBe(false);
    });

    it('should return false for unknown command', () => {
      expect(manager.canExecute('unknown')).toBe(false);
    });

    it('should return false when no controller', () => {
      const mgr = new CommandManager();
      mgr.register({ id: 'test', name: 'Test', execute: vi.fn() });
      
      expect(mgr.canExecute('test')).toBe(false);
    });
  });

  describe('execute', () => {
    it('should execute command', () => {
      const execute = vi.fn();
      manager.register({ id: 'test', name: 'Test', execute });
      
      const result = manager.execute('test');
      
      expect(result).toBe(true);
      expect(execute).toHaveBeenCalledWith(controller);
    });

    it('should return false for unknown command', () => {
      expect(manager.execute('unknown')).toBe(false);
    });

    it('should return false when canExecute returns false', () => {
      const execute = vi.fn();
      manager.register({
        id: 'test',
        name: 'Test',
        execute,
        canExecute: () => false,
      });
      
      const result = manager.execute('test');
      
      expect(result).toBe(false);
      expect(execute).not.toHaveBeenCalled();
    });

    it('should handle execution errors', () => {
      manager.register({
        id: 'test',
        name: 'Test',
        execute: () => { throw new Error('Test error'); },
      });
      
      const result = manager.execute('test');
      expect(result).toBe(false);
    });
  });

  describe('executeByShortcut', () => {
    it('should execute command by shortcut', () => {
      const execute = vi.fn();
      manager.register({
        id: 'test',
        name: 'Test',
        shortcut: 'Ctrl+T',
        execute,
      });
      
      const result = manager.executeByShortcut('Ctrl+T');
      
      expect(result).toBe(true);
      expect(execute).toHaveBeenCalled();
    });

    it('should return false for unknown shortcut', () => {
      expect(manager.executeByShortcut('Ctrl+Unknown')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all commands', () => {
      manager.register({ id: 'cmd1', name: 'Command 1', execute: vi.fn() });
      manager.register({ id: 'cmd2', name: 'Command 2', execute: vi.fn() });
      
      manager.clear();
      
      expect(manager.getAll()).toHaveLength(0);
    });
  });
});

describe('Built-in Commands', () => {
  let manager: CommandManager;
  let controller: EditorControllerInterface;

  beforeEach(() => {
    manager = createCommandManager(true);
    controller = createMockController();
    manager.setController(controller);
  });

  it('should include all built-in commands', () => {
    expect(manager.has('undo')).toBe(true);
    expect(manager.has('redo')).toBe(true);
    expect(manager.has('deleteBlock')).toBe(true);
    expect(manager.has('duplicateBlock')).toBe(true);
    expect(manager.has('moveBlockUp')).toBe(true);
    expect(manager.has('moveBlockDown')).toBe(true);
    expect(manager.has('toggleDirection')).toBe(true);
  });

  describe('undo command', () => {
    it('should call controller.undo', () => {
      manager.execute('undo');
      expect(controller.undo).toHaveBeenCalled();
    });
  });

  describe('redo command', () => {
    it('should call controller.redo', () => {
      manager.execute('redo');
      expect(controller.redo).toHaveBeenCalled();
    });
  });

  describe('deleteBlock command', () => {
    it('should remove focused block', () => {
      manager.execute('deleteBlock');
      expect(controller.removeBlock).toHaveBeenCalledWith('b1');
    });

    it('should not execute when no focused block', () => {
      controller = createMockController({ getFocusedBlock: () => undefined });
      manager.setController(controller);
      
      expect(manager.canExecute('deleteBlock')).toBe(false);
    });
  });

  describe('moveBlockUp command', () => {
    it('should move block up', () => {
      // Focus second block
      controller = createMockController({
        getFocusedBlock: () => ({ id: 'b2', type: 'paragraph', direction: 'rtl', content: [] } as TextBlock),
      });
      manager.setController(controller);
      
      manager.execute('moveBlockUp');
      expect(controller.moveBlock).toHaveBeenCalledWith('b2', 0);
    });

    it('should not execute when at top', () => {
      expect(manager.canExecute('moveBlockUp')).toBe(false);
    });
  });

  describe('moveBlockDown command', () => {
    it('should move block down', () => {
      manager.execute('moveBlockDown');
      expect(controller.moveBlock).toHaveBeenCalledWith('b1', 2);
    });

    it('should not execute when at bottom', () => {
      controller = createMockController({
        getFocusedBlock: () => ({ id: 'b2', type: 'paragraph', direction: 'rtl', content: [] } as TextBlock),
      });
      manager.setController(controller);
      
      expect(manager.canExecute('moveBlockDown')).toBe(false);
    });
  });
});

describe('createCommandManager', () => {
  it('should create manager with built-in commands', () => {
    const manager = createCommandManager(true);
    expect(manager.getAll().length).toBe(builtInCommands.length);
  });

  it('should create empty manager when includeBuiltIn is false', () => {
    const manager = createCommandManager(false);
    expect(manager.getAll()).toHaveLength(0);
  });
});
