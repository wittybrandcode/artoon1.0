// ARTOON HTML Renderer - Blocks Tests

import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { render, renderFull } from '../src';

describe('Code Blocks', () => {
  
  test('code block', () => {
    const source = `<code>.
const x = 1;
console.log(x);
.<code>`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<pre>');
    expect(html).toContain('<code>');
    expect(html).toContain('const x = 1;');
    expect(html).toContain('</code>');
    expect(html).toContain('</pre>');
  });
  
  test('code block with language', () => {
    const source = `<code:js>.
function hello() {
  return "world";
}
.<code>`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('class="language-js"');
    expect(html).toContain('function hello()');
  });
  
  test('HTML escaping in code', () => {
    const source = `<code:html>.
<div class="test">
  <p>Hello</p>
</div>
.<code>`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    // Should escape HTML
    expect(html).toContain('&lt;div');
    expect(html).toContain('&lt;p&gt;');
  });
  
});

describe('Meta Block (Custom Block)', () => {
  
  test('meta block stored in document.meta', () => {
    const source = `<meta>.
>.-:title: عنوان المستند
>.-:author: الكاتب
.<meta>

>.p:: محتوى`;
    
    const doc = transform(parse(source));
    
    // Meta is stored in document.meta for head generation
    expect(doc.meta).toBeDefined();
    expect(doc.meta?.title).toBe('عنوان المستند');
    
    // Content should render
    const html = render(doc);
    expect(html).toContain('محتوى');
  });
  
  test('custom block with class name', () => {
    const source = `<profile>.
>.-:location: algeria
>.p:: أحمد محمد
.<profile>`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    // Custom block should have BEM-style class
    expect(html).toContain('custom-block--profile');
    // Content should be rendered inside the block
    expect(html).toContain('أحمد محمد');
  });
  
});

describe('Full Document', () => {
  
  test('full HTML document', () => {
    const source = `<meta>.
>.-:title: مستند تجريبي
>.-:author: أحمد
.<meta>

>.t1:: العنوان
>.p:: فقرة`;
    
    const doc = transform(parse(source));
    const html = renderFull(doc);
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('lang="ar"');
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('<head>');
    expect(html).toContain('<title>مستند تجريبي</title>');
    expect(html).toContain('<meta name="author"');
    expect(html).toContain('<body');
    expect(html).toContain('<h1>العنوان</h1>');
    expect(html).toContain('</html>');
  });
  
  test('full document with custom title', () => {
    const source = '>.p:: محتوى';
    const doc = transform(parse(source));
    const html = renderFull(doc, { title: 'عنوان مخصص' });
    
    expect(html).toContain('<title>عنوان مخصص</title>');
  });
  
});
