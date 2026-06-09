// Comment Display Options Tests

import { render } from '../src/index.js';
import { ARTOONDocument, CommentNode } from '@artoon/ast';

describe('Comment Display Options', () => {
  const createDoc = (content: string): ARTOONDocument => ({
    version: '2.0',
    content: [
      {
        nodeType: 'comment',
        content,
        line: 1
      } as CommentNode
    ]
  });

  describe('hidden mode (default)', () => {
    test('renders as HTML comment by default', () => {
      const doc = createDoc('This is a comment');
      const html = render(doc, { includeComments: true });
      
      expect(html).toBe('<!-- This is a comment -->');
    });

    test('renders as HTML comment when explicitly set', () => {
      const doc = createDoc('Test comment');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'hidden'
      });
      
      expect(html).toBe('<!-- Test comment -->');
    });

    test('escapes HTML in comment content', () => {
      const doc = createDoc('<script>alert("xss")</script>');
      const html = render(doc, { includeComments: true });
      
      expect(html).toBe('<!-- &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; -->');
    });
  });

  describe('editor-only mode', () => {
    test('renders as div with editor-only class', () => {
      const doc = createDoc('Editor note');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'editor-only'
      });
      
      expect(html).toContain('<div class="comment editor-only">');
      expect(html).toContain('Editor note');
      expect(html).toContain('</div>');
    });

    test('uses custom tag when specified', () => {
      const doc = createDoc('Editor note');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'editor-only',
        commentTag: 'aside'
      });
      
      expect(html).toContain('<aside class="comment editor-only">');
      expect(html).toContain('</aside>');
    });

    test('escapes HTML in content', () => {
      const doc = createDoc('<b>Bold</b>');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'editor-only'
      });
      
      expect(html).toContain('&lt;b&gt;Bold&lt;/b&gt;');
    });
  });

  describe('visible mode', () => {
    test('renders as div with visible class', () => {
      const doc = createDoc('Visible comment');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'visible'
      });
      
      expect(html).toContain('<div class="comment visible">');
      expect(html).toContain('Visible comment');
      expect(html).toContain('</div>');
    });

    test('uses custom tag when specified', () => {
      const doc = createDoc('Visible comment');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'visible',
        commentTag: 'section'
      });
      
      expect(html).toContain('<section class="comment visible">');
      expect(html).toContain('</section>');
    });

    test('handles RTL content', () => {
      const doc = createDoc('تعليق مرئي');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'visible'
      });
      
      expect(html).toContain('تعليق مرئي');
    });
  });

  describe('collapsible mode', () => {
    test('renders as details element', () => {
      const doc = createDoc('Collapsible comment');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'collapsible'
      });
      
      expect(html).toContain('<details class="comment">');
      expect(html).toContain('<summary>تعليق</summary>');
      expect(html).toContain('Collapsible comment');
      expect(html).toContain('</details>');
    });

    test('escapes HTML in content', () => {
      const doc = createDoc('<script>alert("test")</script>');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'collapsible'
      });
      
      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>');
    });

    test('handles Arabic content', () => {
      const doc = createDoc('هذا تعليق قابل للطي');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'collapsible'
      });
      
      expect(html).toContain('هذا تعليق قابل للطي');
    });
  });

  describe('includeComments option', () => {
    test('does not render comments when includeComments is false', () => {
      const doc = createDoc('Hidden comment');
      const html = render(doc, {
        includeComments: false,
        commentDisplay: 'visible'
      });
      
      expect(html).toBe('');
    });

    test('renders comments when includeComments is true', () => {
      const doc = createDoc('Visible comment');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'visible'
      });
      
      expect(html).toContain('Visible comment');
    });
  });

  describe('multiple comments', () => {
    test('renders multiple comments with same mode', () => {
      const doc: ARTOONDocument = {
        version: '2.0',
        content: [
          { nodeType: 'comment', content: 'First comment', line: 1 } as CommentNode,
          { nodeType: 'comment', content: 'Second comment', line: 2 } as CommentNode
        ]
      };
      
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'visible'
      });
      
      expect(html).toContain('First comment');
      expect(html).toContain('Second comment');
    });

    test('renders multiple comments in collapsible mode', () => {
      const doc: ARTOONDocument = {
        version: '2.0',
        content: [
          { nodeType: 'comment', content: 'Comment 1', line: 1 } as CommentNode,
          { nodeType: 'comment', content: 'Comment 2', line: 2 } as CommentNode
        ]
      };
      
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'collapsible'
      });
      
      expect(html).toContain('Comment 1');
      expect(html).toContain('Comment 2');
      const detailsCount = (html.match(/<details/g) || []).length;
      expect(detailsCount).toBe(2);
    });
  });

  describe('custom tag option', () => {
    test('supports div tag', () => {
      const doc = createDoc('Test');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'visible',
        commentTag: 'div'
      });
      
      expect(html).toContain('<div class="comment visible">');
    });

    test('supports aside tag', () => {
      const doc = createDoc('Test');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'visible',
        commentTag: 'aside'
      });
      
      expect(html).toContain('<aside class="comment visible">');
    });

    test('supports span tag', () => {
      const doc = createDoc('Test');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'visible',
        commentTag: 'span'
      });
      
      expect(html).toContain('<span class="comment visible">');
    });

    test('supports section tag', () => {
      const doc = createDoc('Test');
      const html = render(doc, {
        includeComments: true,
        commentDisplay: 'visible',
        commentTag: 'section'
      });
      
      expect(html).toContain('<section class="comment visible">');
    });
  });
});
