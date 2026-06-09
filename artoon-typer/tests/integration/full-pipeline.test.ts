/**
 * Full Pipeline Integration Tests
 * 
 * Tests the complete flow: ARTOON → Parser → Blocks → Exporter → ARTOON
 * Ensures all components work together correctly.
 */

import { describe, it, expect } from 'vitest';
import { importARTOON } from '../../src/integration/ARTOONImporter';
import { exportARTOON } from '../../src/integration/ARTOONExporter';
import { getDefinition } from '../../src/blocks/definitions';
import type { Block } from '../../src/types';

describe('Full Pipeline Integration', () => {
  describe('Text Blocks Roundtrip', () => {
    it('should roundtrip paragraph', () => {
      const input = '>.p:: مرحباً بالعالم';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('paragraph');
    });
    
    it('should roundtrip headings t1-t6', () => {
      const input = `>.t1:: عنوان رئيسي
>.t2:: عنوان فرعي
>.t3:: عنوان ثالث`;
      
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(3);
      expect(blocks[0].type).toBe('heading1');
      expect(blocks[1].type).toBe('heading2');
      expect(blocks[2].type).toBe('heading3');
    });
    
    it('should roundtrip quote', () => {
      const input = '>.q:: هذا اقتباس مهم';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('quote');
    });
    
    it('should roundtrip preformatted', () => {
      const input = '>.pre:: نص    محفوظ    التنسيق';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('preformatted');
    });
  });
  
  describe('List Blocks Roundtrip', () => {
    it('should roundtrip bullet list', () => {
      const input = `>.ul::
>.-li:: عنصر أول
>.-li:: عنصر ثاني`;
      
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('list');
    });
    
    it('should roundtrip numbered list', () => {
      const input = `>.ol::
>.-li:: خطوة أولى
>.-li:: خطوة ثانية`;
      
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('list');
    });
  });
  
  describe('Media Blocks Roundtrip', () => {
    it('should roundtrip image', () => {
      const input = '>.img:: photo.jpg; صورة جميلة';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('image');
    });
    
    it('should roundtrip video', () => {
      const input = '>.video:: video.mp4';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('video');
    });
    
    it('should roundtrip audio', () => {
      const input = '>.audio:: sound.mp3';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('audio');
    });
  });
  
  describe('Separator Blocks Roundtrip', () => {
    it('should roundtrip divider (hr)', () => {
      const input = '>.hr';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('divider');
    });
  });
  
  describe('Phase 2 Blocks Roundtrip', () => {
    it('should roundtrip file block', () => {
      const input = '>.file:: document.pdf; تحميل الملف';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('file');
    });
  });
  
  describe('Phase 3 Blocks Roundtrip', () => {
    it('should roundtrip time block', () => {
      const input = '>.time:: 2026-01-16';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('time-block');
      expect((blocks[0] as any).datetime).toBe('2026-01-16');
    });
    
    it('should roundtrip time with display text', () => {
      const input = '>.time:: 2026-01-16; السادس عشر من يناير';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('time-block');
      expect((blocks[0] as any).displayText).toBe('السادس عشر من يناير');
    });
    
    it('should roundtrip abbr block', () => {
      const input = '>.abbr:: HTML; HyperText Markup Language';
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('abbr-block');
      expect((blocks[0] as any).abbr).toBe('HTML');
      expect((blocks[0] as any).title).toBe('HyperText Markup Language');
    });
  });
  
  describe('Phase 4 Blocks', () => {
    it('should create link block', () => {
      const def = getDefinition('link-block');
      expect(def).toBeDefined();
      
      const block = def!.create();
      expect(block.type).toBe('link-block');
    });
    
    it('should create word break block', () => {
      const def = getDefinition('word-break');
      expect(def).toBeDefined();
      
      const block = def!.create();
      expect(block.type).toBe('word-break');
    });
    
    it('should create custom block', () => {
      const def = getDefinition('custom');
      expect(def).toBeDefined();
      
      const block = def!.create();
      expect(block.type).toBe('custom');
    });
  });
  
  describe('Complex Documents', () => {
    it('should handle mixed RTL/LTR content', () => {
      const input = `>.t1:: عنوان عربي
<.p:: English paragraph
>.p:: فقرة عربية`;
      
      const blocks = importARTOON(input);
      
      expect(blocks).toHaveLength(3);
      expect(blocks[0].direction).toBe('rtl');
      expect(blocks[1].direction).toBe('ltr');
      expect(blocks[2].direction).toBe('rtl');
    });
    
    it('should handle document with all block types', () => {
      const input = `>.t1:: عنوان المستند
>.p:: فقرة تمهيدية
>.ul::
>.-li:: عنصر أول
>.-li:: عنصر ثاني
>.hr
>.q:: اقتباس مهم
>.time:: 2026-01-16
>.abbr:: API; Application Programming Interface`;
      
      const blocks = importARTOON(input);
      
      expect(blocks.length).toBeGreaterThan(5);
    });
  });
  
  describe('Export Consistency', () => {
    it('should export blocks to valid ARTOON', () => {
      const blocks: Block[] = [
        {
          id: 'p1',
          type: 'paragraph',
          direction: 'rtl',
          content: [{ type: 'plain', value: 'مرحباً' }],
        },
        {
          id: 'h1',
          type: 'heading1',
          direction: 'rtl',
          content: [{ type: 'plain', value: 'عنوان' }],
        },
      ];
      
      const output = exportARTOON(blocks);
      
      expect(output).toContain('>.p::');
      expect(output).toContain('>.t1::');
    });
    
    it('should export time block correctly', () => {
      const blocks: Block[] = [
        {
          id: 'time1',
          type: 'time-block',
          direction: 'rtl',
          datetime: '2026-01-16',
          displayText: 'اليوم',
        } as any,
      ];
      
      const output = exportARTOON(blocks);
      
      expect(output).toContain('2026-01-16');
    });
    
    it('should export abbr block correctly', () => {
      const blocks: Block[] = [
        {
          id: 'abbr1',
          type: 'abbr-block',
          direction: 'rtl',
          abbr: 'HTML',
          title: 'HyperText Markup Language',
        } as any,
      ];
      
      const output = exportARTOON(blocks);
      
      expect(output).toContain('HTML');
    });
  });
});

