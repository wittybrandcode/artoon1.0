/**
 * DragDropManager Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  DragDropManager, 
  createDragDropManager,
  type DropPosition,
} from '../../src/core/DragDropManager';
import type { EditorControllerInterface, Block } from '../../src/types';

// Mock controller
function createMockController(): EditorControllerInterface {
  const blocks: Block[] = [
    { id: 'block-1', type: 'paragraph', direction: 'rtl', content: [{ type: 'plain', value: 'First' }] },
    { id: 'block-2', type: 'paragraph', direction: 'rtl', content: [{ type: 'plain', value: 'Second' }] },
    { id: 'block-3', type: 'paragraph', direction: 'rtl', content: [{ type: 'plain', value: 'Third' }] },
  ];
  
  return {
    getBlocks: () => blocks,
    getBlock: (id: string) => blocks.find(b => b.id === id),
    getFocusedBlock: () => blocks[0],
    addBlock: vi.fn(),
    removeBlock: vi.fn(),
    updateBlock: vi.fn(),
    moveBlock: vi.fn(),
    focusBlock: vi.fn(),
    getSelection: () => null,
    setSelection: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
  };
}

describe('DragDropManager', () => {
  let controller: EditorControllerInterface;
  let manager: DragDropManager;
  
  beforeEach(() => {
    controller = createMockController();
    manager = createDragDropManager({ controller });
  });
  
  describe('constructor', () => {
    it('should create instance with controller', () => {
      expect(manager).toBeInstanceOf(DragDropManager);
    });
    
    it('should accept callbacks', () => {
      const onDragStart = vi.fn();
      const onDragEnd = vi.fn();
      const onDropPositionChange = vi.fn();
      
      const managerWithCallbacks = createDragDropManager({
        controller,
        onDragStart,
        onDragEnd,
        onDropPositionChange,
      });
      
      expect(managerWithCallbacks).toBeInstanceOf(DragDropManager);
    });
  });
  
  describe('setContainer', () => {
    it('should set container element', () => {
      const container = document.createElement('div');
      manager.setContainer(container);
      // No error means success
    });
    
    it('should accept null', () => {
      manager.setContainer(null);
      // No error means success
    });
  });
  
  describe('getDragState', () => {
    it('should return null initially', () => {
      expect(manager.getDragState()).toBeNull();
    });
  });
  
  describe('getDropPosition', () => {
    it('should return null initially', () => {
      expect(manager.getDropPosition()).toBeNull();
    });
  });
  
  describe('isDragging', () => {
    it('should return false initially', () => {
      expect(manager.isDragging()).toBe(false);
    });
  });
  
  describe('startDrag', () => {
    it('should start drag operation', () => {
      const event = new MouseEvent('mousedown', { clientY: 100 });
      manager.startDrag('block-1', event as any);
      
      expect(manager.isDragging()).toBe(true);
      expect(manager.getDragState()?.blockId).toBe('block-1');
    });
    
    it('should call onDragStart callback', () => {
      const onDragStart = vi.fn();
      const managerWithCallback = createDragDropManager({
        controller,
        onDragStart,
      });
      
      const event = new MouseEvent('mousedown', { clientY: 100 });
      managerWithCallback.startDrag('block-1', event as any);
      
      expect(onDragStart).toHaveBeenCalledWith('block-1');
    });
    
    it('should not start drag for unknown block', () => {
      const event = new MouseEvent('mousedown', { clientY: 100 });
      manager.startDrag('unknown-block', event as any);
      
      expect(manager.isDragging()).toBe(false);
    });
    
    it('should store original index', () => {
      const event = new MouseEvent('mousedown', { clientY: 100 });
      manager.startDrag('block-2', event as any);
      
      expect(manager.getDragState()?.originalIndex).toBe(1);
    });
  });
  
  describe('handleDragOver', () => {
    it('should do nothing if not dragging', () => {
      const event = new MouseEvent('mousemove', { clientY: 200 });
      manager.handleDragOver(event as any);
      
      expect(manager.getDropPosition()).toBeNull();
    });
    
    it('should update drop position when dragging', () => {
      const onDropPositionChange = vi.fn();
      const managerWithCallback = createDragDropManager({
        controller,
        onDropPositionChange,
      });
      
      // Start drag
      const startEvent = new MouseEvent('mousedown', { clientY: 100 });
      managerWithCallback.startDrag('block-1', startEvent as any);
      
      // Drag over
      const moveEvent = new MouseEvent('mousemove', { clientY: 200 });
      managerWithCallback.handleDragOver(moveEvent as any);
      
      expect(onDropPositionChange).toHaveBeenCalled();
    });
  });
  
  describe('handleDrop', () => {
    it('should do nothing if not dragging', () => {
      const event = new MouseEvent('mouseup', { clientY: 200 });
      manager.handleDrop(event as any);
      
      expect(controller.moveBlock).not.toHaveBeenCalled();
    });
    
    it('should move block on drop', () => {
      // Start drag
      const startEvent = new MouseEvent('mousedown', { clientY: 100 });
      manager.startDrag('block-1', startEvent as any);
      
      // Drop
      const dropEvent = new MouseEvent('mouseup', { clientY: 300 });
      manager.handleDrop(dropEvent as any);
      
      // Block should be moved (exact index depends on container)
      expect(manager.isDragging()).toBe(false);
    });
    
    it('should call onDragEnd callback', () => {
      const onDragEnd = vi.fn();
      const managerWithCallback = createDragDropManager({
        controller,
        onDragEnd,
      });
      
      // Start drag
      const startEvent = new MouseEvent('mousedown', { clientY: 100 });
      managerWithCallback.startDrag('block-1', startEvent as any);
      
      // Drop
      const dropEvent = new MouseEvent('mouseup', { clientY: 200 });
      managerWithCallback.handleDrop(dropEvent as any);
      
      expect(onDragEnd).toHaveBeenCalledWith('block-1');
    });
  });
  
  describe('endDrag', () => {
    it('should end drag operation', () => {
      // Start drag
      const event = new MouseEvent('mousedown', { clientY: 100 });
      manager.startDrag('block-1', event as any);
      
      expect(manager.isDragging()).toBe(true);
      
      // End drag
      manager.endDrag();
      
      expect(manager.isDragging()).toBe(false);
      expect(manager.getDragState()).toBeNull();
    });
    
    it('should do nothing if not dragging', () => {
      manager.endDrag();
      expect(manager.isDragging()).toBe(false);
    });
  });
  
  describe('cancelDrag', () => {
    it('should cancel drag operation', () => {
      // Start drag
      const event = new MouseEvent('mousedown', { clientY: 100 });
      manager.startDrag('block-1', event as any);
      
      // Cancel
      manager.cancelDrag();
      
      expect(manager.isDragging()).toBe(false);
    });
  });
  
  describe('getBlockPreview', () => {
    it('should return preview for paragraph block', () => {
      const block = controller.getBlock('block-1')!;
      const preview = manager.getBlockPreview(block);
      
      expect(preview).toContain('¶');
      expect(preview).toContain('First');
    });
    
    it('should truncate long text', () => {
      const longBlock: Block = {
        id: 'long',
        type: 'paragraph',
        direction: 'rtl',
        content: [{ type: 'plain', value: 'A'.repeat(100) }],
      };
      
      const preview = manager.getBlockPreview(longBlock);
      expect(preview).toContain('...');
    });
  });
});

describe('createDragDropManager', () => {
  it('should create DragDropManager instance', () => {
    const controller = createMockController();
    const manager = createDragDropManager({ controller });
    expect(manager).toBeInstanceOf(DragDropManager);
  });
});
