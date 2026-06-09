/**
 * EditorController Advanced Tests
 * 
 * Tests for error recovery, complex scenarios, and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EditorController } from '../../src/core/EditorController';
import type { Block, TextBlock } from '../../src/types';

describe('EditorController - Advanced', () => {
  let controller: EditorController;
  
  beforeEach(() => {
    controller = new EditorController({
      initialBlocks: [],
      defaultDirection: 'rtl',
    });
  });
  
  describe('Error Recovery', () => {
    it('should recover from failed command execution', () => {
      const initialBlocks = controller.getBlocks();
      
      // Try to update non-existent block
      expect(() => {
        controller.updateBlock('non-existent-id', { direction: 'ltr' });
      }).not.toThrow();
      
      // State should remain unchanged
      expect(controller.getBlocks()).toEqual(initialBlocks);
    });
    
    it('should handle invalid block updates gracefully', () => {
      const block: TextBlock = {
        id: 'test-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block);
      
      // Try invalid update
      expect(() => {
        controller.updateBlock('test-1', { type: 'invalid-type' as any });
      }).not.toThrow();
      
      // Block should still exist
      expect(controller.getBlock('test-1')).toBeDefined();
    });
    
    it('should maintain state consistency after errors', () => {
      const block1: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      const block2: TextBlock = {
        id: 'block-2',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block1);
      controller.addBlock(block2);
      
      // Try to remove non-existent block
      controller.removeBlock('non-existent');
      
      // Both blocks should still exist
      expect(controller.getBlocks()).toHaveLength(2);
      expect(controller.getBlock('block-1')).toBeDefined();
      expect(controller.getBlock('block-2')).toBeDefined();
    });
  });
  
  describe('Complex Undo/Redo Scenarios', () => {
    it('should handle multiple undo operations', () => {
      const block1: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [{ type: 'plain', value: 'نص 1' }],
      };
      
      const block2: TextBlock = {
        id: 'block-2',
        type: 'paragraph',
        direction: 'rtl',
        content: [{ type: 'plain', value: 'نص 2' }],
      };
      
      controller.addBlock(block1);
      controller.addBlock(block2);
      
      expect(controller.getBlocks()).toHaveLength(2);
      
      // Undo twice
      controller.undo();
      expect(controller.getBlocks().length).toBeLessThanOrEqual(1);
      
      controller.undo();
      expect(controller.getBlocks().length).toBeLessThanOrEqual(1);
    });
    
    it('should handle redo after undo', () => {
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block);
      controller.undo();
      
      expect(controller.getBlocks()).toHaveLength(0);
      
      controller.redo();
      expect(controller.getBlocks()).toHaveLength(1);
    });
    
    it('should clear redo stack after new operation', () => {
      const block1: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      const block2: TextBlock = {
        id: 'block-2',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block1);
      controller.undo();
      
      // Add new block (should clear redo stack)
      controller.addBlock(block2);
      
      // Redo should not work
      controller.redo();
      expect(controller.getBlocks()).toHaveLength(1);
      expect(controller.getBlock('block-2')).toBeDefined();
    });
  });
  
  describe('Concurrent Operations', () => {
    it('should handle rapid block additions', () => {
      const blocks: TextBlock[] = [];
      
      for (let i = 0; i < 100; i++) {
        blocks.push({
          id: `block-${i}`,
          type: 'paragraph',
          direction: 'rtl',
          content: [{ type: 'plain', value: `نص ${i}` }],
        });
      }
      
      // Add all blocks rapidly
      blocks.forEach(block => controller.addBlock(block));
      
      expect(controller.getBlocks()).toHaveLength(100);
    });
    
    it('should handle rapid updates', () => {
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block);
      
      // Rapid updates
      for (let i = 0; i < 50; i++) {
        controller.updateBlock('block-1', {
          content: [{ type: 'plain', value: `نص ${i}` }],
        });
      }
      
      const updatedBlock = controller.getBlock('block-1') as TextBlock;
      expect(updatedBlock.content[0].value).toBe('نص 49');
    });
  });
  
  describe('Memory Management', () => {
    it('should cleanup removed blocks', () => {
      const blocks: TextBlock[] = [];
      
      for (let i = 0; i < 50; i++) {
        blocks.push({
          id: `block-${i}`,
          type: 'paragraph',
          direction: 'rtl',
          content: [],
        });
      }
      
      blocks.forEach(block => controller.addBlock(block));
      
      // Remove all blocks except the last one (editor keeps at least one block)
      for (let i = 0; i < blocks.length - 1; i++) {
        controller.removeBlock(blocks[i].id);
      }
      
      expect(controller.getBlocks().length).toBeLessThanOrEqual(1);
    });
    
    it('should handle large undo history', () => {
      // Add and remove many blocks
      for (let i = 0; i < 100; i++) {
        const block: TextBlock = {
          id: `block-${i}`,
          type: 'paragraph',
          direction: 'rtl',
          content: [],
        };
        
        controller.addBlock(block);
        controller.removeBlock(block.id);
      }
      
      // Should still be functional
      const newBlock: TextBlock = {
        id: 'final-block',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(newBlock);
      expect(controller.getBlock('final-block')).toBeDefined();
    });
  });
  
  describe('State Consistency', () => {
    it('should maintain block order after operations', () => {
      const block1: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [{ type: 'plain', value: 'أول' }],
      };
      
      const block2: TextBlock = {
        id: 'block-2',
        type: 'paragraph',
        direction: 'rtl',
        content: [{ type: 'plain', value: 'ثاني' }],
      };
      
      const block3: TextBlock = {
        id: 'block-3',
        type: 'paragraph',
        direction: 'rtl',
        content: [{ type: 'plain', value: 'ثالث' }],
      };
      
      controller.addBlock(block1);
      controller.addBlock(block2);
      controller.addBlock(block3);
      
      const blocks = controller.getBlocks();
      expect(blocks[0].id).toBe('block-1');
      expect(blocks[1].id).toBe('block-2');
      expect(blocks[2].id).toBe('block-3');
    });
    
    it('should maintain block references after updates', () => {
      const block: TextBlock = {
        id: 'block-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(block);
      
      controller.updateBlock('block-1', {
        content: [{ type: 'plain', value: 'محدث' }],
      });
      
      const updatedBlock = controller.getBlock('block-1') as TextBlock;
      expect(updatedBlock.id).toBe('block-1');
      expect(updatedBlock.content[0].value).toBe('محدث');
    });
    
    it('should handle block moves correctly', () => {
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
        {
          id: 'block-3',
          type: 'paragraph',
          direction: 'rtl',
          content: [{ type: 'plain', value: '3' }],
        },
      ];
      
      blocks.forEach(block => controller.addBlock(block));
      
      // Move block-3 to position 0
      controller.moveBlock('block-3', 0);
      
      const reorderedBlocks = controller.getBlocks();
      expect(reorderedBlocks[0].id).toBe('block-3');
      expect(reorderedBlocks[1].id).toBe('block-1');
      expect(reorderedBlocks[2].id).toBe('block-2');
    });
  });
});

