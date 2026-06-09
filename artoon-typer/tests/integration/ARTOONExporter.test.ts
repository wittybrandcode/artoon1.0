/**
 * ARTOONExporter Tests
 * 
 * Tests export to ARTOON syntax:
 * - >.p:: paragraph
 * - >.t1:: heading1
 * - >.ul:: / li:: list
 * - <code:lang>. / .<code> code block
 * - >.hr divider
 */

import { describe, it, expect } from 'vitest';
import { 
  ARTOONExporter, 
  createARTOONExporter, 
  exportARTOON 
} from '../../src/integration/ARTOONExporter';
import type { 
  Block, 
  TextBlock, 
  ListBlock, 
  CodeBlock, 
  TableBlock, 
  MediaBlock, 
  DividerBlock 
} from '../../src/types';

// Helper to create blocks
function createParagraph(text: string, direction: 'rtl' | 'ltr' = 'rtl'): TextBlock {
  return {
    id: 'p1',
    type: 'paragraph',
    direction,
    content: [{ type: 'plain', value: text }],
  };
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6, text: string): TextBlock {
  return {
    id: `h${level}`,
    type: `heading${level}` as TextBlock['type'],
    direction: 'rtl',
    content: [{ type: 'plain', value: text }],
  };
}

function createQuote(text: string): TextBlock {
  return {
    id: 'q1',
    type: 'quote',
    direction: 'rtl',
    content: [{ type: 'plain', value: text }],
  };
}

function createList(items: string[], ordered: boolean = false): ListBlock {
  return {
    id: 'list1',
    type: ordered ? 'numbered-list' : 'bullet-list',
    direction: 'rtl',
    items: items.map((text, i) => ({
      id: `item${i}`,
      content: [{ type: 'plain', value: text }],
    })),
  };
}

function createCode(code: string, language: string = 'javascript'): CodeBlock {
  return {
    id: 'code1',
    type: 'code',
    direction: 'ltr',
    code,
    language,
  };
}

function createDivider(): DividerBlock {
  return {
    id: 'div1',
    type: 'divider',
    direction: 'rtl',
  };
}

function createTable(): TableBlock {
  return {
    id: 't1',
    type: 'table',
    direction: 'rtl',
    rows: [
      {
        id: 'r1',
        cells: [
          { id: 'c1', content: [{ type: 'plain', value: 'الاسم' }] },
          { id: 'c2', content: [{ type: 'plain', value: 'العمر' }] },
        ],
        isHeader: true,
      },
      {
        id: 'r2',
        cells: [
          { id: 'c3', content: [{ type: 'plain', value: 'أحمد' }] },
          { id: 'c4', content: [{ type: 'plain', value: '25' }] },
        ],
      },
    ],
    hasHeader: true,
  };
}

function createImage(src: string, alt?: string): MediaBlock {
  return {
    id: 'img1',
    type: 'image',
    direction: 'rtl',
    src,
    alt,
  };
}

describe('ARTOONExporter', () => {
  describe('creation', () => {
    it('should create exporter', () => {
      const exporter = createARTOONExporter();
      expect(exporter).toBeInstanceOf(ARTOONExporter);
    });
  });

  describe('export empty', () => {
    it('should return empty string for empty array', () => {
      const result = exportARTOON([]);
      expect(result).toBe('');
    });

    it('should return empty string for null', () => {
      const result = exportARTOON(null as any);
      expect(result).toBe('');
    });
  });

  describe('export paragraphs', () => {
    it('should export RTL paragraph with >.p::', () => {
      const blocks = [createParagraph('مرحبا عالم')];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('>.p::');
      expect(result).toContain('مرحبا عالم');
    });

    it('should export LTR paragraph with <.p::', () => {
      const blocks = [createParagraph('Hello world', 'ltr')];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('<.p::');
      expect(result).toContain('Hello world');
    });

    it('should export multiple paragraphs', () => {
      const blocks = [
        createParagraph('فقرة أولى'),
        createParagraph('فقرة ثانية'),
      ];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('فقرة أولى');
      expect(result).toContain('فقرة ثانية');
    });
  });

  describe('export headings', () => {
    it('should export heading1 as >.t1::', () => {
      const blocks = [createHeading(1, 'عنوان')];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('>.t1::');
      expect(result).toContain('عنوان');
    });

    it('should export heading2 as >.t2::', () => {
      const blocks = [createHeading(2, 'عنوان فرعي')];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('>.t2::');
    });

    it('should export heading3 as >.t3::', () => {
      const blocks = [createHeading(3, 'عنوان ثالث')];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('>.t3::');
    });

    it('should export heading4 as >.t4::', () => {
      const blocks = [createHeading(4, 'عنوان رابع')];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('>.t4::');
    });

    it('should export heading5 as >.t5::', () => {
      const blocks = [createHeading(5, 'عنوان خامس')];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('>.t5::');
    });

    it('should export heading6 as >.t6::', () => {
      const blocks = [createHeading(6, 'عنوان سادس')];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('>.t6::');
    });
  });

  describe('export quote', () => {
    it('should export quote as >.q::', () => {
      const blocks = [createQuote('اقتباس مهم')];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('>.q::');
      expect(result).toContain('اقتباس مهم');
    });
  });

  describe('export lists', () => {
    it('should export bullet list as ul', () => {
      const blocks = [createList(['عنصر أول', 'عنصر ثاني'])];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('ul');
      expect(result).toContain('عنصر أول');
    });

    it('should export numbered list as ol', () => {
      const blocks = [createList(['عنصر أول', 'عنصر ثاني'], true)];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('ol');
    });
  });

  describe('export code', () => {
    it('should export code block with language', () => {
      const blocks = [createCode('const x = 1;', 'javascript')];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('<code');
      expect(result).toContain('javascript');
      expect(result).toContain('const x = 1');
      expect(result).toContain('.<code>');
    });

    it('should export code without language', () => {
      const blocks = [createCode('code', 'plaintext')];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('<code');
      expect(result).toContain('code');
    });

    it('should export python code', () => {
      const blocks = [createCode('x = 1', 'python')];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('python');
    });
  });

  describe('export divider', () => {
    it('should export divider as >.hr', () => {
      const blocks = [createDivider()];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('hr');
    });
  });

  describe('export table', () => {
    it('should export table', () => {
      const blocks = [createTable()];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('table');
      expect(result).toContain('الاسم');
      expect(result).toContain('أحمد');
    });
  });

  describe('export media', () => {
    it('should export image', () => {
      const blocks = [createImage('photo.jpg', 'صورة')];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('img');
      expect(result).toContain('photo.jpg');
    });

    it('should export video', () => {
      const blocks: Block[] = [{
        id: 'v1',
        type: 'video',
        direction: 'rtl',
        src: 'movie.mp4',
      }];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('video');
      expect(result).toContain('movie.mp4');
    });

    it('should export audio', () => {
      const blocks: Block[] = [{
        id: 'a1',
        type: 'audio',
        direction: 'rtl',
        src: 'sound.mp3',
      }];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('audio');
      expect(result).toContain('sound.mp3');
    });
  });

  describe('export mixed content', () => {
    it('should export multiple block types', () => {
      const blocks: Block[] = [
        createHeading(1, 'عنوان'),
        createParagraph('فقرة'),
        createList(['عنصر']),
        createDivider(),
      ];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('t1');
      expect(result).toContain('فقرة');
      expect(result).toContain('ul');
      expect(result).toContain('hr');
    });
  });

  describe('roundtrip', () => {
    it('should maintain content through export', () => {
      const blocks = [
        createParagraph('نص عربي'),
        createHeading(1, 'عنوان'),
      ];
      const result = exportARTOON(blocks);
      
      expect(result).toContain('نص عربي');
      expect(result).toContain('عنوان');
    });
  });
});
