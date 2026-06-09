/**
 * EditorController Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EditorController, createEditorController } from '../../src/core/EditorController';
import { getDefaultRegistry } from '../../src/core/BlockRegistry';
import type { Block, TextBlock, BlockDefinition, BlockEvent } from '../../src/types';

// Register default blocks for testing
const defaultBlocks: BlockDefinition[] = [
  {
    type: 'paragraph',
    name: 'Paragraph',
    nameAr: 'فقرة',
    icon: '📝',
    category: 'text',
    create: () => ({
      id: `p-${Date.now()}-${Math.random()}`,
      type: 'paragraph',
      direction: 'rtl',
      content: [],
    } as TextBlock),
    canConvertTo: ['heading1', 'heading2', 'quote'],
  },
  {
    type: 'heading1',
    name: 'Heading 1',
    nameAr: 'عنوان 1',
    icon: 'H1',
    category: 'text',
    create: () => ({
      id: `h1-${Date.now()}-${Math.random()}`,
      type: 'heading1',
      direction: 'rtl',
      content: [],
    } as TextBlock),
    canConvertTo: ['paragraph', 'heading2'],
  },
  {
    type: 'heading2',
    name: 'Heading 2',
    nameAr: 'عنوان 2',
    icon: 'H2',
    category: 'text',
    create: () => ({
      id: `h2-${Date.now()}-${Math.random()}`,
      type: 'heading2',
      direction: 'rtl',
      content: [],
    } as TextBlock),
    canConvertTo: ['paragraph', 'heading1'],
  },
  {
    type: 'quote',
    name: 'Quote',
    nameAr: 'اقتباس',
    icon: '❝',
    category: 'text',
    create: () => ({
      id: `q-${Date.now()}-${Math.random()}`,
      type: 'quote',
      direction: 'rtl',
      content: [],
    } as TextBlock),
    canConvertTo: ['paragraph'],
  },
];

describe('EditorController', () => {
  let controller: EditorController;

  beforeEach(() => {
    // Register default blocks
    const registry = getDefaultRegistry();
    registry.clear();
    registry.registerAll(defaultBlocks);
    
    controller = createEditorController();
  });

  describe('initialization', () => {
    it('should create with default empty paragraph', () => {
      const blocks = controller.getBlocks();
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('paragraph');
    });

    it('should create with initial blocks', () => {
      const initialBlocks: Block[] = [
        { id: 'p1', type: 'paragraph', direction: 'rtl', content: [{ type: 'plain', value: 'مرحبا' }] },
        { id: 'p2', type: 'paragraph', direction: 'rtl', content: [{ type: 'plain', value: 'عالم' }] },
      ];
      
      const ctrl = createEditorController({ initialBlocks });
      expect(ctrl.getBlocks()).toHaveLength(2);
    });

    it('should use default direction from config', () => {
      const ctrl = createEditorController({ defaultDirection: 'ltr' });
      const blocks = ctrl.getBlocks();
      expect(blocks[0].direction).toBe('ltr');
    });
  });

  describe('getBlocks / getBlock', () => {
    it('should return all blocks', () => {
      const blocks = controller.getBlocks();
      expect(Array.isArray(blocks)).toBe(true);
    });

    it('should return block by ID', () => {
      const blocks = controller.getBlocks();
      const block = controller.getBlock(blocks[0].id);
      expect(block).toBeDefined();
      expect(block?.id).toBe(blocks[0].id);
    });

    it('should return undefined for unknown ID', () => {
      expect(controller.getBlock('unknown')).toBeUndefined();
    });
  });

  describe('addBlock', () => {
    it('should add block at end', () => {
      const newBlock: TextBlock = {
        id: 'new-block',
        type: 'paragraph',
        direction: 'rtl',
        content: [{ type: 'plain', value: 'جديد' }],
      };
      
      controller.addBlock(newBlock);
      const blocks = controller.getBlocks();
      expect(blocks).toHaveLength(2);
      expect(blocks[1].id).toBe('new-block');
    });

    it('should add block at specific index', () => {
      const block1: TextBlock = { id: 'b1', type: 'paragraph', direction: 'rtl', content: [] };
      const block2: TextBlock = { id: 'b2', type: 'paragraph', direction: 'rtl', content: [] };
      
      controller.addBlock(block1);
      controller.addBlock(block2, 1); // Insert at index 1
      
      const blocks = controller.getBlocks();
      expect(blocks[1].id).toBe('b2');
    });

    it('should generate new ID if duplicate', () => {
      const blocks = controller.getBlocks();
      const existingId = blocks[0].id;
      
      const newBlock: TextBlock = {
        id: existingId, // Duplicate ID
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
      
      controller.addBlock(newBlock);
      const updatedBlocks = controller.getBlocks();
      expect(updatedBlocks[1].id).not.toBe(existingId);
    });
  });

  describe('removeBlock', () => {
    it('should remove block by ID', () => {
      const block: TextBlock = { id: 'to-remove', type: 'paragraph', direction: 'rtl', content: [] };
      controller.addBlock(block);
      
      controller.removeBlock('to-remove');
      expect(controller.getBlock('to-remove')).toBeUndefined();
    });

    it('should keep at least one block', () => {
      const blocks = controller.getBlocks();
      controller.removeBlock(blocks[0].id);
      
      expect(controller.getBlocks()).toHaveLength(1);
    });

    it('should do nothing for unknown ID', () => {
      const initialCount = controller.getBlocks().length;
      controller.removeBlock('unknown');
      expect(controller.getBlocks()).toHaveLength(initialCount);
    });
  });

  describe('updateBlock', () => {
    it('should update block properties', () => {
      const blocks = controller.getBlocks();
      const id = blocks[0].id;
      
      controller.updateBlock(id, { 
        content: [{ type: 'plain', value: 'محدث' }] 
      });
      
      const updated = controller.getBlock(id) as TextBlock;
      expect(updated.content[0]).toEqual({ type: 'plain', value: 'محدث' });
    });

    it('should preserve block ID', () => {
      const blocks = controller.getBlocks();
      const id = blocks[0].id;
      
      controller.updateBlock(id, { direction: 'ltr' });
      
      const updated = controller.getBlock(id);
      expect(updated?.id).toBe(id);
    });
  });

  describe('moveBlock', () => {
    beforeEach(() => {
      // Add more blocks
      controller.addBlock({ id: 'b1', type: 'paragraph', direction: 'rtl', content: [] } as TextBlock);
      controller.addBlock({ id: 'b2', type: 'paragraph', direction: 'rtl', content: [] } as TextBlock);
    });

    it('should move block to new position', () => {
      const blocks = controller.getBlocks();
      const firstId = blocks[0].id;
      
      controller.moveBlock(firstId, 2);
      
      const updated = controller.getBlocks();
      expect(updated[1].id).toBe(firstId);
    });

    it('should do nothing if same position', () => {
      const blocks = controller.getBlocks();
      const firstId = blocks[0].id;
      
      controller.moveBlock(firstId, 0);
      
      const updated = controller.getBlocks();
      expect(updated[0].id).toBe(firstId);
    });
  });

  describe('duplicateBlock', () => {
    it('should create a copy of the block', () => {
      const blocks = controller.getBlocks();
      const original = blocks[0];
      
      const duplicate = controller.duplicateBlock(original.id);
      
      expect(duplicate).toBeDefined();
      expect(duplicate?.id).not.toBe(original.id);
      expect(duplicate?.type).toBe(original.type);
    });

    it('should insert duplicate after original', () => {
      const blocks = controller.getBlocks();
      const originalId = blocks[0].id;
      
      controller.duplicateBlock(originalId);
      
      const updated = controller.getBlocks();
      expect(updated[0].id).toBe(originalId);
      expect(updated[1].type).toBe(blocks[0].type);
    });
  });

  describe('convertBlock', () => {
    it('should convert block to allowed type', () => {
      const blocks = controller.getBlocks();
      const id = blocks[0].id;
      
      controller.convertBlock(id, 'heading1');
      
      const converted = controller.getBlock(id);
      expect(converted?.type).toBe('heading1');
    });

    it('should preserve content when converting text blocks', () => {
      const blocks = controller.getBlocks();
      const id = blocks[0].id;
      
      controller.updateBlock(id, { 
        content: [{ type: 'plain', value: 'محتوى' }] 
      });
      
      controller.convertBlock(id, 'heading1');
      
      const converted = controller.getBlock(id) as TextBlock;
      expect(converted.content[0]).toEqual({ type: 'plain', value: 'محتوى' });
    });

    it('should preserve direction', () => {
      const blocks = controller.getBlocks();
      const id = blocks[0].id;
      
      controller.updateBlock(id, { direction: 'ltr' });
      controller.convertBlock(id, 'heading1');
      
      const converted = controller.getBlock(id);
      expect(converted?.direction).toBe('ltr');
    });
  });

  describe('toggleBlockDirection', () => {
    it('should toggle RTL to LTR', () => {
      const blocks = controller.getBlocks();
      const id = blocks[0].id;
      
      controller.toggleBlockDirection(id);
      
      const updated = controller.getBlock(id);
      expect(updated?.direction).toBe('ltr');
    });

    it('should toggle LTR to RTL', () => {
      const blocks = controller.getBlocks();
      const id = blocks[0].id;
      
      controller.updateBlock(id, { direction: 'ltr' });
      controller.toggleBlockDirection(id);
      
      const updated = controller.getBlock(id);
      expect(updated?.direction).toBe('rtl');
    });
  });

  describe('focus', () => {
    it('should focus a block', () => {
      const blocks = controller.getBlocks();
      controller.focusBlock(blocks[0].id);
      
      expect(controller.getFocusedBlock()?.id).toBe(blocks[0].id);
    });

    it('should focus next block', () => {
      controller.addBlock({ id: 'b1', type: 'paragraph', direction: 'rtl', content: [] } as TextBlock);
      
      const blocks = controller.getBlocks();
      controller.focusBlock(blocks[0].id);
      controller.focusNextBlock();
      
      expect(controller.getFocusedBlock()?.id).toBe(blocks[1].id);
    });

    it('should focus previous block', () => {
      controller.addBlock({ id: 'b1', type: 'paragraph', direction: 'rtl', content: [] } as TextBlock);
      
      const blocks = controller.getBlocks();
      controller.focusBlock(blocks[1].id);
      controller.focusPreviousBlock();
      
      expect(controller.getFocusedBlock()?.id).toBe(blocks[0].id);
    });
  });

  describe('undo / redo', () => {
    it('should undo changes', () => {
      const blocks = controller.getBlocks();
      const originalContent = (blocks[0] as TextBlock).content;
      
      controller.updateBlock(blocks[0].id, { 
        content: [{ type: 'plain', value: 'تغيير' }] 
      });
      
      controller.undo();
      
      const restored = controller.getBlock(blocks[0].id) as TextBlock;
      expect(restored.content).toEqual(originalContent);
    });

    it('should redo undone changes', () => {
      const blocks = controller.getBlocks();
      
      controller.updateBlock(blocks[0].id, { 
        content: [{ type: 'plain', value: 'تغيير' }] 
      });
      
      controller.undo();
      controller.redo();
      
      const restored = controller.getBlock(blocks[0].id) as TextBlock;
      expect(restored.content[0]).toEqual({ type: 'plain', value: 'تغيير' });
    });
  });

  describe('events', () => {
    it('should emit add event', () => {
      const handler = vi.fn();
      controller.on(handler);
      
      controller.addBlock({ id: 'new', type: 'paragraph', direction: 'rtl', content: [] } as TextBlock);
      
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        type: 'add',
        blockId: 'new',
      }));
    });

    it('should emit remove event', () => {
      const handler = vi.fn();
      controller.on(handler);
      
      controller.addBlock({ id: 'to-remove', type: 'paragraph', direction: 'rtl', content: [] } as TextBlock);
      handler.mockClear();
      
      controller.removeBlock('to-remove');
      
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        type: 'remove',
        blockId: 'to-remove',
      }));
    });

    it('should unsubscribe from events', () => {
      const handler = vi.fn();
      const unsubscribe = controller.on(handler);
      
      unsubscribe();
      controller.addBlock({ id: 'new', type: 'paragraph', direction: 'rtl', content: [] } as TextBlock);
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('getState', () => {
    it('should return complete editor state', () => {
      const state = controller.getState();
      
      expect(state).toHaveProperty('blocks');
      expect(state).toHaveProperty('focusedBlockId');
      expect(state).toHaveProperty('selection');
      expect(state).toHaveProperty('canUndo');
      expect(state).toHaveProperty('canRedo');
    });
  });
});
