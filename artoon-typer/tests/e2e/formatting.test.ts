/**
 * E2E Tests - Formatting
 * 
 * Tests for inline formatting functionality.
 */

import { describe, it, expect, vi } from 'vitest';

describe('E2E: Formatting', () => {
  describe('Inline Rendering', () => {
    it('should render plain text', async () => {
      const { createInlineRenderer } = await import('../../src/inline/InlineRenderer');
      const renderer = createInlineRenderer();
      
      const html = renderer.render([{ type: 'plain', value: 'Hello' }]);
      expect(html).toBe('Hello');
    });
    
    it('should render bold text', async () => {
      const { createInlineRenderer } = await import('../../src/inline/InlineRenderer');
      const renderer = createInlineRenderer();
      
      const html = renderer.render([{
        type: 'inline',
        modifiers: ['s'],
        attributes: {},
        value: 'Bold',
      }]);
      
      expect(html).toContain('<strong>');
      expect(html).toContain('Bold');
    });
    
    it('should render italic text', async () => {
      const { createInlineRenderer } = await import('../../src/inline/InlineRenderer');
      const renderer = createInlineRenderer();
      
      const html = renderer.render([{
        type: 'inline',
        modifiers: ['e'],
        attributes: {},
        value: 'Italic',
      }]);
      
      expect(html).toContain('<em>');
    });
    
    it('should render underlined text', async () => {
      const { createInlineRenderer } = await import('../../src/inline/InlineRenderer');
      const renderer = createInlineRenderer();
      
      const html = renderer.render([{
        type: 'inline',
        modifiers: ['u'],
        attributes: {},
        value: 'Underline',
      }]);
      
      expect(html).toContain('<u>');
    });
    
    it('should render strikethrough text', async () => {
      const { createInlineRenderer } = await import('../../src/inline/InlineRenderer');
      const renderer = createInlineRenderer();
      
      const html = renderer.render([{
        type: 'inline',
        modifiers: ['d'],
        attributes: {},
        value: 'Strike',
      }]);
      
      expect(html).toContain('<del>');
    });
    
    it('should render multiple modifiers', async () => {
      const { createInlineRenderer } = await import('../../src/inline/InlineRenderer');
      const renderer = createInlineRenderer();
      
      const html = renderer.render([{
        type: 'inline',
        modifiers: ['s', 'e'],
        attributes: {},
        value: 'Bold Italic',
      }]);
      
      expect(html).toContain('<strong>');
      expect(html).toContain('<em>');
    });
    
    it('should render links', async () => {
      const { createInlineRenderer } = await import('../../src/inline/InlineRenderer');
      const renderer = createInlineRenderer();
      
      const html = renderer.render([{
        type: 'inline',
        component: 'a',
        modifiers: [],
        attributes: { href: 'https://example.com' },
        value: 'Link',
      }]);
      
      expect(html).toContain('<a');
      expect(html).toContain('href="https://example.com"');
    });
  });
  
  describe('Inline Parsing', () => {
    it('should parse plain text', async () => {
      const { createInlineParser } = await import('../../src/inline/InlineParser');
      const parser = createInlineParser();
      
      const content = parser.parse('Hello World');
      expect(content).toHaveLength(1);
      expect(content[0].type).toBe('plain');
    });
    
    it('should parse bold HTML', async () => {
      const { createInlineParser } = await import('../../src/inline/InlineParser');
      const parser = createInlineParser();
      
      const content = parser.parse('<strong>Bold</strong>');
      expect(content.length).toBeGreaterThan(0);
    });
    
    it('should parse nested formatting', async () => {
      const { createInlineParser } = await import('../../src/inline/InlineParser');
      const parser = createInlineParser();
      
      const content = parser.parse('<strong><em>Bold Italic</em></strong>');
      expect(content.length).toBeGreaterThan(0);
    });
  });
  
  describe('Mark Manager', () => {
    it('should apply mark to content', async () => {
      const { createMarkManager } = await import('../../src/inline/MarkManager');
      const manager = createMarkManager();
      
      const content = [{ type: 'plain' as const, value: 'Hello' }];
      const result = manager.applyMark(content, 0, 5, 'bold');
      
      expect(result.length).toBeGreaterThan(0);
    });
    
    it('should remove mark from content', async () => {
      const { createMarkManager } = await import('../../src/inline/MarkManager');
      const manager = createMarkManager();
      
      const content = [{
        type: 'inline' as const,
        modifiers: ['s' as const],
        attributes: {},
        value: 'Bold',
      }];
      
      const result = manager.removeMark(content, 0, 4, 'bold');
      expect(result.length).toBeGreaterThan(0);
    });
    
    it('should toggle mark', async () => {
      const { createMarkManager } = await import('../../src/inline/MarkManager');
      const manager = createMarkManager();
      
      const content = [{ type: 'plain' as const, value: 'Hello' }];
      const result = manager.toggleMark(content, 0, 5, 'bold');
      
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
