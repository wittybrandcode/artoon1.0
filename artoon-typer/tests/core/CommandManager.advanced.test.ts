/**
 * CommandManager Advanced Tests
 * 
 * Tests for command chains, rollback, conflicts, and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandManager, createCommandManager } from '../../src/core/CommandManager.js';
import { EditorController } from '../../src/core/EditorController.js';
import type { EditorCommand, TextBlock } from '../../src/types';

describe('CommandManager - Advanced', () => {
  let manager: CommandManager;
  let controller: EditorController;
  
  beforeEach(() => {
    controller = new EditorController({
      initialBlocks: [],
      defaultDirection: 'rtl',
    });
    manager = createCommandManager(false); // No built-in commands
    manager.setController(controller);
  });
  
  describe('Command Chain Execution', () => {
    it('should execute multiple commands in sequence', () => {
      const executionOrder: string[] = [];
      
      const command1: EditorCommand = {
        id: 'cmd1',
        name: 'Command 1',
        execute: () => executionOrder.push('cmd1'),
      };
      
      const command2: EditorCommand = {
        id: 'cmd2',
        name: 'Command 2',
        execute: () => executionOrder.push('cmd2'),
      };
      
      const command3: EditorCommand = {
        id: 'cmd3',
        name: 'Command 3',
        execute: () => executionOrder.push('cmd3'),
      };
      
      manager.register(command1);
      manager.register(command2);
      manager.register(command3);
      
      manager.execute('cmd1');
      manager.execute('cmd2');
      manager.execute('cmd3');
      
      expect(executionOrder).toEqual(['cmd1', 'cmd2', 'cmd3']);
    });
    
    it('should handle command dependencies', () => {
      let state = 0;
      
      const incrementCommand: EditorCommand = {
        id: 'increment',
        name: 'Increment',
        execute: () => { state++; },
      };
      
      const doubleCommand: EditorCommand = {
        id: 'double',
        name: 'Double',
        execute: () => { state *= 2; },
        canExecute: () => state > 0,
      };
      
      manager.register(incrementCommand);
      manager.register(doubleCommand);
      
      // Double should fail (state = 0)
      expect(manager.execute('double')).toBe(false);
      expect(state).toBe(0);
      
      // Increment (state = 1)
      expect(manager.execute('increment')).toBe(true);
      expect(state).toBe(1);
      
      // Double should succeed (state = 2)
      expect(manager.execute('double')).toBe(true);
      expect(state).toBe(2);
    });
  });
  
  describe('Command Rollback', () => {
    it('should handle command execution failure', () => {
      const failingCommand: EditorCommand = {
        id: 'failing',
        name: 'Failing Command',
        execute: () => {
          throw new Error('Command failed');
        },
      };
      
      manager.register(failingCommand);
      
      // Should not throw, but return false
      expect(manager.execute('failing')).toBe(false);
    });
    
    it('should maintain state after failed command', () => {
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [{ type: 'plain', value: 'نص' }],
      };
      
      controller.addBlock(block);
      
      const failingCommand: EditorCommand = {
        id: 'failing',
        name: 'Failing Command',
        execute: (ctrl) => {
          ctrl.removeBlock('block-1');
          throw new Error('Failed after removal');
        },
      };
      
      manager.register(failingCommand);
      manager.execute('failing');
      
      // Block should still be removed (no automatic rollback)
      expect(controller.getBlock('block-1')).toBeUndefined();
    });
  });
  
  describe('Invalid Command Handling', () => {
    it('should handle non-existent command execution', () => {
      expect(manager.execute('non-existent')).toBe(false);
    });
    
    it('should handle command without controller', () => {
      const newManager = new CommandManager();
      
      const command: EditorCommand = {
        id: 'test',
        name: 'Test',
        execute: () => {},
      };
      
      newManager.register(command);
      expect(newManager.execute('test')).toBe(false);
    });
    
    it('should handle command with canExecute returning false', () => {
      const command: EditorCommand = {
        id: 'disabled',
        name: 'Disabled Command',
        execute: vi.fn(),
        canExecute: () => false,
      };
      
      manager.register(command);
      expect(manager.execute('disabled')).toBe(false);
      expect(command.execute).not.toHaveBeenCalled();
    });
  });
  
  describe('Command Priority', () => {
    it('should allow command overwriting', () => {
      let value = 0;
      
      const command1: EditorCommand = {
        id: 'test',
        name: 'Test 1',
        execute: () => { value = 1; },
      };
      
      const command2: EditorCommand = {
        id: 'test',
        name: 'Test 2',
        execute: () => { value = 2; },
      };
      
      manager.register(command1);
      manager.register(command2);
      
      manager.execute('test');
      expect(value).toBe(2);
    });
    
    it('should warn when overwriting commands', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const command1: EditorCommand = {
        id: 'test',
        name: 'Test 1',
        execute: () => {},
      };
      
      const command2: EditorCommand = {
        id: 'test',
        name: 'Test 2',
        execute: () => {},
      };
      
      manager.register(command1);
      manager.register(command2);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Overwriting command "test"')
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Command Conflicts', () => {
    it('should handle conflicting shortcuts', () => {
      const command1: EditorCommand = {
        id: 'cmd1',
        name: 'Command 1',
        shortcut: 'Ctrl+B',
        execute: vi.fn(),
      };
      
      const command2: EditorCommand = {
        id: 'cmd2',
        name: 'Command 2',
        shortcut: 'Ctrl+B',
        execute: vi.fn(),
      };
      
      manager.register(command1);
      manager.register(command2);
      
      // getByShortcut returns first match, not last
      const found = manager.getByShortcut('Ctrl+B');
      expect(found).toBeDefined();
      expect(['cmd1', 'cmd2']).toContain(found?.id);
    });
    
    it('should handle multiple commands with same shortcut', () => {
      const commands: EditorCommand[] = [];
      
      for (let i = 0; i < 5; i++) {
        commands.push({
          id: `cmd${i}`,
          name: `Command ${i}`,
          shortcut: 'Ctrl+X',
          execute: vi.fn(),
        });
      }
      
      commands.forEach(cmd => manager.register(cmd));
      
      // getByShortcut returns first match
      const found = manager.getByShortcut('Ctrl+X');
      expect(found).toBeDefined();
      expect(found?.shortcut).toBe('Ctrl+X');
    });
  });
  
  describe('Command History', () => {
    it('should track command execution order', () => {
      const executionLog: string[] = [];
      
      const commands: EditorCommand[] = [
        {
          id: 'add',
          name: 'Add',
          execute: () => executionLog.push('add'),
        },
        {
          id: 'remove',
          name: 'Remove',
          execute: () => executionLog.push('remove'),
        },
        {
          id: 'update',
          name: 'Update',
          execute: () => executionLog.push('update'),
        },
      ];
      
      commands.forEach(cmd => manager.register(cmd));
      
      manager.execute('add');
      manager.execute('update');
      manager.execute('remove');
      manager.execute('add');
      
      expect(executionLog).toEqual(['add', 'update', 'remove', 'add']);
    });
  });
  
  describe('Command Validation', () => {
    it('should validate command before execution', () => {
      let canExecuteCalled = false;
      let executeCalled = false;
      
      const command: EditorCommand = {
        id: 'validated',
        name: 'Validated Command',
        execute: () => { executeCalled = true; },
        canExecute: () => {
          canExecuteCalled = true;
          return false;
        },
      };
      
      manager.register(command);
      manager.execute('validated');
      
      expect(canExecuteCalled).toBe(true);
      expect(executeCalled).toBe(false);
    });
    
    it('should check canExecute with controller', () => {
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block);
      
      const command: EditorCommand = {
        id: 'needsBlock',
        name: 'Needs Block',
        execute: vi.fn(),
        canExecute: (ctrl) => ctrl.getBlocks().length > 1, // Need more than 1 (editor keeps at least 1)
      };
      
      manager.register(command);
      
      expect(manager.canExecute('needsBlock')).toBe(false); // Only 1 block
      
      // Add another block
      const block2: TextBlock = {
        id: 'block-2',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      controller.addBlock(block2);
      
      expect(manager.canExecute('needsBlock')).toBe(true); // Now 2 blocks
    });
  });
  
  describe('Command Performance', () => {
    it('should handle rapid command execution', () => {
      let counter = 0;
      
      const command: EditorCommand = {
        id: 'increment',
        name: 'Increment',
        execute: () => { counter++; },
      };
      
      manager.register(command);
      
      // Execute 1000 times
      for (let i = 0; i < 1000; i++) {
        manager.execute('increment');
      }
      
      expect(counter).toBe(1000);
    });
    
    it('should handle large number of registered commands', () => {
      // Register 100 commands
      for (let i = 0; i < 100; i++) {
        manager.register({
          id: `cmd${i}`,
          name: `Command ${i}`,
          execute: () => {},
        });
      }
      
      expect(manager.getAll()).toHaveLength(100);
      
      // Should still execute quickly
      expect(manager.execute('cmd50')).toBe(true);
      expect(manager.execute('cmd99')).toBe(true);
    });
  });
});
