/**
 * MarkManager Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MarkManager, createMarkManager } from '../../src/inline/MarkManager';
import type { InlineContent, PlainText, InlineComponent } from '@artoon/ast';

describe('MarkManager', () => {
  let manager: MarkManager;

  beforeEach(() => {
    manager = createMarkManager();
  });

  describe('getPlainText', () => {
    it('should extract plain text', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'مرحبا ' },
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'عالم' },
      ];
      
      expect(manager.getPlainText(content)).toBe('مرحبا عالم');
    });

    it('should handle empty content', () => {
      expect(manager.getPlainText([])).toBe('');
    });
  });

  describe('getLength', () => {
    it('should return correct length', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'مرحبا' }, // 5 chars
      ];
      
      expect(manager.getLength(content)).toBe(5);
    });

    it('should count formatted text', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'أ' },
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'ب' },
        { type: 'plain', value: 'ج' },
      ];
      
      expect(manager.getLength(content)).toBe(3);
    });
  });

  describe('applyMark', () => {
    it('should apply bold to plain text', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'مرحبا عالم' },
      ];
      
      const result = manager.applyMark(content, 0, 5, 'bold');
      
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('inline');
      expect((result[0] as InlineComponent).modifiers).toContain('s');
      expect((result[0] as InlineComponent).value).toBe('مرحبا');
    });

    it('should apply italic to middle of text', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'أبجد' },
      ];
      
      const result = manager.applyMark(content, 1, 3, 'italic');
      
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('plain');
      expect((result[0] as PlainText).value).toBe('أ');
      expect(result[1].type).toBe('inline');
      expect((result[1] as InlineComponent).modifiers).toContain('e');
      expect(result[2].type).toBe('plain');
    });

    it('should combine multiple marks', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'نص' },
      ];
      
      let result = manager.applyMark(content, 0, 2, 'bold');
      result = manager.applyMark(result, 0, 2, 'italic');
      
      expect(result).toHaveLength(1);
      expect((result[0] as InlineComponent).modifiers).toContain('s');
      expect((result[0] as InlineComponent).modifiers).toContain('e');
    });

    it('should not duplicate existing mark', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'عريض' },
      ];
      
      const result = manager.applyMark(content, 0, 4, 'bold');
      
      expect(result).toHaveLength(1);
      const mods = (result[0] as InlineComponent).modifiers!;
      expect(mods.filter(m => m === 's')).toHaveLength(1);
    });
  });

  describe('removeMark', () => {
    it('should remove bold from text', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'عريض' },
      ];
      
      const result = manager.removeMark(content, 0, 4, 'bold');
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('plain');
    });

    it('should remove only specified mark', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s', 'e'], attributes: {}, value: 'نص' },
      ];
      
      const result = manager.removeMark(content, 0, 2, 'bold');
      
      expect(result).toHaveLength(1);
      expect((result[0] as InlineComponent).modifiers).not.toContain('s');
      expect((result[0] as InlineComponent).modifiers).toContain('e');
    });

    it('should handle partial removal', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'أبجد' },
      ];
      
      const result = manager.removeMark(content, 1, 3, 'bold');
      
      expect(result).toHaveLength(3);
      expect((result[0] as InlineComponent).modifiers).toContain('s');
      expect(result[1].type).toBe('plain');
      expect((result[2] as InlineComponent).modifiers).toContain('s');
    });
  });

  describe('toggleMark', () => {
    it('should apply mark if not present', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'نص' },
      ];
      
      const result = manager.toggleMark(content, 0, 2, 'bold');
      
      expect((result[0] as InlineComponent).modifiers).toContain('s');
    });

    it('should remove mark if present everywhere', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'نص' },
      ];
      
      const result = manager.toggleMark(content, 0, 2, 'bold');
      
      expect(result[0].type).toBe('plain');
    });

    it('should apply mark if only partially present', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'أ' },
        { type: 'plain', value: 'ب' },
      ];
      
      const result = manager.toggleMark(content, 0, 2, 'bold');
      
      // Should apply to all since not all have it
      expect(manager.hasMarkInRange(result, 0, 2, 'bold')).toBe(true);
    });
  });

  describe('hasMarkInRange', () => {
    it('should return true when all chars have mark', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'عريض' },
      ];
      
      expect(manager.hasMarkInRange(content, 0, 4, 'bold')).toBe(true);
    });

    it('should return false when some chars lack mark', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'أ' },
        { type: 'plain', value: 'ب' },
      ];
      
      expect(manager.hasMarkInRange(content, 0, 2, 'bold')).toBe(false);
    });

    it('should return false for plain text', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'نص عادي' },
      ];
      
      expect(manager.hasMarkInRange(content, 0, 7, 'bold')).toBe(false);
    });
  });

  describe('hasMarkAnywhere', () => {
    it('should return true if any char has mark', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'أ' },
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'ب' },
        { type: 'plain', value: 'ج' },
      ];
      
      expect(manager.hasMarkAnywhere(content, 0, 3, 'bold')).toBe(true);
    });

    it('should return false if no char has mark', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'نص عادي' },
      ];
      
      expect(manager.hasMarkAnywhere(content, 0, 7, 'bold')).toBe(false);
    });
  });

  describe('getActiveMarks', () => {
    it('should return marks at position', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'أ' },
        { type: 'inline', modifiers: ['s', 'e'], attributes: {}, value: 'ب' },
      ];
      
      const marks = manager.getActiveMarks(content, 1);
      
      expect(marks).toContain('bold');
      expect(marks).toContain('italic');
    });

    it('should return empty for plain text', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'نص' },
      ];
      
      expect(manager.getActiveMarks(content, 0)).toHaveLength(0);
    });

    it('should return empty for out of bounds', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'نص' },
      ];
      
      expect(manager.getActiveMarks(content, 100)).toHaveLength(0);
    });
  });

  describe('getMarksInRange', () => {
    it('should return all marks in range', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'أ' },
        { type: 'inline', modifiers: ['e'], attributes: {}, value: 'ب' },
      ];
      
      const marks = manager.getMarksInRange(content, 0, 2);
      
      expect(marks).toContain('bold');
      expect(marks).toContain('italic');
    });
  });

  describe('insertText', () => {
    it('should insert text at position', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'أج' },
      ];
      
      const result = manager.insertText(content, 1, 'ب');
      
      expect(manager.getPlainText(result)).toBe('أبج');
    });

    it('should inherit marks when inserting', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'عريض' },
      ];
      
      const result = manager.insertText(content, 2, 'X', true);
      
      expect(manager.hasMarkInRange(result, 2, 3, 'bold')).toBe(true);
    });

    it('should not inherit marks when disabled', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'عريض' },
      ];
      
      const result = manager.insertText(content, 2, 'X', false);
      
      expect(manager.hasMarkInRange(result, 2, 3, 'bold')).toBe(false);
    });
  });

  describe('deleteRange', () => {
    it('should delete text in range', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'أبجد' },
      ];
      
      const result = manager.deleteRange(content, 1, 3);
      
      expect(manager.getPlainText(result)).toBe('أد');
    });

    it('should handle deletion across formatted regions', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'أ' },
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'ب' },
        { type: 'plain', value: 'ج' },
      ];
      
      const result = manager.deleteRange(content, 0, 2);
      
      expect(manager.getPlainText(result)).toBe('ج');
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const content: InlineContent[] = [];
      
      expect(manager.applyMark(content, 0, 0, 'bold')).toHaveLength(0);
      expect(manager.getLength(content)).toBe(0);
    });

    it('should handle out of bounds range', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'نص' },
      ];
      
      // Should not throw
      const result = manager.applyMark(content, 0, 100, 'bold');
      expect(result).toBeDefined();
    });

    it('should handle all mark types', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'نص' },
      ];
      
      const marks: Array<'bold' | 'italic' | 'underline' | 'strikethrough'> = [
        'bold', 'italic', 'underline', 'strikethrough'
      ];
      
      for (const mark of marks) {
        const result = manager.applyMark(content, 0, 2, mark);
        expect(manager.hasMarkInRange(result, 0, 2, mark)).toBe(true);
      }
    });
  });
});
