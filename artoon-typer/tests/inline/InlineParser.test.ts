/**
 * InlineParser Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  InlineParser, 
  createInlineParser, 
  parseHtmlToInline 
} from '../../src/inline/InlineParser';
import type { InlineContent, PlainText, InlineComponent } from '@artoon/ast';

describe('InlineParser', () => {
  let parser: InlineParser;

  beforeEach(() => {
    parser = createInlineParser();
  });

  describe('parse plain text', () => {
    it('should parse plain text', () => {
      const result = parser.parse('مرحبا عالم');
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('plain');
      expect((result[0] as PlainText).value).toBe('مرحبا عالم');
    });

    it('should handle empty string', () => {
      expect(parser.parse('')).toHaveLength(0);
    });

    it('should handle whitespace only', () => {
      expect(parser.parse('   ')).toHaveLength(0);
    });

    it('should preserve whitespace in text', () => {
      const result = parser.parse('أ  ب  ج');
      expect((result[0] as PlainText).value).toBe('أ  ب  ج');
    });
  });

  describe('parse modifiers', () => {
    it('should parse bold (strong)', () => {
      const result = parser.parse('<strong>عريض</strong>');
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('inline');
      expect((result[0] as InlineComponent).modifiers).toContain('s');
      expect((result[0] as InlineComponent).value).toBe('عريض');
    });

    it('should parse bold (b tag)', () => {
      const result = parser.parse('<b>عريض</b>');
      
      expect(result).toHaveLength(1);
      expect((result[0] as InlineComponent).modifiers).toContain('s');
    });

    it('should parse italic (em)', () => {
      const result = parser.parse('<em>مائل</em>');
      
      expect(result).toHaveLength(1);
      expect((result[0] as InlineComponent).modifiers).toContain('e');
    });

    it('should parse italic (i tag)', () => {
      const result = parser.parse('<i>مائل</i>');
      
      expect((result[0] as InlineComponent).modifiers).toContain('e');
    });

    it('should parse underline', () => {
      const result = parser.parse('<u>تحته خط</u>');
      
      expect((result[0] as InlineComponent).modifiers).toContain('u');
    });

    it('should parse strikethrough (del)', () => {
      const result = parser.parse('<del>مشطوب</del>');
      
      expect((result[0] as InlineComponent).modifiers).toContain('d');
    });

    it('should parse strikethrough (s tag)', () => {
      const result = parser.parse('<s>مشطوب</s>');
      
      expect((result[0] as InlineComponent).modifiers).toContain('d');
    });

    it('should parse mark', () => {
      const result = parser.parse('<mark>مميز</mark>');
      
      expect((result[0] as InlineComponent).modifiers).toContain('mark');
    });

    it('should parse subscript', () => {
      const result = parser.parse('<sub>2</sub>');
      
      expect((result[0] as InlineComponent).modifiers).toContain('sub');
    });

    it('should parse superscript', () => {
      const result = parser.parse('<sup>2</sup>');
      
      expect((result[0] as InlineComponent).modifiers).toContain('sup');
    });

    it('should parse nested modifiers', () => {
      const result = parser.parse('<strong><em>عريض ومائل</em></strong>');
      
      expect(result).toHaveLength(1);
      const item = result[0] as InlineComponent;
      expect(item.modifiers).toContain('s');
      expect(item.modifiers).toContain('e');
    });
  });

  describe('parse links', () => {
    it('should parse link', () => {
      const result = parser.parse('<a href="https://example.com">رابط</a>');
      
      expect(result).toHaveLength(1);
      const item = result[0] as InlineComponent;
      expect(item.component).toBe('a');
      expect(item.attributes.url).toBe('https://example.com');
      expect(item.attributes.text).toBe('رابط');
    });

    it('should parse link without text', () => {
      const result = parser.parse('<a href="https://example.com">https://example.com</a>');
      
      const item = result[0] as InlineComponent;
      expect(item.attributes.url).toBe('https://example.com');
      expect(item.attributes.text).toBeUndefined();
    });

    it('should parse link with title', () => {
      const result = parser.parse('<a href="https://example.com" title="عنوان">رابط</a>');
      
      const item = result[0] as InlineComponent;
      expect(item.attributes.title).toBe('عنوان');
    });
  });

  describe('parse code', () => {
    it('should parse inline code', () => {
      const result = parser.parse('<code>const x = 1</code>');
      
      expect(result).toHaveLength(1);
      const item = result[0] as InlineComponent;
      expect(item.component).toBe('c');
      expect(item.attributes.code).toBe('const x = 1');
    });

    it('should parse code with language', () => {
      const result = parser.parse('<code class="language-javascript">const x = 1</code>');
      
      const item = result[0] as InlineComponent;
      expect(item.attributes.lang).toBe('javascript');
    });
  });

  describe('parse images', () => {
    it('should parse image', () => {
      const result = parser.parse('<img src="image.png" alt="صورة" />');
      
      expect(result).toHaveLength(1);
      const item = result[0] as InlineComponent;
      expect(item.component).toBe('img');
      expect(item.attributes.src).toBe('image.png');
      expect(item.attributes.alt).toBe('صورة');
    });

    it('should parse image with dimensions', () => {
      const result = parser.parse('<img src="image.png" alt="" width="100" height="50" />');
      
      const item = result[0] as InlineComponent;
      expect(item.attributes.width).toBe('100');
      expect(item.attributes.height).toBe('50');
    });
  });

  describe('parse media', () => {
    it('should parse video', () => {
      const result = parser.parse('<video src="video.mp4"></video>');
      
      const item = result[0] as InlineComponent;
      expect(item.component).toBe('video');
      expect(item.attributes.src).toBe('video.mp4');
    });

    it('should parse audio', () => {
      const result = parser.parse('<audio src="audio.mp3"></audio>');
      
      const item = result[0] as InlineComponent;
      expect(item.component).toBe('audio');
      expect(item.attributes.src).toBe('audio.mp3');
    });
  });

  describe('parse time', () => {
    it('should parse time element', () => {
      const result = parser.parse('<time datetime="2024-01-15">15 يناير</time>');
      
      const item = result[0] as InlineComponent;
      expect(item.component).toBe('time');
      expect(item.attributes.datetime).toBe('2024-01-15');
      expect(item.attributes.display).toBe('15 يناير');
    });
  });

  describe('parse abbr', () => {
    it('should parse abbreviation', () => {
      const result = parser.parse('<abbr title="HyperText Markup Language">HTML</abbr>');
      
      const item = result[0] as InlineComponent;
      expect(item.component).toBe('abbr');
      expect(item.attributes.short).toBe('HTML');
      expect(item.attributes.full).toBe('HyperText Markup Language');
    });
  });

  describe('parse mixed content', () => {
    it('should parse plain + formatted', () => {
      const result = parser.parse('هذا نص <strong>عريض</strong> وهذا عادي');
      
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('plain');
      expect(result[1].type).toBe('inline');
      expect(result[2].type).toBe('plain');
    });

    it('should parse text with link', () => {
      const result = parser.parse('زر <a href="https://example.com">هنا</a> للمزيد');
      
      expect(result).toHaveLength(3);
      expect((result[1] as InlineComponent).component).toBe('a');
    });

    it('should parse complex nested content', () => {
      const result = parser.parse('<strong>عريض <em>ومائل</em> فقط عريض</strong>');
      
      // Should have: bold text, bold+italic text, bold text
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('parse br tags', () => {
    it('should convert br to newline', () => {
      const result = parser.parse('سطر أول<br>سطر ثاني');
      
      const text = result.map(item => {
        if (item.type === 'plain') return (item as PlainText).value;
        return (item as InlineComponent).value || '';
      }).join('');
      
      expect(text).toContain('\n');
    });
  });

  describe('normalization', () => {
    it('should merge adjacent plain text', () => {
      const result = parser.parse('<span>أ</span><span>ب</span>');
      
      expect(result).toHaveLength(1);
      expect((result[0] as PlainText).value).toBe('أب');
    });

    it('should merge adjacent same-formatted text', () => {
      const result = parser.parse('<strong>أ</strong><strong>ب</strong>');
      
      expect(result).toHaveLength(1);
      expect((result[0] as InlineComponent).value).toBe('أب');
    });

    it('should not merge different formatting', () => {
      const result = parser.parse('<strong>أ</strong><em>ب</em>');
      
      expect(result).toHaveLength(2);
    });

    it('should disable merging with option', () => {
      const parser = createInlineParser({ mergeAdjacent: false });
      const result = parser.parse('<span>أ</span><span>ب</span>');
      
      expect(result).toHaveLength(2);
    });
  });

  describe('whitespace handling', () => {
    it('should normalize whitespace when enabled', () => {
      const parser = createInlineParser({ normalizeWhitespace: true });
      const result = parser.parse('أ   ب   ج');
      
      expect((result[0] as PlainText).value).toBe('أ ب ج');
    });
  });

  describe('container elements', () => {
    it('should pass through span', () => {
      const result = parser.parse('<span>نص</span>');
      
      expect(result).toHaveLength(1);
      expect((result[0] as PlainText).value).toBe('نص');
    });

    it('should pass through div', () => {
      const result = parser.parse('<div>نص</div>');
      
      expect(result).toHaveLength(1);
    });
  });

  describe('convenience functions', () => {
    it('createInlineParser should work', () => {
      const parser = createInlineParser();
      expect(parser).toBeInstanceOf(InlineParser);
    });

    it('parseHtmlToInline should work', () => {
      const result = parseHtmlToInline('<strong>عريض</strong>');
      
      expect(result).toHaveLength(1);
      expect((result[0] as InlineComponent).modifiers).toContain('s');
    });

    it('parseHtmlToInline should accept options', () => {
      const result = parseHtmlToInline('أ   ب', { normalizeWhitespace: true });
      
      expect((result[0] as PlainText).value).toBe('أ ب');
    });
  });

  describe('edge cases', () => {
    it('should handle empty elements', () => {
      const result = parser.parse('<strong></strong>');
      
      // Empty elements should be filtered out
      expect(result).toHaveLength(0);
    });

    it('should handle deeply nested elements', () => {
      const result = parser.parse('<strong><em><u>نص</u></em></strong>');
      
      expect(result).toHaveLength(1);
      const item = result[0] as InlineComponent;
      expect(item.modifiers).toContain('s');
      expect(item.modifiers).toContain('e');
      expect(item.modifiers).toContain('u');
    });

    it('should handle unknown elements', () => {
      const result = parser.parse('<custom>نص</custom>');
      
      expect(result).toHaveLength(1);
      expect((result[0] as PlainText).value).toBe('نص');
    });
  });
});
