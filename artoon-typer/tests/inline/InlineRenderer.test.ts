/**
 * InlineRenderer Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  InlineRenderer, 
  createInlineRenderer, 
  renderInlineContent 
} from '../../src/inline/InlineRenderer';
import type { InlineContent, PlainText, InlineComponent } from '@artoon/ast';

describe('InlineRenderer', () => {
  let renderer: InlineRenderer;

  beforeEach(() => {
    renderer = createInlineRenderer();
  });

  describe('render plain text', () => {
    it('should render plain text', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'مرحبا عالم' },
      ];
      
      expect(renderer.render(content)).toBe('مرحبا عالم');
    });

    it('should escape HTML entities', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: '<script>alert("xss")</script>' },
      ];
      
      const result = renderer.render(content);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should handle empty content', () => {
      expect(renderer.render([])).toBe('');
    });

    it('should handle null/undefined content', () => {
      expect(renderer.render(null as any)).toBe('');
      expect(renderer.render(undefined as any)).toBe('');
    });
  });

  describe('render with modifiers', () => {
    it('should render bold text', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'عريض' },
      ];
      
      expect(renderer.render(content)).toBe('<strong>عريض</strong>');
    });

    it('should render italic text', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['e'], attributes: {}, value: 'مائل' },
      ];
      
      expect(renderer.render(content)).toBe('<em>مائل</em>');
    });

    it('should render underline text', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['u'], attributes: {}, value: 'تحته خط' },
      ];
      
      expect(renderer.render(content)).toBe('<u>تحته خط</u>');
    });

    it('should render strikethrough text', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['d'], attributes: {}, value: 'مشطوب' },
      ];
      
      expect(renderer.render(content)).toBe('<del>مشطوب</del>');
    });

    it('should render highlighted text', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['mark'], attributes: {}, value: 'مميز' },
      ];
      
      expect(renderer.render(content)).toBe('<mark>مميز</mark>');
    });

    it('should render subscript text', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['sub'], attributes: {}, value: '2' },
      ];
      
      expect(renderer.render(content)).toBe('<sub>2</sub>');
    });

    it('should render superscript text', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['sup'], attributes: {}, value: '2' },
      ];
      
      expect(renderer.render(content)).toBe('<sup>2</sup>');
    });

    it('should render multiple modifiers (bold + italic)', () => {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s', 'e'], attributes: {}, value: 'عريض ومائل' },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('<strong>');
      expect(result).toContain('<em>');
      expect(result).toContain('عريض ومائل');
    });
  });

  describe('render links', () => {
    it('should render link with text', () => {
      const content: InlineContent[] = [
        { 
          type: 'inline', 
          component: 'a', 
          attributes: { url: 'https://example.com', text: 'رابط' },
        },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('رابط');
    });

    it('should render link without text (use URL)', () => {
      const content: InlineContent[] = [
        { 
          type: 'inline', 
          component: 'a', 
          attributes: { url: 'https://example.com' },
        },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('>https://example.com</a>');
    });

    it('should render link with title', () => {
      const content: InlineContent[] = [
        { 
          type: 'inline', 
          component: 'a', 
          attributes: { url: 'https://example.com', text: 'رابط', title: 'عنوان' },
        },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('title="عنوان"');
    });
  });

  describe('render inline code', () => {
    it('should render code', () => {
      const content: InlineContent[] = [
        { 
          type: 'inline', 
          component: 'c', 
          attributes: { code: 'const x = 1' },
        },
      ];
      
      const result = renderer.render(content);
      expect(result).toBe('<code>const x = 1</code>');
    });

    it('should render code with language', () => {
      const content: InlineContent[] = [
        { 
          type: 'inline', 
          component: 'c', 
          attributes: { code: 'const x = 1', lang: 'javascript' },
        },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('class="language-javascript"');
    });

    it('should escape code content', () => {
      const content: InlineContent[] = [
        { 
          type: 'inline', 
          component: 'c', 
          attributes: { code: '<div>test</div>' },
        },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('&lt;div&gt;');
    });
  });

  describe('render images', () => {
    it('should render image', () => {
      const content: InlineContent[] = [
        { 
          type: 'inline', 
          component: 'img', 
          attributes: { src: 'image.png', alt: 'صورة' },
        },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('src="image.png"');
      expect(result).toContain('alt="صورة"');
    });

    it('should render image with dimensions', () => {
      const content: InlineContent[] = [
        { 
          type: 'inline', 
          component: 'img', 
          attributes: { src: 'image.png', alt: '', width: '100', height: '50' },
        },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('width="100"');
      expect(result).toContain('height="50"');
    });
  });

  describe('render media', () => {
    it('should render video', () => {
      const content: InlineContent[] = [
        { 
          type: 'inline', 
          component: 'video', 
          attributes: { src: 'video.mp4' },
        },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('<video');
      expect(result).toContain('src="video.mp4"');
      expect(result).toContain('controls');
    });

    it('should render audio', () => {
      const content: InlineContent[] = [
        { 
          type: 'inline', 
          component: 'audio', 
          attributes: { src: 'audio.mp3' },
        },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('<audio');
      expect(result).toContain('src="audio.mp3"');
      expect(result).toContain('controls');
    });
  });

  describe('render time', () => {
    it('should render time element', () => {
      const content: InlineContent[] = [
        { 
          type: 'inline', 
          component: 'time', 
          attributes: { datetime: '2024-01-15', display: '15 يناير 2024' },
        },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('datetime="2024-01-15"');
      expect(result).toContain('15 يناير 2024');
    });
  });

  describe('render abbr', () => {
    it('should render abbreviation', () => {
      const content: InlineContent[] = [
        { 
          type: 'inline', 
          component: 'abbr', 
          attributes: { short: 'HTML', full: 'HyperText Markup Language' },
        },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('title="HyperText Markup Language"');
      expect(result).toContain('>HTML</abbr>');
    });
  });

  describe('render file', () => {
    it('should render file download link', () => {
      const content: InlineContent[] = [
        { 
          type: 'inline', 
          component: 'file', 
          attributes: { src: 'document.pdf', label: 'تحميل الملف' },
        },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('href="document.pdf"');
      expect(result).toContain('download');
      expect(result).toContain('تحميل الملف');
    });
  });

  describe('render mixed content', () => {
    it('should render plain + formatted text', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'هذا نص ' },
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'عريض' },
        { type: 'plain', value: ' وهذا عادي' },
      ];
      
      const result = renderer.render(content);
      expect(result).toBe('هذا نص <strong>عريض</strong> وهذا عادي');
    });

    it('should render text with link', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'زر ' },
        { 
          type: 'inline', 
          component: 'a', 
          attributes: { url: 'https://example.com', text: 'هنا' },
        },
        { type: 'plain', value: ' للمزيد' },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('زر ');
      expect(result).toContain('<a href="https://example.com">هنا</a>');
      expect(result).toContain(' للمزيد');
    });
  });

  describe('render options', () => {
    it('should not escape HTML when disabled', () => {
      const renderer = createInlineRenderer({ escapeHtml: false });
      const content: InlineContent[] = [
        { type: 'plain', value: '<b>test</b>' },
      ];
      
      expect(renderer.render(content)).toBe('<b>test</b>');
    });

    it('should add data attributes when enabled', () => {
      const renderer = createInlineRenderer({ addDataAttributes: true });
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'عريض' },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('class="artoon-s"');
    });

    it('should use custom class prefix', () => {
      const renderer = createInlineRenderer({ 
        addDataAttributes: true, 
        classPrefix: 'my-' 
      });
      const content: InlineContent[] = [
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'عريض' },
      ];
      
      const result = renderer.render(content);
      expect(result).toContain('class="my-s"');
    });
  });

  describe('convenience function', () => {
    it('renderInlineContent should work', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'مرحبا' },
      ];
      
      expect(renderInlineContent(content)).toBe('مرحبا');
    });

    it('renderInlineContent should accept options', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: '<test>' },
      ];
      
      expect(renderInlineContent(content, { escapeHtml: false })).toBe('<test>');
    });
  });
});
