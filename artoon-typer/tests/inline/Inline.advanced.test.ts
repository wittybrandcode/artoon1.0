/**
 * Inline System Advanced Tests
 * 
 * Tests for complex mark combinations, nested marks, performance,
 * and edge cases in inline formatting
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MarkManager } from '../../src/inline/MarkManager.js';
import { InlineParser } from '../../src/inline/InlineParser.js';
import type { InlineContent } from '@artoon/ast';

describe('Inline System - Advanced', () => {
  let markManager: MarkManager;
  let parser: InlineParser;

  beforeEach(() => {
    markManager = new MarkManager();
    parser = new InlineParser();
  });

  describe('Complex Mark Combinations', () => {
    it('should handle multiple overlapping marks', () => {
      const content: readonly InlineContent[] = [
        { type: 'plain', value: 'نص عادي ' },
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'غامق' },
        { type: 'plain', value: ' نص عادي' },
      ];

      // Apply italic to entire range
      const result = markManager.applyMark(content, 0, 20, 'italic');

      // Check that bold is preserved and italic is added
      const boldPart = result.find(item =>
        item.type === 'inline' &&
        (item as any).value === 'غامق'
      );

      expect(boldPart).toBeDefined();
      if (boldPart && boldPart.type === 'inline') {
        expect((boldPart as any).modifiers).toContain('s');
        expect((boldPart as any).modifiers).toContain('e');
      }
    });

    it('should handle all mark types simultaneously', () => {
      const content: readonly InlineContent[] = [
        { type: 'plain', value: 'نص' },
      ];

      let result = content;
      result = markManager.applyMark(result, 0, 3, 'bold');
      result = markManager.applyMark(result, 0, 3, 'italic');
      result = markManager.applyMark(result, 0, 3, 'underline');
      result = markManager.applyMark(result, 0, 3, 'strikethrough');

      const marks = markManager.getActiveMarks(result, 0);
      expect(marks).toContain('bold');
      expect(marks).toContain('italic');
      expect(marks).toContain('underline');
      expect(marks).toContain('strikethrough');
    });

    it('should handle partial mark removal from complex formatting', () => {
      const content: readonly InlineContent[] = [
        {
          type: 'inline',
          modifiers: ['s', 'e', 'u'],
          attributes: {},
          value: 'نص منسق'
        },
      ];

      // Remove only italic
      const result = markManager.removeMark(content, 0, 8, 'italic');

      const marks = markManager.getActiveMarks(result, 0);
      expect(marks).toContain('bold');
      expect(marks).toContain('underline');
      expect(marks).not.toContain('italic');
    });
  });

  describe('Nested Marks', () => {
    it('should handle marks within marks', () => {
      const html = '<strong>نص <em>غامق ومائل</em> غامق فقط</strong>';
      const content = parser.parse(html);

      expect(content.length).toBeGreaterThan(0);

      // Check that nested part has both marks
      const nestedPart = content.find(item => {
        if (item.type === 'inline') {
          const inline = item as any;
          return inline.modifiers?.includes('s') && inline.modifiers?.includes('e');
        }
        return false;
      });

      expect(nestedPart).toBeDefined();
    });

    it('should handle deeply nested HTML', () => {
      const html = '<strong><em><u><del>نص منسق جداً</del></u></em></strong>';
      const content = parser.parse(html);

      expect(content.length).toBeGreaterThan(0);

      const item = content[0];
      if (item.type === 'inline') {
        const modifiers = (item as any).modifiers || [];
        expect(modifiers.length).toBe(4);
      }
    });

    it('should handle marks across multiple text nodes', () => {
      const content: readonly InlineContent[] = [
        { type: 'plain', value: 'نص ' },
        { type: 'plain', value: 'عادي ' },
        { type: 'plain', value: 'متعدد' },
      ];

      // Apply bold to entire range
      const result = markManager.applyMark(content, 0, 15, 'bold');

      // All parts should be bold
      result.forEach(item => {
        if (item.type === 'inline') {
          expect((item as any).modifiers).toContain('s');
        }
      });
    });
  });

  describe('Mark Toggle Behavior', () => {
    it('should toggle mark on and off', () => {
      const content: readonly InlineContent[] = [
        { type: 'plain', value: 'نص' },
      ];

      // Toggle on
      let result = markManager.toggleMark(content, 0, 3, 'bold');
      expect(markManager.hasMarkInRange(result, 0, 3, 'bold')).toBe(true);

      // Toggle off
      result = markManager.toggleMark(result, 0, 3, 'bold');
      expect(markManager.hasMarkInRange(result, 0, 3, 'bold')).toBe(false);
    });

    it('should toggle mark in partial selection', () => {
      const content: readonly InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'نص غامق' },
      ];

      // Toggle bold off in middle
      const result = markManager.toggleMark(content, 2, 5, 'bold');

      // Start should still be bold
      expect(markManager.hasMarkInRange(result, 0, 2, 'bold')).toBe(true);
      // Middle should not be bold
      expect(markManager.hasMarkInRange(result, 2, 5, 'bold')).toBe(false);
      // End should still be bold
      expect(markManager.hasMarkInRange(result, 5, 8, 'bold')).toBe(true);
    });
  });

  describe('Text Insertion with Marks', () => {
    it('should inherit marks when inserting text', () => {
      const content: readonly InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'نص' },
      ];

      // Insert text in middle (should inherit bold)
      const result = markManager.insertText(content, 2, 'جديد', true);

      // Check that inserted text has bold mark
      const marks = markManager.getActiveMarks(result, 3);
      expect(marks).toContain('bold');
    });

    it('should not inherit marks when disabled', () => {
      const content: readonly InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'نص' },
      ];

      // Insert text without inheriting marks
      const result = markManager.insertText(content, 2, 'جديد', false);

      // Inserted text should not have marks
      const plainText = result.find(item =>
        item.type === 'plain' && (item as any).value.includes('جديد')
      );
      expect(plainText).toBeDefined();
    });
  });

  describe('Text Deletion with Marks', () => {
    it('should preserve marks after deletion', () => {
      const content: readonly InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'نص طويل' },
      ];

      // Delete middle part
      const result = markManager.deleteRange(content, 2, 5);

      // Remaining text should still be bold
      const marks = markManager.getActiveMarks(result, 0);
      expect(marks).toContain('bold');
    });

    it('should handle deletion of entire marked range', () => {
      const content: readonly InlineContent[] = [
        { type: 'plain', value: 'نص ' },
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'غامق' },
        { type: 'plain', value: ' نص' },
      ];

      // Delete the bold part
      const result = markManager.deleteRange(content, 4, 8);

      // Should only have plain text left
      const plainText = markManager.getPlainText(result);
      expect(plainText).not.toContain('غامق');
    });
  });

  describe('HTML Parsing Edge Cases', () => {
    it('should handle empty HTML', () => {
      const content = parser.parse('');
      expect(content).toEqual([]);
    });

    it('should handle HTML with only whitespace', () => {
      const content = parser.parse('   \n\t   ');
      // Whitespace-only HTML may return empty array or whitespace text
      expect(Array.isArray(content)).toBe(true);
    });

    it('should handle malformed HTML', () => {
      const html = '<strong>نص <em>غير مغلق';
      expect(() => parser.parse(html)).not.toThrow();
    });

    it('should handle HTML entities', () => {
      const html = 'نص مع &lt; و &gt; و &amp;';
      const content = parser.parse(html);

      const text = markManager.getPlainText(content);
      expect(text).toContain('<');
      expect(text).toContain('>');
      expect(text).toContain('&');
    });

    it('should handle special Unicode characters', () => {
      const html = 'نص مع رموز: ™ © ® ✓ ✗ ★ ☆ ♥ ♦';
      const content = parser.parse(html);

      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle large text with many marks efficiently', () => {
      // Create large content
      const text = 'نص '.repeat(1000);
      const content: readonly InlineContent[] = [
        { type: 'plain', value: text },
      ];

      const start = performance.now();

      // Apply marks to entire range
      let result = content;
      result = markManager.applyMark(result, 0, text.length, 'bold');
      result = markManager.applyMark(result, 0, text.length, 'italic');

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(250); // Should complete in < 250ms
    });

    it('should handle many mark operations efficiently', () => {
      const content: readonly InlineContent[] = [
        { type: 'plain', value: 'نص طويل جداً '.repeat(100) },
      ];

      const start = performance.now();

      // Perform 100 mark operations
      let result = content;
      for (let i = 0; i < 100; i++) {
        const from = i * 10;
        const to = from + 5;
        result = markManager.applyMark(result, from, to, 'bold');
      }

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(200); // Should complete in < 200ms
    });

    it('should handle complex HTML parsing efficiently', () => {
      // Generate complex HTML
      let html = '';
      for (let i = 0; i < 100; i++) {
        html += `<strong>نص ${i}</strong> <em>مائل ${i}</em> `;
      }

      const start = performance.now();
      const content = parser.parse(html);
      const duration = performance.now() - start;

      expect(content.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(250); // Should complete in < 250ms
    });
  });
});
