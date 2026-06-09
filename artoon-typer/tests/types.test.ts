/**
 * Types Test
 * 
 * Verifies that type definitions are correct and compatible with AST.
 */

import { describe, it, expect } from 'vitest';
import type { 
  Block, 
  TextBlock, 
  ListBlock, 
  BlockType,
  MarkType,
} from '../src/types';
import { MARK_TO_MODIFIER, MODIFIER_TO_MARK } from '../src/types';

describe('Types', () => {
  describe('BlockType', () => {
    it('should include all text block types', () => {
      const textTypes: BlockType[] = [
        'paragraph',
        'heading1',
        'heading2',
        'heading3',
        'heading4',
        'heading5',
        'heading6',
        'quote',
      ];
      expect(textTypes).toHaveLength(8);
    });

    it('should include list block types', () => {
      const listTypes: BlockType[] = ['bullet-list', 'numbered-list'];
      expect(listTypes).toHaveLength(2);
    });

    it('should include media block types', () => {
      const mediaTypes: BlockType[] = ['image', 'video', 'audio'];
      expect(mediaTypes).toHaveLength(3);
    });

    it('should include other block types', () => {
      const otherTypes: BlockType[] = ['code', 'table', 'divider'];
      expect(otherTypes).toHaveLength(3);
    });
  });

  describe('MarkType', () => {
    it('should include all mark types', () => {
      const markTypes: MarkType[] = [
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'code',
        'link',
        'mark',
        'sub',
        'sup',
      ];
      expect(markTypes).toHaveLength(9);
    });
  });

  describe('MARK_TO_MODIFIER mapping', () => {
    it('should map bold to s (strong)', () => {
      expect(MARK_TO_MODIFIER.bold).toBe('s');
    });

    it('should map italic to e (emphasis)', () => {
      expect(MARK_TO_MODIFIER.italic).toBe('e');
    });

    it('should map underline to u', () => {
      expect(MARK_TO_MODIFIER.underline).toBe('u');
    });

    it('should map strikethrough to d (deleted)', () => {
      expect(MARK_TO_MODIFIER.strikethrough).toBe('d');
    });

    it('should map code to null (handled separately)', () => {
      expect(MARK_TO_MODIFIER.code).toBeNull();
    });

    it('should map link to null (handled separately)', () => {
      expect(MARK_TO_MODIFIER.link).toBeNull();
    });
  });

  describe('MODIFIER_TO_MARK mapping', () => {
    it('should map s to bold', () => {
      expect(MODIFIER_TO_MARK.s).toBe('bold');
    });

    it('should map e to italic', () => {
      expect(MODIFIER_TO_MARK.e).toBe('italic');
    });

    it('should map u to underline', () => {
      expect(MODIFIER_TO_MARK.u).toBe('underline');
    });

    it('should map d to strikethrough', () => {
      expect(MODIFIER_TO_MARK.d).toBe('strikethrough');
    });
  });

  describe('Block interfaces', () => {
    it('should create a valid TextBlock', () => {
      const block: TextBlock = {
        id: 'test-1',
        type: 'paragraph',
        direction: 'rtl',
        content: [{ type: 'plain', value: 'مرحبا' }],
      };
      
      expect(block.id).toBe('test-1');
      expect(block.type).toBe('paragraph');
      expect(block.direction).toBe('rtl');
      expect(block.content).toHaveLength(1);
    });

    it('should create a valid ListBlock', () => {
      const block: ListBlock = {
        id: 'test-2',
        type: 'bullet-list',
        direction: 'rtl',
        items: [
          {
            id: 'item-1',
            content: [{ type: 'plain', value: 'عنصر أول' }],
          },
          {
            id: 'item-2',
            content: [{ type: 'plain', value: 'عنصر ثاني' }],
          },
        ],
      };
      
      expect(block.id).toBe('test-2');
      expect(block.type).toBe('bullet-list');
      expect(block.items).toHaveLength(2);
    });
  });
});
