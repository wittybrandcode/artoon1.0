/**
 * RTL/LTR Direction Tests
 * 
 * Tests bidirectional text support in the editor.
 */

import { describe, it, expect } from 'vitest';
import { importARTOON } from '../../src/integration/ARTOONImporter';
import { exportARTOON } from '../../src/integration/ARTOONExporter';
import { defaultBlockDefinitions } from '../../src/blocks/definitions';
import type { Block, TextBlock } from '../../src/types';

describe('RTL/LTR Direction Support', () => {
  describe('Import Direction Detection', () => {
    it('should detect RTL direction from > marker', () => {
      const input = '>.p:: نص عربي';
      const blocks = importARTOON(input);
      
      expect(blocks[0].direction).toBe('rtl');
    });
    
    it('should detect LTR direction from < marker', () => {
      const input = '<.p:: English text';
      const blocks = importARTOON(input);
      
      expect(blocks[0].direction).toBe('ltr');
    });
    
    it('should handle mixed directions in document', () => {
      const input = `>.t1:: عنوان عربي
<.p:: English paragraph
>.p:: فقرة عربية
<.q:: English quote`;
      
      const blocks = importARTOON(input);
      
      expect(blocks[0].direction).toBe('rtl');
      expect(blocks[1].direction).toBe('ltr');
      expect(blocks[2].direction).toBe('rtl');
      expect(blocks[3].direction).toBe('ltr');
    });
  });
  
  describe('Default Direction', () => {
    it('should default to RTL for most blocks', () => {
      const rtlBlocks = defaultBlockDefinitions.filter(d => d.type !== 'code');
      for (const def of rtlBlocks) {
        const block = def.create();
        expect(block.direction).toBe('rtl');
      }
    });
    
    it('should default to LTR for code blocks', () => {
      const codeDef = defaultBlockDefinitions.find(d => d.type === 'code');
      const block = codeDef!.create();
      expect(block.direction).toBe('ltr');
    });
    
    it('should allow LTR import option', () => {
      const input = '>.p:: نص';
      const blocks = importARTOON(input, { defaultDirection: 'ltr' });
      
      // Direction from marker takes precedence
      expect(blocks[0].direction).toBe('rtl');
    });
  });
  
  describe('Export Direction', () => {
    it('should export RTL blocks with > marker', () => {
      const blocks: Block[] = [
        {
          id: 'p1',
          type: 'paragraph',
          direction: 'rtl',
          content: [{ type: 'plain', value: 'نص عربي' }],
        } as TextBlock,
      ];
      
      const output = exportARTOON(blocks);
      
      expect(output).toContain('>.p::');
    });
    
    it('should export LTR blocks with < marker', () => {
      const blocks: Block[] = [
        {
          id: 'p1',
          type: 'paragraph',
          direction: 'ltr',
          content: [{ type: 'plain', value: 'English' }],
        } as TextBlock,
      ];
      
      const output = exportARTOON(blocks);
      
      expect(output).toContain('<.p::');
    });
  });
  
  describe('Bidirectional Content', () => {
    it('should handle Arabic with English words', () => {
      const input = '>.p:: هذا نص يحتوي على كلمة English في المنتصف';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].direction).toBe('rtl');
    });
    
    it('should handle English with Arabic words', () => {
      const input = '<.p:: This text contains عربي word in the middle';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].direction).toBe('ltr');
    });
    
    it('should handle code blocks as LTR', () => {
      const codeDef = defaultBlockDefinitions.find(d => d.type === 'code');
      const block = codeDef!.create();
      
      // Code is always LTR
      expect(block.direction).toBe('ltr');
    });
  });
  
  describe('List Direction', () => {
    it('should preserve direction in list items', () => {
      const input = `>.ul::
>.-li:: عنصر عربي
>.-li:: عنصر آخر`;
      
      const blocks = importARTOON(input);
      
      expect(blocks[0].direction).toBe('rtl');
    });
    
    it('should handle LTR lists', () => {
      const input = `<.ul::
<.-li:: First item
<.-li:: Second item`;
      
      const blocks = importARTOON(input);
      
      expect(blocks[0].direction).toBe('ltr');
    });
  });
  
  describe('Table Direction', () => {
    it('should preserve direction in tables', () => {
      const input = `>.table::
>.-th:: العمود الأول | العمود الثاني
>.-tr:: قيمة 1 | قيمة 2`;
      
      const blocks = importARTOON(input);
      
      expect(blocks[0].direction).toBe('rtl');
    });
  });
  
  describe('Phase 3/4 Blocks Direction', () => {
    it('should preserve direction in time block', () => {
      const input = '>.time:: 2026-01-16; السادس عشر من يناير';
      const blocks = importARTOON(input);
      
      expect(blocks[0].direction).toBe('rtl');
    });
    
    it('should preserve direction in abbr block', () => {
      const input = '>.abbr:: ج.م.ع; جمهورية مصر العربية';
      const blocks = importARTOON(input);
      
      expect(blocks[0].direction).toBe('rtl');
    });
  });
});
