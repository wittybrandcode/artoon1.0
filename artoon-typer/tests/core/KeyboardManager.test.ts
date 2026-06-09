/**
 * KeyboardManager Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  KeyboardManager, 
  createKeyboardManager,
  type KeyboardShortcut,
} from '../../src/core/KeyboardManager';
import type { EditorControllerInterface, Block, SelectionState } from '../../src/types';

// Mock controller
function createMockController(): EditorControllerInterface {
  const blocks: Block[] = [
    { id: 'block-1', type: 'paragraph', direction: 'rtl', content: [] },
    { id: 'block-2', type: 'paragraph', direction: 'rtl', content: [] },
  ];
  
  let focusedBlockId: string | null = 'block-1';
  let selection: SelectionState | null = { blockId: 'block-1', anchorOffset: 0, focusOffset: 0, isCollapsed: true };
  
  return {
    getBlocks: () => blocks,
    getBlock: (id: string) => blocks.find(b => b.id === id),
    getFocusedBlock: () => blocks.find(b => b.id === focusedBlockId),
    addBlock: vi.fn(),
    removeBlock: vi.fn(),
    updateBlock: vi.fn(),
    moveBlock: vi.fn(),
    focusBlock: (id: string) => { focusedBlockId = id; },
    getSelection: () => selection,
    setSelection: (sel: SelectionState) => { selection = sel; },
    undo: vi.fn(),
    redo: vi.fn(),
  };
}

describe('KeyboardManager', () => {
  let controller: EditorControllerInterface;
  let manager: KeyboardManager;
  
  beforeEach(() => {
    controller = createMockController();
    manager = createKeyboardManager({ controller });
  });
  
  describe('constructor', () => {
    it('should create instance with controller', () => {
      expect(manager).toBeInstanceOf(KeyboardManager);
    });
    
    it('should register default shortcuts', () => {
      const shortcuts = manager.getShortcuts();
      expect(shortcuts.length).toBeGreaterThan(0);
    });
    
    it('should register custom shortcuts', () => {
      const customShortcut: KeyboardShortcut = {
        key: 'Ctrl+Shift+X',
        command: () => true,
        context: 'always',
        description: 'Custom',
      };
      
      const managerWithCustom = createKeyboardManager({
        controller,
        customShortcuts: [customShortcut],
      });
      
      expect(managerWithCustom.getShortcut('Ctrl+Shift+X')).toBeDefined();
    });
    
    it('should disable specified shortcuts', () => {
      const managerWithDisabled = createKeyboardManager({
        controller,
        disabledShortcuts: ['Ctrl+B'],
      });
      
      const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true });
      const result = managerWithDisabled.handleKeyDown(event);
      expect(result).toBe(false);
    });
  });
  
  describe('register', () => {
    it('should register new shortcut', () => {
      const shortcut: KeyboardShortcut = {
        key: 'Ctrl+Shift+T',
        command: () => true,
        context: 'always',
        description: 'Test',
      };
      
      manager.register(shortcut);
      expect(manager.getShortcut('Ctrl+Shift+T')).toBeDefined();
    });
    
    it('should normalize key format', () => {
      const shortcut: KeyboardShortcut = {
        key: 'ctrl+shift+t',
        command: () => true,
        context: 'always',
        description: 'Test',
      };
      
      manager.register(shortcut);
      expect(manager.getShortcut('Ctrl+Shift+T')).toBeDefined();
    });
    
    it('should handle cmd as Ctrl', () => {
      const shortcut: KeyboardShortcut = {
        key: 'Cmd+B',
        command: () => true,
        context: 'always',
        description: 'Test',
      };
      
      manager.register(shortcut);
      expect(manager.getShortcut('Ctrl+B')).toBeDefined();
    });
  });
  
  describe('unregister', () => {
    it('should remove shortcut', () => {
      manager.unregister('Ctrl+B');
      expect(manager.getShortcut('Ctrl+B')).toBeUndefined();
    });
  });
  
  describe('getShortcuts', () => {
    it('should return all shortcuts', () => {
      const shortcuts = manager.getShortcuts();
      expect(Array.isArray(shortcuts)).toBe(true);
    });
  });
  
  describe('getShortcut', () => {
    it('should return shortcut by key', () => {
      const shortcut = manager.getShortcut('Ctrl+B');
      expect(shortcut).toBeDefined();
      expect(shortcut?.description).toBe('Bold');
    });
    
    it('should return undefined for unknown key', () => {
      expect(manager.getShortcut('Ctrl+Shift+Unknown')).toBeUndefined();
    });
  });
  
  describe('setEnabled / isEnabled', () => {
    it('should enable/disable keyboard handling', () => {
      expect(manager.isEnabled()).toBe(true);
      
      manager.setEnabled(false);
      expect(manager.isEnabled()).toBe(false);
      
      manager.setEnabled(true);
      expect(manager.isEnabled()).toBe(true);
    });
    
    it('should not handle events when disabled', () => {
      manager.setEnabled(false);
      
      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      const result = manager.handleKeyDown(event);
      
      expect(result).toBe(false);
    });
  });
  
  describe('handleKeyDown', () => {
    it('should handle Ctrl+Z for undo', () => {
      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      const result = manager.handleKeyDown(event);
      
      expect(result).toBe(true);
      expect(controller.undo).toHaveBeenCalled();
    });
    
    it('should handle Ctrl+Y for redo', () => {
      const event = new KeyboardEvent('keydown', { key: 'y', ctrlKey: true });
      const result = manager.handleKeyDown(event);
      
      expect(result).toBe(true);
      expect(controller.redo).toHaveBeenCalled();
    });
    
    it('should return false for unknown shortcut', () => {
      const event = new KeyboardEvent('keydown', { key: 'q', ctrlKey: true });
      const result = manager.handleKeyDown(event);
      
      expect(result).toBe(false);
    });
    
    it('should handle Escape', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      const result = manager.handleKeyDown(event);
      
      expect(result).toBe(true);
    });
  });
  
  describe('default shortcuts', () => {
    it('should have Ctrl+B for bold', () => {
      const shortcut = manager.getShortcut('Ctrl+B');
      expect(shortcut).toBeDefined();
      expect(shortcut?.description).toBe('Bold');
    });
    
    it('should have Ctrl+I for italic', () => {
      const shortcut = manager.getShortcut('Ctrl+I');
      expect(shortcut).toBeDefined();
      expect(shortcut?.description).toBe('Italic');
    });
    
    it('should have Ctrl+U for underline', () => {
      const shortcut = manager.getShortcut('Ctrl+U');
      expect(shortcut).toBeDefined();
      expect(shortcut?.description).toBe('Underline');
    });
    
    it('should have Ctrl+Alt+1 for heading 1', () => {
      const shortcut = manager.getShortcut('Ctrl+Alt+1');
      expect(shortcut).toBeDefined();
      expect(shortcut?.description).toBe('Heading 1');
    });
    
    it('should have Ctrl+Alt+2 for heading 2', () => {
      const shortcut = manager.getShortcut('Ctrl+Alt+2');
      expect(shortcut).toBeDefined();
      expect(shortcut?.description).toBe('Heading 2');
    });
    
    it('should have Ctrl+D for duplicate', () => {
      const shortcut = manager.getShortcut('Ctrl+D');
      expect(shortcut).toBeDefined();
      expect(shortcut?.description).toBe('Duplicate Block');
    });
  });
  
  describe('context checking', () => {
    it('should execute always context shortcuts', () => {
      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      const result = manager.handleKeyDown(event);
      expect(result).toBe(true);
    });
    
    it('should check inBlock context', () => {
      const shortcut = manager.getShortcut('Ctrl+D');
      expect(shortcut?.context).toBe('inBlock');
    });
  });
});

describe('createKeyboardManager', () => {
  it('should create KeyboardManager instance', () => {
    const controller = createMockController();
    const manager = createKeyboardManager({ controller });
    expect(manager).toBeInstanceOf(KeyboardManager);
  });
});
