// ARTOON HTML Renderer - Integration Tests

import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { render, renderFull, createRenderer } from '../src';

describe('Complete Document', () => {
  
  test('render complete document', () => {
    const source = `<meta>.
>.-:title: مستند كامل
>.-:author: أحمد
.<meta>

>.t1:: العنوان الرئيسي

>.p:: فقرة مع [s:: نص مهم] و [a:: https://example.com; رابط].

>.ul::
li:: عنصر أول
li:: عنصر ثاني
-li:: فرعي

>.table::
th:: العمود 1; العمود 2
tr:: قيمة 1; قيمة 2

<code:js>.
const x = 1;
.<code>`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    // Check all components rendered
    expect(html).toContain('<h1>العنوان الرئيسي</h1>');
    expect(html).toContain('<strong>نص مهم</strong>');
    expect(html).toContain('<a href="https://example.com">رابط</a>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>عنصر أول</li>');
    expect(html).toContain('<table>');
    expect(html).toContain('<pre>');
    expect(html).toContain('const x = 1;');
  });
  
});

describe('Direction Handling', () => {
  
  test('RTL default', () => {
    const source = '>.p:: نص عربي';
    const doc = transform(parse(source));
    const html = render(doc, { defaultDirection: 'rtl' });
    
    // RTL is default, so no dir attribute needed
    expect(html).not.toContain('dir="rtl"');
  });
  
  test('LTR in RTL document', () => {
    const source = '<.p:: English text';
    const doc = transform(parse(source));
    const html = render(doc, { defaultDirection: 'rtl' });
    
    // LTR needs explicit dir
    expect(html).toContain('dir="ltr"');
  });
  
  test('mixed directions', () => {
    const source = `>.p:: نص عربي
<.p:: English text
>.p:: نص عربي آخر`;
    
    const doc = transform(parse(source));
    const html = render(doc, { defaultDirection: 'rtl' });
    
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('English text');
    expect(html).toContain('نص عربي');
  });
  
});

describe('Options', () => {
  
  test('disable direction attributes', () => {
    const source = '<.p:: English text';
    const doc = transform(parse(source));
    const html = render(doc, { includeDirection: false });
    
    expect(html).not.toContain('dir=');
  });
  
  test('include comments', () => {
    const source = '>.:::  هذا تعليق';
    const doc = transform(parse(source));
    
    const withComments = render(doc, { includeComments: true });
    const withoutComments = render(doc, { includeComments: false });
    
    expect(withComments).toContain('<!--');
    expect(withoutComments).not.toContain('<!--');
  });
  
});

describe('Comment Display Modes', () => {
  
  test('hidden mode (default)', () => {
    const source = '>.:::  هذا تعليق';
    const doc = transform(parse(source));
    const html = render(doc, { 
      includeComments: true,
      commentDisplay: 'hidden'
    });
    
    expect(html).toContain('<!-- هذا تعليق -->');
    expect(html).not.toContain('<div');
  });
  
  test('editor-only mode', () => {
    const source = '>.:::  تعليق للمحرر فقط';
    const doc = transform(parse(source));
    const html = render(doc, { 
      includeComments: true,
      commentDisplay: 'editor-only'
    });
    
    expect(html).toContain('<div class="comment editor-only">');
    expect(html).toContain('تعليق للمحرر فقط');
    expect(html).toContain('</div>');
  });
  
  test('visible mode', () => {
    const source = '>.:::  تعليق مرئي';
    const doc = transform(parse(source));
    const html = render(doc, { 
      includeComments: true,
      commentDisplay: 'visible'
    });
    
    expect(html).toContain('<div class="comment visible">');
    expect(html).toContain('تعليق مرئي');
    expect(html).toContain('</div>');
  });
  
  test('collapsible mode', () => {
    const source = '>.:::  تعليق قابل للطي';
    const doc = transform(parse(source));
    const html = render(doc, { 
      includeComments: true,
      commentDisplay: 'collapsible'
    });
    
    expect(html).toContain('<details class="comment">');
    expect(html).toContain('<summary>');
    expect(html).toContain('تعليق قابل للطي');
    expect(html).toContain('</details>');
  });
  
  test('custom comment tag', () => {
    const source = '>.:::  تعليق جانبي';
    const doc = transform(parse(source));
    const html = render(doc, { 
      includeComments: true,
      commentDisplay: 'visible',
      commentTag: 'aside'
    });
    
    expect(html).toContain('<aside class="comment visible">');
    expect(html).toContain('تعليق جانبي');
    expect(html).toContain('</aside>');
  });
  
  test('comment with special characters escaped', () => {
    const source = '>.:::  تعليق مع <script> و & خطير';
    const doc = transform(parse(source));
    const html = render(doc, { 
      includeComments: true,
      commentDisplay: 'visible'
    });
    
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
  });
  
});

describe('Create Renderer', () => {
  
  test('create renderer with options', () => {
    const renderer = createRenderer({ 
      defaultDirection: 'ltr',
      includeDirection: true 
    });
    
    const source = '>.p:: نص عربي';
    const doc = transform(parse(source));
    const html = renderer.render(doc);
    
    // RTL should have dir since default is LTR
    expect(html).toContain('dir="rtl"');
  });
  
  test('renderer renderFull', () => {
    const renderer = createRenderer();
    
    const source = '>.p:: محتوى';
    const doc = transform(parse(source));
    const html = renderer.renderFull(doc);
    
    expect(html).toContain('<!DOCTYPE html>');
  });
  
});

describe('HTML Escaping', () => {
  
  test('escape special characters', () => {
    const source = '>.p:: نص مع <script> و & و "quotes"';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&quot;quotes&quot;');
  });
  
});
