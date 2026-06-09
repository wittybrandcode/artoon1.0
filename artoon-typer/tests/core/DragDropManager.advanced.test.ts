/**
 * DragDropManager Advanced Tests
 * 
 * Tests for invalid drop targets, drag cancel, and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DragDropManager, createDragDropManager } from '../../src/core/DragDropManager.js';
import { EditorController } from '../../src/core/EditorController.js';
import type { TextBlock } from '../../src/types';

describe('DragDropManager - Advanced', () => {
  let manager: DragDropManager;
  let controller: EditorController;
  let container: HTMLElement;
  
  beforeEach(() => {
    controller = new EditorController({
      initialBlocks: [],
      defaultDirection: 'rtl',
    });
    
    // Create mock container
    container = document.createElement('div');
    document.body.appendChild(container);
    
    manager = createDragDropManager({
      controller,
      container,
    });
  });
  
  afterEach(() => {
    document.body.removeChild(container);
  });
  
  describe('Invalid Drop Targets', () => {
    it('should handle drop on non-existent block', () => {
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block);
      
      // Try to drag non-existent block
      const dragEvent = new MouseEvent('mousedown', {
        clientY: 100,
      });
      
      manager.startDrag('non-existent', dragEvent);
      
      expect(manager.isDragging()).toBe(false);
    });
    
    it('should handle drop outside container', () => {
      const blocks: TextBlock[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          direction: 'rtl',
          content: [{ type: 'plain', value: '1' }],
        },
        {
          id: 'block-2',
          type: 'paragraph',
          direction: 'rtl',
          content: [{ type: 'plain', value: '2' }],
        },
      ];
      
      blocks.forEach(b => controller.addBlock(b));
      
      const dragEvent = new MouseEvent('mousedown', {
        clientY: 100,
      });
      
      manager.startDrag('block-1', dragEvent);
      
      // Drop far outside
      const dropEvent = new MouseEvent('mouseup', {
        clientY: 10000,
      });
      
      manager.handleDrop(dropEvent);
      
      // Should handle gracefully
      expect(manager.isDragging()).toBe(false);
    });
    
    it('should prevent drop on same position', () => {
      const blocks: TextBlock[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          direction: 'rtl',
          content: [{ type: 'plain', value: '1' }],
        },
        {
          id: 'block-2',
          type: 'paragraph',
          direction: 'rtl',
          content: [{ type: 'plain', value: '2' }],
        },
      ];
      
      blocks.forEach(b => controller.addBlock(b));
      
      const initialOrder = controller.getBlocks().map(b => b.id);
      
      const dragEvent = new MouseEvent('mousedown', {
        clientY: 100,
      });
      
      manager.startDrag('block-1', dragEvent);
      
      // Drop at same position
      const dropEvent = new MouseEvent('mouseup', {
        clientY: 100,
      });
      
      manager.handleDrop(dropEvent);
      
      // Order should not change
      const finalOrder = controller.getBlocks().map(b => b.id);
      expect(finalOrder).toEqual(initialOrder);
    });
  });
  
  describe('Drag Cancel Scenarios', () => {
    it('should cancel drag on Escape key', () => {
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block);
      
      const dragEvent = new MouseEvent('mousedown', {
        clientY: 100,
      });
      
      manager.startDrag('block-1', dragEvent);
      expect(manager.isDragging()).toBe(true);
      
      manager.cancelDrag();
      expect(manager.isDragging()).toBe(false);
    });
    
    it('should reset state after cancel', () => {
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block);
      
      const dragEvent = new MouseEvent('mousedown', {
        clientY: 100,
      });
      
      manager.startDrag('block-1', dragEvent);
      
      expect(manager.getDragState()).not.toBeNull();
      expect(manager.getDropPosition()).toBeNull();
      
      manager.cancelDrag();
      
      expect(manager.getDragState()).toBeNull();
      expect(manager.getDropPosition()).toBeNull();
    });
    
    it('should handle multiple cancel calls', () => {
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block);
      
      const dragEvent = new MouseEvent('mousedown', {
        clientY: 100,
      });
      
      manager.startDrag('block-1', dragEvent);
      
      // Cancel multiple times
      manager.cancelDrag();
      manager.cancelDrag();
      manager.cancelDrag();
      
      expect(manager.isDragging()).toBe(false);
    });
  });
  
  describe('Multiple Drag Operations', () => {
    it('should handle rapid drag start/end', () => {
      const blocks: TextBlock[] = [];
      
      for (let i = 0; i < 10; i++) {
        blocks.push({
          id: `block-${i}`,
          type: 'paragraph',
          direction: 'rtl',
          content: [{ type: 'plain', value: `${i}` }],
        });
      }
      
      blocks.forEach(b => controller.addBlock(b));
      
      // Rapid drag operations
      for (let i = 0; i < 10; i++) {
        const dragEvent = new MouseEvent('mousedown', {
          clientY: 100 + i * 10,
        });
        
        manager.startDrag(`block-${i}`, dragEvent);
        manager.endDrag();
      }
      
      expect(manager.isDragging()).toBe(false);
    });
    
    it('should handle overlapping drag attempts', () => {
      const blocks: TextBlock[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          direction: 'rtl',
          content: [],
        },
        {
          id: 'block-2',
          type: 'paragraph',
          direction: 'rtl',
          content: [],
        },
      ];
      
      blocks.forEach(b => controller.addBlock(b));
      
      const dragEvent1 = new MouseEvent('mousedown', {
        clientY: 100,
      });
      
      manager.startDrag('block-1', dragEvent1);
      
      // Try to start another drag without ending first
      const dragEvent2 = new MouseEvent('mousedown', {
        clientY: 200,
      });
      
      manager.startDrag('block-2', dragEvent2);
      
      // Should replace first drag
      const dragState = manager.getDragState();
      expect(dragState?.blockId).toBe('block-2');
    });
  });
  
  describe('Drag with Keyboard', () => {
    it('should support keyboard-initiated drag', () => {
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block);
      
      // Simulate keyboard drag (using mouse event as proxy)
      const mouseEvent = new MouseEvent('mousedown', {
        clientY: 100,
      });
      
      manager.startDrag('block-1', mouseEvent);
      expect(manager.isDragging()).toBe(true);
    });
    
    it('should handle touch events for mobile', () => {
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block);
      
      // Create touch event
      const touchEvent = new TouchEvent('touchstart', {
        touches: [
          {
            clientY: 100,
          } as Touch,
        ],
      });
      
      manager.startDrag('block-1', touchEvent);
      expect(manager.isDragging()).toBe(true);
    });
  });
  
  describe('Drag Performance', () => {
    it('should handle large number of blocks', () => {
      const blocks: TextBlock[] = [];
      
      // Create 100 blocks
      for (let i = 0; i < 100; i++) {
        blocks.push({
          id: `block-${i}`,
          type: 'paragraph',
          direction: 'rtl',
          content: [{ type: 'plain', value: `Block ${i}` }],
        });
      }
      
      blocks.forEach(b => controller.addBlock(b));
      
      const dragEvent = new MouseEvent('mousedown', {
        clientY: 100,
      });
      
      manager.startDrag('block-50', dragEvent);
      
      // Simulate drag over multiple positions
      for (let i = 0; i < 50; i++) {
        const overEvent = new MouseEvent('mousemove', {
          clientY: 100 + i * 5,
        });
        manager.handleDragOver(overEvent);
      }
      
      const dropEvent = new MouseEvent('mouseup', {
        clientY: 300,
      });
      
      manager.handleDrop(dropEvent);
      
      expect(manager.isDragging()).toBe(false);
    });
    
    it('should handle rapid drag over events', () => {
      const blocks: TextBlock[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          direction: 'rtl',
          content: [],
        },
        {
          id: 'block-2',
          type: 'paragraph',
          direction: 'rtl',
          content: [],
        },
      ];
      
      blocks.forEach(b => controller.addBlock(b));
      
      const dragEvent = new MouseEvent('mousedown', {
        clientY: 100,
      });
      
      manager.startDrag('block-1', dragEvent);
      
      // Simulate 100 rapid drag over events
      for (let i = 0; i < 100; i++) {
        const overEvent = new MouseEvent('mousemove', {
          clientY: 100 + i,
        });
        manager.handleDragOver(overEvent);
      }
      
      expect(manager.isDragging()).toBe(true);
    });
  });
  
  describe('Callbacks', () => {
    it('should call onDragStart callback', () => {
      const onDragStart = vi.fn();
      
      const callbackManager = createDragDropManager({
        controller,
        container,
        onDragStart,
      });
      
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block);
      
      const dragEvent = new MouseEvent('mousedown', {
        clientY: 100,
      });
      
      callbackManager.startDrag('block-1', dragEvent);
      
      expect(onDragStart).toHaveBeenCalledWith('block-1');
    });
    
    it('should call onDragEnd callback', () => {
      const onDragEnd = vi.fn();
      
      const callbackManager = createDragDropManager({
        controller,
        container,
        onDragEnd,
      });
      
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block);
      
      const dragEvent = new MouseEvent('mousedown', {
        clientY: 100,
      });
      
      callbackManager.startDrag('block-1', dragEvent);
      callbackManager.endDrag();
      
      expect(onDragEnd).toHaveBeenCalledWith('block-1');
    });
    
    it('should call onDropPositionChange callback', () => {
      const onDropPositionChange = vi.fn();
      
      const callbackManager = createDragDropManager({
        controller,
        container,
        onDropPositionChange,
      });
      
      const blocks: TextBlock[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          direction: 'rtl',
          content: [],
        },
        {
          id: 'block-2',
          type: 'paragraph',
          direction: 'rtl',
          content: [],
        },
      ];
      
      blocks.forEach(b => controller.addBlock(b));
      
      const dragEvent = new MouseEvent('mousedown', {
        clientY: 100,
      });
      
      callbackManager.startDrag('block-1', dragEvent);
      
      const overEvent = new MouseEvent('mousemove', {
        clientY: 200,
      });
      
      callbackManager.handleDragOver(overEvent);
      
      expect(onDropPositionChange).toHaveBeenCalled();
    });
  });
});

