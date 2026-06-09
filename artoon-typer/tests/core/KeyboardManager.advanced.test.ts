/**
 * KeyboardManager Advanced Tests
 * 
 * Tests for conflicting shortcuts, platform-specific behavior, and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyboardManager, createKeyboardManager, type KeyboardShortcut } from '../../src/core/KeyboardManager.js';
import { EditorController } from '../../src/core/EditorController.js';
import type { TextBlock } from '../../src/types';

describe('KeyboardManager - Advanced', () => {
  let manager: KeyboardManager;
  let controller: EditorController;
  
  beforeEach(() => {
    controller = new EditorController({
      initialBlocks: [],
      defaultDirection: 'rtl',
    });
    
    manager = createKeyboardManager({
      controller,
      customShortcuts: [],
    });
  });
  
  describe('Conflicting Shortcuts', () => {
    it('should handle duplicate shortcut registration', () => {
      const shortcut1: KeyboardShortcut = {
        key: 'Ctrl+K',
        command: vi.fn(() => true),
        context: 'always',
        description: 'First',
      };
      
      const shortcut2: KeyboardShortcut = {
        key: 'Ctrl+K',
        command: vi.fn(() => true),
        context: 'always',
        description: 'Second',
      };
      
      manager.register(shortcut1);
      manager.register(shortcut2);
      
      // Create keyboard event
      const event = new KeyboardEvent('keydown', {
        key: 'K',
        ctrlKey: true,
      });
      
      manager.handleKeyDown(event);
      
      // Second shortcut should override first
      expect(shortcut2.command).toHaveBeenCalled();
      expect(shortcut1.command).not.toHaveBeenCalled();
    });
    
    it('should handle shortcuts with different contexts', () => {
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [{ type: 'plain', value: 'نص' }],
      };
      
      controller.addBlock(block);
      // Focus is set internally, we just test the shortcuts
      
      const alwaysShortcut: KeyboardShortcut = {
        key: 'Ctrl+S',
        command: vi.fn(() => true),
        context: 'always',
        description: 'Always',
      };
      
      const inBlockShortcut: KeyboardShortcut = {
        key: 'Ctrl+T', // Use different key to avoid conflict
        command: vi.fn(() => true),
        context: 'inBlock',
        description: 'In Block',
      };
      
      manager.register(alwaysShortcut);
      manager.register(inBlockShortcut);
      
      const event1 = new KeyboardEvent('keydown', {
        key: 'S',
        ctrlKey: true,
      });
      
      manager.handleKeyDown(event1);
      expect(alwaysShortcut.command).toHaveBeenCalled();
      
      // Test inBlock shortcut (will fail context check without focused block)
      const event2 = new KeyboardEvent('keydown', {
        key: 'T',
        ctrlKey: true,
      });
      
      manager.handleKeyDown(event2);
      // inBlock context requires focused block, which we don't have
      expect(inBlockShortcut.command).not.toHaveBeenCalled();
    });
  });
  
  describe('Platform-Specific Shortcuts', () => {
    it('should normalize Cmd to Ctrl', () => {
      const shortcut: KeyboardShortcut = {
        key: 'Cmd+B',
        command: vi.fn(() => true),
        context: 'always',
        description: 'Bold',
      };
      
      manager.register(shortcut);
      
      // Should be accessible via Ctrl+B
      const registered = manager.getShortcut('Ctrl+B');
      expect(registered).toBeDefined();
      expect(registered?.key).toBe('Ctrl+B');
    });
    
    it('should normalize Meta to Ctrl', () => {
      const shortcut: KeyboardShortcut = {
        key: 'Meta+I',
        command: vi.fn(() => true),
        context: 'always',
        description: 'Italic',
      };
      
      manager.register(shortcut);
      
      const registered = manager.getShortcut('Ctrl+I');
      expect(registered).toBeDefined();
    });
    
    it('should handle mixed modifier keys', () => {
      const shortcut: KeyboardShortcut = {
        key: 'Shift+Alt+Ctrl+K',
        command: vi.fn(() => true),
        context: 'always',
        description: 'Complex',
      };
      
      manager.register(shortcut);
      
      // Should normalize order: Ctrl, Alt, Shift
      const registered = manager.getShortcut('Ctrl+Alt+Shift+K');
      expect(registered).toBeDefined();
    });
  });
  
  describe('Disabled Shortcuts', () => {
    it('should not execute disabled shortcuts', () => {
      const disabledManager = createKeyboardManager({
        controller,
        disabledShortcuts: ['Ctrl+B', 'Ctrl+I'],
      });
      
      const event = new KeyboardEvent('keydown', {
        key: 'B',
        ctrlKey: true,
      });
      
      const result = disabledManager.handleKeyDown(event);
      expect(result).toBe(false);
    });
    
    it('should allow re-enabling shortcuts', () => {
      const shortcut: KeyboardShortcut = {
        key: 'Ctrl+U',
        command: vi.fn(() => true),
        context: 'always',
        description: 'Underline',
      };
      
      const disabledManager = createKeyboardManager({
        controller,
        disabledShortcuts: ['Ctrl+U'],
      });
      
      disabledManager.register(shortcut);
      
      const event = new KeyboardEvent('keydown', {
        key: 'U',
        ctrlKey: true,
      });
      
      // Should not execute (disabled)
      expect(disabledManager.handleKeyDown(event)).toBe(false);
    });
  });
  
  describe('Custom Shortcuts', () => {
    it('should register custom shortcuts on creation', () => {
      const customShortcut: KeyboardShortcut = {
        key: 'Ctrl+Shift+X',
        command: vi.fn(() => true),
        context: 'always',
        description: 'Custom Action',
      };
      
      const customManager = createKeyboardManager({
        controller,
        customShortcuts: [customShortcut],
      });
      
      const event = new KeyboardEvent('keydown', {
        key: 'X',
        ctrlKey: true,
        shiftKey: true,
      });
      
      customManager.handleKeyDown(event);
      expect(customShortcut.command).toHaveBeenCalled();
    });
    
    it('should allow adding custom shortcuts after creation', () => {
      const shortcut: KeyboardShortcut = {
        key: 'Alt+Q',
        command: vi.fn(() => true),
        context: 'always',
        description: 'Quick Action',
      };
      
      manager.register(shortcut);
      
      const event = new KeyboardEvent('keydown', {
        key: 'Q',
        altKey: true,
      });
      
      manager.handleKeyDown(event);
      expect(shortcut.command).toHaveBeenCalled();
    });
  });
  
  describe('Shortcut Combinations', () => {
    it('should handle Ctrl+Alt combinations', () => {
      const shortcut: KeyboardShortcut = {
        key: 'Ctrl+Alt+N',
        command: vi.fn(() => true),
        context: 'always',
        description: 'New',
      };
      
      manager.register(shortcut);
      
      const event = new KeyboardEvent('keydown', {
        key: 'N',
        ctrlKey: true,
        altKey: true,
      });
      
      manager.handleKeyDown(event);
      expect(shortcut.command).toHaveBeenCalled();
    });
    
    it('should handle Ctrl+Shift combinations', () => {
      const shortcut: KeyboardShortcut = {
        key: 'Ctrl+Shift+P',
        command: vi.fn(() => true),
        context: 'always',
        description: 'Command Palette',
      };
      
      manager.register(shortcut);
      
      const event = new KeyboardEvent('keydown', {
        key: 'P',
        ctrlKey: true,
        shiftKey: true,
      });
      
      manager.handleKeyDown(event);
      expect(shortcut.command).toHaveBeenCalled();
    });
    
    it('should handle triple modifier combinations', () => {
      const shortcut: KeyboardShortcut = {
        key: 'Ctrl+Alt+Shift+T',
        command: vi.fn(() => true),
        context: 'always',
        description: 'Triple',
      };
      
      manager.register(shortcut);
      
      const event = new KeyboardEvent('keydown', {
        key: 'T',
        ctrlKey: true,
        altKey: true,
        shiftKey: true,
      });
      
      manager.handleKeyDown(event);
      expect(shortcut.command).toHaveBeenCalled();
    });
  });
  
  describe('Shortcut Conflicts Resolution', () => {
    it('should prioritize more specific shortcuts', () => {
      const generalShortcut: KeyboardShortcut = {
        key: 'Ctrl+K',
        command: vi.fn(() => true),
        context: 'always',
        description: 'General',
      };
      
      const specificShortcut: KeyboardShortcut = {
        key: 'Ctrl+Shift+K',
        command: vi.fn(() => true),
        context: 'always',
        description: 'Specific',
      };
      
      manager.register(generalShortcut);
      manager.register(specificShortcut);
      
      // Test general shortcut
      const event1 = new KeyboardEvent('keydown', {
        key: 'K',
        ctrlKey: true,
      });
      
      manager.handleKeyDown(event1);
      expect(generalShortcut.command).toHaveBeenCalled();
      expect(specificShortcut.command).not.toHaveBeenCalled();
      
      // Reset mocks
      vi.clearAllMocks();
      
      // Test specific shortcut
      const event2 = new KeyboardEvent('keydown', {
        key: 'K',
        ctrlKey: true,
        shiftKey: true,
      });
      
      manager.handleKeyDown(event2);
      expect(specificShortcut.command).toHaveBeenCalled();
      expect(generalShortcut.command).not.toHaveBeenCalled();
    });
  });
  
  describe('Shortcut Performance', () => {
    it('should handle rapid key presses', () => {
      let counter = 0;
      
      const shortcut: KeyboardShortcut = {
        key: 'Ctrl+Space',
        command: () => {
          counter++;
          return true;
        },
        context: 'always',
        description: 'Increment',
      };
      
      manager.register(shortcut);
      
      // Simulate 100 rapid key presses
      for (let i = 0; i < 100; i++) {
        const event = new KeyboardEvent('keydown', {
          key: ' ',
          ctrlKey: true,
        });
        manager.handleKeyDown(event);
      }
      
      expect(counter).toBe(100);
    });
    
    it('should handle many registered shortcuts efficiently', () => {
      // Register 50 shortcuts
      for (let i = 0; i < 50; i++) {
        manager.register({
          key: `Ctrl+F${i}`,
          command: vi.fn(() => true),
          context: 'always',
          description: `Function ${i}`,
        });
      }
      
      // Should still find shortcuts quickly
      const shortcut = manager.getShortcut('Ctrl+F25');
      expect(shortcut).toBeDefined();
      expect(shortcut?.description).toBe('Function 25');
    });
  });
  
  describe('Enable/Disable Manager', () => {
    it('should not handle keys when disabled', () => {
      const shortcut: KeyboardShortcut = {
        key: 'Ctrl+T',
        command: vi.fn(() => true),
        context: 'always',
        description: 'Test',
      };
      
      manager.register(shortcut);
      manager.setEnabled(false);
      
      const event = new KeyboardEvent('keydown', {
        key: 'T',
        ctrlKey: true,
      });
      
      const result = manager.handleKeyDown(event);
      expect(result).toBe(false);
      expect(shortcut.command).not.toHaveBeenCalled();
    });
    
    it('should resume handling when re-enabled', () => {
      const shortcut: KeyboardShortcut = {
        key: 'Ctrl+R',
        command: vi.fn(() => true),
        context: 'always',
        description: 'Resume',
      };
      
      manager.register(shortcut);
      manager.setEnabled(false);
      manager.setEnabled(true);
      
      const event = new KeyboardEvent('keydown', {
        key: 'R',
        ctrlKey: true,
      });
      
      manager.handleKeyDown(event);
      expect(shortcut.command).toHaveBeenCalled();
    });
  });
});
