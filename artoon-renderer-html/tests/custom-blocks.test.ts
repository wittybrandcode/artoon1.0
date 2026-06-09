// ARTOON HTML Renderer - Custom Blocks Flexibility Tests

import { render } from '../src/index.js';
import { ARTOONDocument, BlockNode, TextNode } from '@artoon/ast';

describe('Custom Blocks Flexibility', () => {
  // Helper to create document
  const createDoc = (block: BlockNode): ARTOONDocument => ({
    version: '2.0',
    content: [block]
  });

  const createMultiDoc = (blocks: BlockNode[]): ARTOONDocument => ({
    version: '2.0',
    content: blocks
  });

  describe('Default Behavior', () => {
    test('renders custom block as div with default class', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, {});
      expect(html).toContain('<div class="custom-block custom-block--card">');
      expect(html).toContain('Card content');
      expect(html).toContain('</div>');
    });

    test('renders multiple custom blocks with default tags', () => {
      const doc = createMultiDoc([
        {
          type: 'block',
          nodeType: 'block',
          blockName: 'note',
          isCode: false,
          content: 'Note content',
          direction: 'rtl',
          line: 1
        } as BlockNode,
        {
          type: 'block',
          nodeType: 'block',
          blockName: 'warning',
          isCode: false,
          content: 'Warning content',
          direction: 'rtl',
          line: 2
        } as BlockNode
      ]);

      const html = render(doc, {});
      expect(html).toContain('<div class="custom-block custom-block--note">');
      expect(html).toContain('<div class="custom-block custom-block--warning">');
    });

    test('uses defaultCustomBlockTag option', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, { defaultCustomBlockTag: 'section' });
      expect(html).toContain('<section class="custom-block custom-block--card">');
      expect(html).toContain('</section>');
    });
  });

  describe('Custom Tag Mapping', () => {
    test('maps block to custom HTML tag', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          { name: 'card', tag: 'article' }
        ]
      });

      expect(html).toContain('<article class="custom-block custom-block--card">');
      expect(html).toContain('</article>');
    });

    test('maps multiple blocks to different tags', () => {
      const doc = createMultiDoc([
        {
          type: 'block',
          nodeType: 'block',
          blockName: 'card',
          isCode: false,
          content: 'Card content',
          direction: 'rtl',
          line: 1
        } as BlockNode,
        {
          type: 'block',
          nodeType: 'block',
          blockName: 'note',
          isCode: false,
          content: 'Note content',
          direction: 'rtl',
          line: 2
        } as BlockNode
      ]);

      const html = render(doc, {
        customBlocks: [
          { name: 'card', tag: 'article' },
          { name: 'note', tag: 'aside' }
        ]
      });

      expect(html).toContain('<article class="custom-block custom-block--card">');
      expect(html).toContain('<aside class="custom-block custom-block--note">');
    });

    test('unmapped blocks use default tag', () => {
      const doc = createMultiDoc([
        {
          type: 'block',
          nodeType: 'block',
          blockName: 'card',
          isCode: false,
          content: 'Card content',
          direction: 'rtl',
          line: 1
        } as BlockNode,
        {
          type: 'block',
          nodeType: 'block',
          blockName: 'unmapped',
          isCode: false,
          content: 'Unmapped content',
          direction: 'rtl',
          line: 2
        } as BlockNode
      ]);

      const html = render(doc, {
        customBlocks: [
          { name: 'card', tag: 'article' }
        ],
        defaultCustomBlockTag: 'section'
      });

      expect(html).toContain('<article class="custom-block custom-block--card">');
      expect(html).toContain('<section class="custom-block custom-block--unmapped">');
    });
  });

  describe('Custom Class Mapping', () => {
    test('uses custom className', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          { name: 'card', tag: 'article', className: 'my-card' }
        ]
      });

      expect(html).toContain('<article class="my-card">');
      expect(html).not.toContain('custom-block--card');
    });

    test('supports multiple classes', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'note',
        isCode: false,
        content: 'Note content',
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          { name: 'note', tag: 'aside', className: 'note warning important' }
        ]
      });

      expect(html).toContain('<aside class="note warning important">');
    });

    test('defaults to block name when className not provided', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          { name: 'card', tag: 'article' }
        ]
      });

      expect(html).toContain('class="custom-block custom-block--card"');
    });
  });

  describe('Custom Attributes', () => {
    test('adds custom attributes to block', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          {
            name: 'card',
            tag: 'article',
            attributes: {
              'data-type': 'info',
              'role': 'complementary'
            }
          }
        ]
      });

      expect(html).toContain('data-type="info"');
      expect(html).toContain('role="complementary"');
    });

    test('escapes attribute values', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          {
            name: 'card',
            tag: 'article',
            attributes: {
              'data-value': 'test "quoted" value'
            }
          }
        ]
      });

      expect(html).toContain('data-value="test &quot;quoted&quot; value"');
    });

    test('combines custom attributes with direction', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'ltr',
        line: 1
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          {
            name: 'card',
            tag: 'article',
            attributes: {
              'data-type': 'info'
            }
          }
        ],
        includeDirection: true,
        defaultDirection: 'rtl'
      });

      expect(html).toContain('dir="ltr"');
      expect(html).toContain('data-type="info"');
    });
  });

  describe('Hidden Fields with Custom Mapping', () => {
    test('renders hidden fields with default tag', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1,
        fields: [
          { name: 'title', value: 'Card Title', direction: 'rtl' },
          { name: 'author', value: 'John Doe', direction: 'ltr' }
        ]
      } as BlockNode);

      const html = render(doc, {});
      expect(html).toContain('<div class="title" data-field="title" hidden="hidden">');
      expect(html).toContain('Card Title');
      expect(html).toContain('<div class="author" data-field="author" hidden="hidden">');
      expect(html).toContain('John Doe');
    });

    test('maps field to custom tag', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1,
        fields: [
          { name: 'title', value: 'Card Title', direction: 'rtl' }
        ]
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          { name: 'card', tag: 'article' },
          { name: 'card-title', tag: 'h2' }
        ]
      });

      expect(html).toContain('<h2 class="title" data-field="title" hidden="hidden">');
      expect(html).toContain('Card Title');
      expect(html).toContain('</h2>');
    });

    test('maps multiple fields to different tags', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1,
        fields: [
          { name: 'title', value: 'Card Title', direction: 'rtl' },
          { name: 'author', value: 'John Doe', direction: 'ltr' },
          { name: 'date', value: '2026-01-19', direction: 'ltr' }
        ]
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          { name: 'card', tag: 'article' },
          { name: 'card-title', tag: 'h2' },
          { name: 'card-author', tag: 'span' },
          { name: 'card-date', tag: 'time' }
        ]
      });

      expect(html).toContain('<h2 class="title"');
      expect(html).toContain('<span class="author"');
      expect(html).toContain('<time class="date"');
    });

    test('field mapping supports custom className', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1,
        fields: [
          { name: 'title', value: 'Card Title', direction: 'rtl' }
        ]
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          { name: 'card-title', tag: 'h2', className: 'card-heading' }
        ]
      });

      expect(html).toContain('<h2 class="card-heading"');
    });

    test('field mapping supports custom attributes', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1,
        fields: [
          { name: 'date', value: '2026-01-19', direction: 'ltr' }
        ]
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          {
            name: 'card-date',
            tag: 'time',
            attributes: {
              'datetime': '2026-01-19'
            }
          }
        ]
      });

      expect(html).toContain('<time');
      expect(html).toContain('datetime="2026-01-19"');
    });
  });

  describe('Reserved Blocks', () => {
    test('code block is not affected by custom mappings', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'code',
        isCode: true,
        language: 'javascript',
        content: 'const x = 1;',
        direction: 'ltr',
        line: 1
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          { name: 'code', tag: 'article' } // Should be ignored
        ]
      });

      expect(html).toContain('<pre>');
      expect(html).toContain('<code class="language-javascript">');
      expect(html).not.toContain('<article');
    });

    test('meta block is not affected by custom mappings', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'meta',
        isCode: false,
        content: [],
        direction: 'rtl',
        line: 1,
        fields: [
          { name: 'title', value: 'Document Title', direction: 'rtl' }
        ]
      } as BlockNode);

      const html = render(doc, {
        metaHandling: 'tags',
        customBlocks: [
          { name: 'meta', tag: 'article' } // Should be ignored
        ]
      });

      expect(html).toContain('<meta name="title" content="Document Title" />');
      expect(html).not.toContain('<article');
    });

    test('figure block is not affected by custom mappings', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'figure',
        isCode: false,
        content: [
          {
            type: 'media',
            nodeType: 'media',
            mediaType: 'img',
            src: 'image.jpg',
            alt: 'Test image',
            direction: 'rtl',
            line: 1
          }
        ],
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          { name: 'figure', tag: 'article' } // Should be ignored
        ]
      });

      expect(html).toContain('<figure>');
      expect(html).not.toContain('<article');
    });

    test('details block is not affected by custom mappings', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'details',
        isCode: false,
        content: [
          {
            type: 'text',
            nodeType: 'text',
            textType: 'p',
            content: [{ type: 'plain', value: 'Summary' }],
            direction: 'rtl',
            line: 1
          } as TextNode
        ],
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          { name: 'details', tag: 'article' } // Should be ignored
        ]
      });

      expect(html).toContain('<details>');
      expect(html).not.toContain('<article');
    });
  });

  describe('Complex Scenarios', () => {
    test('combines all custom options', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'ltr',
        line: 1,
        fields: [
          { name: 'title', value: 'Card Title', direction: 'rtl' }
        ]
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          {
            name: 'card',
            tag: 'article',
            className: 'my-card',
            attributes: {
              'data-type': 'info',
              'role': 'complementary'
            }
          },
          {
            name: 'card-title',
            tag: 'h2',
            className: 'card-heading',
            attributes: {
              'data-level': '1'
            }
          }
        ],
        includeDirection: true,
        defaultDirection: 'rtl'
      });

      expect(html).toContain('class="my-card"');
      expect(html).toContain('dir="ltr"');
      expect(html).toContain('data-type="info"');
      expect(html).toContain('role="complementary"');
      expect(html).toContain('<h2 class="card-heading" data-field="title" hidden="hidden" data-level="1">');
      expect(html).toContain('Card Title');
      expect(html).toContain('Card content');
    });

    test('handles nested content with custom blocks', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: [
          {
            type: 'text',
            nodeType: 'text',
            textType: 'p',
            content: [{ type: 'plain', value: 'Paragraph 1' }],
            direction: 'rtl',
            line: 1
          } as TextNode,
          {
            type: 'text',
            nodeType: 'text',
            textType: 'p',
            content: [{ type: 'plain', value: 'Paragraph 2' }],
            direction: 'rtl',
            line: 2
          } as TextNode
        ],
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          { name: 'card', tag: 'article', className: 'card' }
        ]
      });

      expect(html).toContain('<article class="card">');
      expect(html).toContain('<p>Paragraph 1</p>');
      expect(html).toContain('<p>Paragraph 2</p>');
      expect(html).toContain('</article>');
    });

    test('empty customBlocks array uses defaults', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, { customBlocks: [] });
      expect(html).toContain('<div class="custom-block custom-block--card">');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty content', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: '',
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          { name: 'card', tag: 'article' }
        ]
      });

      expect(html).toContain('<article class="custom-block custom-block--card"></article>');
    });

    test('handles empty fields array', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1,
        fields: []
      } as BlockNode);

      const html = render(doc, {
        customBlocks: [
          { name: 'card', tag: 'article' }
        ]
      });

      expect(html).toContain('<article class="custom-block custom-block--card">');
      expect(html).toContain('Card content');
    });

    test('handles special characters in block name', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'my-custom-block',
        isCode: false,
        content: 'Content',
        direction: 'rtl',
        line: 1
      } as BlockNode);

      const html = render(doc, {});
      expect(html).toContain('custom-block--my-custom-block');
    });

    test('handles special characters in field values', () => {
      const doc = createDoc({
        type: 'block',
        nodeType: 'block',
        blockName: 'card',
        isCode: false,
        content: 'Card content',
        direction: 'rtl',
        line: 1,
        fields: [
          { name: 'title', value: 'Title with <html> & "quotes"', direction: 'rtl' }
        ]
      } as BlockNode);

      const html = render(doc, {});
      expect(html).toContain('Title with &lt;html&gt; &amp; &quot;quotes&quot;');
    });
  });
});
