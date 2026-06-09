// META Block Rendering Tests

import { render } from '../src';
import type { BlockNode } from '@artoon/ast';

describe('META Block Rendering', () => {
  describe('Default behavior (hide)', () => {
    test('META is hidden by default', () => {
      const doc: any = {
        version: '2.0',
        meta: {
          type: 'block',
          blockName: 'meta',
          isCode: false,
          fields: [
            { name: 'title', value: 'Test Title', direction: 'ltr' },
            { name: 'author', value: 'Test Author', direction: 'ltr' }
          ],
          content: '',
          line: 1,
          direction: 'ltr'
        },
        content: [
          {
            type: 'text',
            textType: 't1',
            content: [{ type: 'plain', value: 'Heading' }],
            line: 5,
            direction: 'ltr'
          }
        ]
      };
      
      const html = render(doc, { includeDirection: false });
      
      // META should not appear
      expect(html).not.toContain('meta');
      expect(html).not.toContain('Test Title');
      expect(html).not.toContain('Test Author');
      
      // Content should appear
      expect(html).toContain('<h1>Heading</h1>');
    });
    
    test('META fields are not rendered', () => {
      const doc: any = {
        version: '2.0',
        meta: {
          type: 'block',
          blockName: 'meta',
          isCode: false,
          fields: [
            { name: 'secret', value: 'Should not appear', direction: 'ltr' }
          ],
          content: '',
          line: 1,
          direction: 'ltr'
        },
        content: []
      };
      
      const html = render(doc);
      expect(html).not.toContain('secret');
      expect(html).not.toContain('Should not appear');
    });
    
    test('Empty META renders nothing', () => {
      const doc: any = {
        version: '2.0',
        meta: {
          type: 'block',
          blockName: 'meta',
          isCode: false,
          fields: [],
          content: '',
          line: 1,
          direction: 'ltr'
        },
        content: []
      };
      
      const html = render(doc);
      expect(html.trim()).toBe('');
    });
  });
  
  describe('metaHandling: tags', () => {
    test('Render META as <meta> tags', () => {
      const doc: any = {
        version: '2.0',
        meta: {
          type: 'block',
          blockName: 'meta',
          isCode: false,
          fields: [
            { name: 'title', value: 'Test Title', direction: 'ltr' },
            { name: 'author', value: 'John Doe', direction: 'ltr' }
          ],
          content: '',
          line: 1,
          direction: 'ltr'
        },
        content: []
      };
      
      const html = render(doc, { metaHandling: 'tags' });
      
      expect(html).toContain('<meta name="title" content="Test Title"');
      expect(html).toContain('<meta name="author" content="John Doe"');
    });
    
    test('Escape HTML in meta tags', () => {
      const doc: any = {
        version: '2.0',
        meta: {
          type: 'block',
          blockName: 'meta',
          isCode: false,
          fields: [
            { name: 'title', value: '<script>alert("xss")</script>', direction: 'ltr' }
          ],
          content: '',
          line: 1,
          direction: 'ltr'
        },
        content: []
      };
      
      const html = render(doc, { metaHandling: 'tags' });
      
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });
    
    test('Handle special characters in meta tags', () => {
      const doc: any = {
        version: '2.0',
        meta: {
          type: 'block',
          blockName: 'meta',
          isCode: false,
          fields: [
            { name: 'description', value: 'Test & "quotes" <tags>', direction: 'ltr' }
          ],
          content: '',
          line: 1,
          direction: 'ltr'
        },
        content: []
      };
      
      const html = render(doc, { metaHandling: 'tags' });
      
      expect(html).toContain('&amp;');
      expect(html).toContain('&quot;');
      expect(html).toContain('&lt;');
      expect(html).toContain('&gt;');
    });
  });
  
  describe('metaHandling: comment', () => {
    test('Render META as HTML comment', () => {
      const doc: any = {
        version: '2.0',
        meta: {
          type: 'block',
          blockName: 'meta',
          isCode: false,
          fields: [
            { name: 'title', value: 'Test Title', direction: 'ltr' },
            { name: 'author', value: 'John Doe', direction: 'ltr' }
          ],
          content: '',
          line: 1,
          direction: 'ltr'
        },
        content: []
      };
      
      const html = render(doc, { metaHandling: 'comment' });
      
      expect(html).toContain('<!-- META:');
      expect(html).toContain('title: Test Title');
      expect(html).toContain('author: John Doe');
      expect(html).toContain('-->');
    });
    
    test('Single field in comment', () => {
      const doc: any = {
        version: '2.0',
        meta: {
          type: 'block',
          blockName: 'meta',
          isCode: false,
          fields: [
            { name: 'version', value: '1.0', direction: 'ltr' }
          ],
          content: '',
          line: 1,
          direction: 'ltr'
        },
        content: []
      };
      
      const html = render(doc, { metaHandling: 'comment' });
      
      expect(html).toContain('<!-- META: version: 1.0 -->');
    });
  });
  
  describe('Document without META', () => {
    test('Render document without META', () => {
      const doc: any = {
        version: '2.0',
        content: [
          {
            type: 'text',
            textType: 't1',
            content: [{ type: 'plain', value: 'Heading' }],
            line: 1,
            direction: 'ltr'
          }
        ]
      };
      
      const html = render(doc, { includeDirection: false });
      expect(html).toContain('<h1>Heading</h1>');
    });
  });
  
  describe('META with RTL fields', () => {
    test('RTL fields work correctly', () => {
      const doc: any = {
        version: '2.0',
        meta: {
          type: 'block',
          blockName: 'meta',
          isCode: false,
          fields: [
            { name: 'title', value: 'عنوان الوثيقة', direction: 'rtl' },
            { name: 'author', value: 'المؤلف', direction: 'rtl' }
          ],
          content: '',
          line: 1,
          direction: 'rtl'
        },
        content: []
      };
      
      const html = render(doc, { metaHandling: 'tags' });
      
      expect(html).toContain('<meta name="title" content="عنوان الوثيقة"');
      expect(html).toContain('<meta name="author" content="المؤلف"');
    });
  });
  
  describe('Integration with content', () => {
    test('META hidden, content visible', () => {
      const doc: any = {
        version: '2.0',
        meta: {
          type: 'block',
          blockName: 'meta',
          isCode: false,
          fields: [
            { name: 'title', value: 'Hidden Title', direction: 'ltr' }
          ],
          content: '',
          line: 1,
          direction: 'ltr'
        },
        content: [
          {
            type: 'text',
            textType: 'p',
            content: [{ type: 'plain', value: 'Visible content' }],
            line: 5,
            direction: 'ltr'
          }
        ]
      };
      
      const html = render(doc, { includeDirection: false });
      
      expect(html).not.toContain('Hidden Title');
      expect(html).toContain('<p>Visible content</p>');
    });
    
    test('META as tags, content visible', () => {
      const doc: any = {
        version: '2.0',
        meta: {
          type: 'block',
          blockName: 'meta',
          isCode: false,
          fields: [
            { name: 'title', value: 'Page Title', direction: 'ltr' }
          ],
          content: '',
          line: 1,
          direction: 'ltr'
        },
        content: [
          {
            type: 'text',
            textType: 'p',
            content: [{ type: 'plain', value: 'Page content' }],
            line: 5,
            direction: 'ltr'
          }
        ]
      };
      
      const html = render(doc, { metaHandling: 'tags', includeDirection: false });
      
      expect(html).toContain('<meta name="title" content="Page Title"');
      expect(html).toContain('<p>Page content</p>');
    });
  });
});
