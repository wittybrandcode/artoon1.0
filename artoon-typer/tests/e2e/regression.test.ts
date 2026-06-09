/**
 * Regression Tests
 * 
 * Ensures backward compatibility and no breaking changes.
 */

import { describe, it, expect } from 'vitest';
import { importARTOON } from '../../src/integration/ARTOONImporter';
import { exportARTOON } from '../../src/integration/ARTOONExporter';
import { defaultBlockDefinitions, getDefinition } from '../../src/blocks/definitions';
import type { Block, TextBlock, ListBlock, CodeBlock, TableBlock, MediaBlock } from '../../src/types';

describe('Regression Tests', () => {
  describe('Original Block Types Still Work', () => {
    it('should still support paragraph', () => {
      const def = getDefinition('paragraph');
      expect(def).toBeDefined();
      
      const block = def!.create();
      expect(block.type).toBe('paragraph');
    });
    
    it('should still support all heading levels', () => {
      for (let i = 1; i <= 6; i++) {
        const def = getDefinition(`heading${i}` as any);
        expect(def).toBeDefined();
      }
    });
    
    it('should still support quote', () => {
      const def = getDefinition('quote');
      expect(def).toBeDefined();
    });
    
    it('should still support bullet-list', () => {
      const def = getDefinition('bullet-list');
      expect(def).toBeDefined();
    });
    
    it('should still support numbered-list', () => {
      const def = getDefinition('numbered-list');
      expect(def).toBeDefined();
    });
    
    it('should still support code', () => {
      const def = getDefinition('code');
      expect(def).toBeDefined();
    });
    
    it('should still support table', () => {
      const def = getDefinition('table');
      expect(def).toBeDefined();
    });
    
    it('should still support image', () => {
      const def = getDefinition('image');
      expect(def).toBeDefined();
    });
    
    it('should still support video', () => {
      const def = getDefinition('video');
      expect(def).toBeDefined();
    });
    
    it('should still support audio', () => {
      const def = getDefinition('audio');
      expect(def).toBeDefined();
    });
    
    it('should still support divider', () => {
      const def = getDefinition('divider');
      expect(def).toBeDefined();
    });
  });
  
  describe('Original Import Still Works', () => {
    it('should import basic paragraph', () => {
      const input = '>.p:: نص بسيط';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('paragraph');
    });
    
    it('should import heading', () => {
      const input = '>.t1:: عنوان';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('heading1');
    });
    
    it('should import list', () => {
      const input = `>.ul::
>.-li:: عنصر`;
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('list');
    });
    
    it('should import image', () => {
      const input = '>.img:: photo.jpg';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('image');
    });
    
    it('should import divider', () => {
      const input = '>.hr';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('divider');
    });
  });
  
  describe('Original Export Still Works', () => {
    it('should export paragraph', () => {
      const blocks: Block[] = [
        {
          id: 'p1',
          type: 'paragraph',
          direction: 'rtl',
          content: [{ type: 'plain', value: 'نص' }],
        } as TextBlock,
      ];
      
      const output = exportARTOON(blocks);
      expect(output).toContain('>.p::');
    });
    
    it('should export heading', () => {
      const blocks: Block[] = [
        {
          id: 'h1',
          type: 'heading1',
          direction: 'rtl',
          content: [{ type: 'plain', value: 'عنوان' }],
        } as TextBlock,
      ];
      
      const output = exportARTOON(blocks);
      expect(output).toContain('>.t1::');
    });
    
    it('should export list', () => {
      const blocks: Block[] = [
        {
          id: 'ul1',
          type: 'bullet-list',
          direction: 'rtl',
          items: [{ id: 'li1', content: [{ type: 'plain', value: 'عنصر' }] }],
        } as ListBlock,
      ];
      
      const output = exportARTOON(blocks);
      expect(output).toContain('>.ul::');
    });
    
    it('should export code block', () => {
      const blocks: Block[] = [
        {
          id: 'code1',
          type: 'code',
          direction: 'ltr',
          language: 'javascript',
          code: 'console.log("hello");',
        } as CodeBlock,
      ];
      
      const output = exportARTOON(blocks);
      expect(output).toContain('code');
    });
    
    it('should export divider', () => {
      const blocks: Block[] = [
        {
          id: 'hr1',
          type: 'divider',
          direction: 'rtl',
        },
      ];
      
      const output = exportARTOON(blocks);
      expect(output).toContain('hr');
    });
  });
  
  describe('Block Structure Unchanged', () => {
    it('should have id, type, direction on all blocks', () => {
      for (const def of defaultBlockDefinitions) {
        const block = def.create();
        
        expect(block).toHaveProperty('id');
        expect(block).toHaveProperty('type');
        expect(block).toHaveProperty('direction');
      }
    });
    
    it('should have content array on text blocks', () => {
      const textTypes = ['paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6', 'quote'];
      
      for (const type of textTypes) {
        const def = getDefinition(type as any);
        const block = def!.create() as TextBlock;
        
        expect(block).toHaveProperty('content');
        expect(Array.isArray(block.content)).toBe(true);
      }
    });
    
    it('should have items array on list blocks', () => {
      const listTypes = ['bullet-list', 'numbered-list'];
      
      for (const type of listTypes) {
        const def = getDefinition(type as any);
        const block = def!.create() as ListBlock;
        
        expect(block).toHaveProperty('items');
        expect(Array.isArray(block.items)).toBe(true);
      }
    });
    
    it('should have rows array on table block', () => {
      const def = getDefinition('table');
      const block = def!.create() as TableBlock;
      
      expect(block).toHaveProperty('rows');
      expect(Array.isArray(block.rows)).toBe(true);
    });
    
    it('should have src on media blocks', () => {
      const mediaTypes = ['image', 'video', 'audio'];
      
      for (const type of mediaTypes) {
        const def = getDefinition(type as any);
        const block = def!.create() as MediaBlock;
        
        expect(block).toHaveProperty('src');
      }
    });
    
    it('should have code and language on code block', () => {
      const def = getDefinition('code');
      const block = def!.create() as CodeBlock;
      
      expect(block).toHaveProperty('code');
      expect(block).toHaveProperty('language');
    });
  });
  
  describe('API Compatibility', () => {
    it('should export importARTOON function', () => {
      expect(typeof importARTOON).toBe('function');
    });
    
    it('should export exportARTOON function', () => {
      expect(typeof exportARTOON).toBe('function');
    });
    
    it('should export defaultBlockDefinitions', () => {
      expect(Array.isArray(defaultBlockDefinitions)).toBe(true);
    });
    
    it('should export getDefinition function', () => {
      expect(typeof getDefinition).toBe('function');
    });
  });
  
  describe('Empty Input Handling', () => {
    it('should handle empty string import', () => {
      const blocks = importARTOON('');
      expect(blocks).toEqual([]);
    });
    
    it('should handle whitespace-only import', () => {
      const blocks = importARTOON('   \n\n   ');
      expect(blocks).toEqual([]);
    });
    
    it('should handle empty blocks export', () => {
      const output = exportARTOON([]);
      expect(output).toBe('');
    });
  });
});

