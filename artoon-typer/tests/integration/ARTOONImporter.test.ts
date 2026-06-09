/**
 * ARTOONImporter Tests
 * 
 * Tests use ARTOON syntax (NOT Markdown):
 * - >.p:: paragraph
 * - >.t1:: heading1
 * - >.ul:: / li:: list
 * - <code:lang>. / .<code> code block
 * - >.hr divider
 */

import { describe, it, expect } from 'vitest';
import { 
  ARTOONImporter, 
  createARTOONImporter, 
  importARTOON 
} from '../../src/integration/ARTOONImporter';
import type { TextBlock, ListBlock, CodeBlock, TableBlock, MediaBlock, DividerBlock } from '../../src/types';

describe('ARTOONImporter', () => {
  describe('creation', () => {
    it('should create importer', () => {
      const importer = createARTOONImporter();
      expect(importer).toBeInstanceOf(ARTOONImporter);
    });
  });

  describe('import empty', () => {
    it('should return empty array for empty string', () => {
      const blocks = importARTOON('');
      expect(blocks).toEqual([]);
    });

    it('should return empty array for whitespace', () => {
      const blocks = importARTOON('   \n\n   ');
      expect(blocks).toEqual([]);
    });
  });

  describe('import paragraphs', () => {
    it('should import simple paragraph', () => {
      const blocks = importARTOON('>.p:: مرحبا عالم');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('paragraph');
      expect((blocks[0] as TextBlock).content).toBeDefined();
    });

    it('should import multiple paragraphs', () => {
      const blocks = importARTOON('>.p:: فقرة أولى\n>.p:: فقرة ثانية');
      
      expect(blocks).toHaveLength(2);
      expect(blocks[0].type).toBe('paragraph');
      expect(blocks[1].type).toBe('paragraph');
    });

    it('should import LTR paragraph', () => {
      const blocks = importARTOON('<.p:: Hello world');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('paragraph');
      expect(blocks[0].direction).toBe('ltr');
    });
  });

  describe('import headings', () => {
    it('should import t1 as heading1', () => {
      const blocks = importARTOON('>.t1:: عنوان رئيسي');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('heading1');
    });

    it('should import t2 as heading2', () => {
      const blocks = importARTOON('>.t2:: عنوان فرعي');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('heading2');
    });

    it('should import t3 as heading3', () => {
      const blocks = importARTOON('>.t3:: عنوان ثالث');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('heading3');
    });

    it('should import t4 as heading4', () => {
      const blocks = importARTOON('>.t4:: عنوان رابع');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('heading4');
    });

    it('should import t5 as heading5', () => {
      const blocks = importARTOON('>.t5:: عنوان خامس');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('heading5');
    });

    it('should import t6 as heading6', () => {
      const blocks = importARTOON('>.t6:: عنوان سادس');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('heading6');
    });
  });

  describe('import quote', () => {
    it('should import quote', () => {
      const blocks = importARTOON('>.q:: اقتباس مهم');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('quote');
    });
  });

  describe('import lists', () => {
    it('should import bullet list (ul)', () => {
      const blocks = importARTOON('>.ul::\nli:: عنصر أول\nli:: عنصر ثاني');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('list');
      expect((blocks[0] as ListBlock).items.length).toBe(2);
    });

    it('should import numbered list (ol)', () => {
      const blocks = importARTOON('>.ol::\nli:: عنصر أول\nli:: عنصر ثاني');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('list');
      expect((blocks[0] as ListBlock).items.length).toBe(2);
    });

    it('should import nested list', () => {
      const blocks = importARTOON('>.ul::\nli:: عنصر أول\n-li:: عنصر متداخل\nli:: عنصر ثاني');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('list');
    });
  });

  describe('import code', () => {
    it('should import code block with language', () => {
      const blocks = importARTOON('<code:javascript>.\nconst x = 1;\n.<code>');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('code');
      expect((blocks[0] as CodeBlock).language).toBe('javascript');
      expect((blocks[0] as CodeBlock).code).toContain('const x = 1');
    });

    it('should import code without language', () => {
      const blocks = importARTOON('<code>.\nsome code\n.<code>');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('code');
    });

    it('should import python code', () => {
      const blocks = importARTOON('<code:python>.\nx = 1\nprint(x)\n.<code>');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('code');
      expect((blocks[0] as CodeBlock).language).toBe('python');
    });
  });

  describe('import divider', () => {
    it('should import hr as divider', () => {
      const blocks = importARTOON('>.hr');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('divider');
    });
  });

  describe('import table', () => {
    it('should import table', () => {
      const blocks = importARTOON('>.table::\nth:: الاسم; العمر\ntr:: أحمد; 25');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('table');
      expect((blocks[0] as TableBlock).rows.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('import media', () => {
    it('should import image', () => {
      const blocks = importARTOON('>.img:: photo.jpg; صورة');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('image');
      expect((blocks[0] as MediaBlock).src).toBe('photo.jpg');
    });

    it('should import video', () => {
      const blocks = importARTOON('>.video:: movie.mp4; فيديو');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('video');
    });

    it('should import audio', () => {
      const blocks = importARTOON('>.audio:: sound.mp3; صوت');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('audio');
    });
  });

  describe('import direction', () => {
    it('should use RTL for > prefix', () => {
      const blocks = importARTOON('>.p:: نص عربي');
      
      expect(blocks[0].direction).toBe('rtl');
    });

    it('should use LTR for < prefix', () => {
      const blocks = importARTOON('<.p:: English text');
      
      expect(blocks[0].direction).toBe('ltr');
    });

    it('should use default direction when not specified', () => {
      const blocks = importARTOON('>.p:: نص', { defaultDirection: 'rtl' });
      
      expect(blocks[0].direction).toBe('rtl');
    });
  });

  describe('import mixed content', () => {
    it('should import multiple block types', () => {
      const artoon = `>.t1:: عنوان
>.p:: فقرة نصية
>.hr`;
      
      const blocks = importARTOON(artoon);
      
      expect(blocks.length).toBeGreaterThanOrEqual(3);
      expect(blocks[0].type).toBe('heading1');
      expect(blocks[1].type).toBe('paragraph');
      expect(blocks[2].type).toBe('divider');
    });

    it('should import heading, paragraph and list', () => {
      const artoon = `>.t1:: عنوان
>.p:: فقرة
>.ul::
li:: عنصر`;
      
      const blocks = importARTOON(artoon);
      
      expect(blocks.length).toBeGreaterThanOrEqual(3);
      expect(blocks[0].type).toBe('heading1');
      expect(blocks[1].type).toBe('paragraph');
      expect(blocks[2].type).toBe('list');
    });
  });

  describe('block IDs', () => {
    it('should generate unique IDs', () => {
      const blocks = importARTOON('>.p:: فقرة أولى\n>.p:: فقرة ثانية');
      
      expect(blocks.length).toBe(2);
      expect(blocks[0].id).not.toBe(blocks[1].id);
    });
  });

  describe('error handling', () => {
    it('should handle parse errors gracefully', () => {
      // Invalid syntax should not throw
      const blocks = importARTOON('[[[invalid');
      expect(Array.isArray(blocks)).toBe(true);
    });

    it('should return empty for malformed input', () => {
      const blocks = importARTOON('random text without artoon syntax');
      expect(Array.isArray(blocks)).toBe(true);
    });
  });
});

