// ARTOON HTML Renderer - Text Tests

import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { render } from '../src';

describe('Text Components', () => {
  
  test('paragraph', () => {
    const source = '>.p:: نص فقرة';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<p>');
    expect(html).toContain('نص فقرة');
    expect(html).toContain('</p>');
  });
  
  test('headings t1-t6', () => {
    const source = `>.t1:: عنوان 1
>.t2:: عنوان 2
>.t3:: عنوان 3
>.t4:: عنوان 4
>.t5:: عنوان 5
>.t6:: عنوان 6`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<h1>عنوان 1</h1>');
    expect(html).toContain('<h2>عنوان 2</h2>');
    expect(html).toContain('<h3>عنوان 3</h3>');
    expect(html).toContain('<h4>عنوان 4</h4>');
    expect(html).toContain('<h5>عنوان 5</h5>');
    expect(html).toContain('<h6>عنوان 6</h6>');
  });
  
  test('blockquote', () => {
    const source = '>.q:: اقتباس مهم';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<blockquote>');
    expect(html).toContain('اقتباس مهم');
    expect(html).toContain('</blockquote>');
  });
  
  test('preformatted', () => {
    const source = '>.pre:: نص محفوظ التنسيق';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<pre>');
    expect(html).toContain('نص محفوظ التنسيق');
    expect(html).toContain('</pre>');
  });
  
  test('LTR text', () => {
    const source = '<.p:: English text';
    const doc = transform(parse(source));
    const html = render(doc, { defaultDirection: 'rtl' });
    
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('English text');
  });
  
});

describe('Inline Modifiers', () => {
  
  test('strong (s)', () => {
    const source = '>.p:: نص مع [s:: كلمة مهمة]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<strong>كلمة مهمة</strong>');
  });
  
  test('emphasis (e)', () => {
    const source = '>.p:: نص مع [e:: تأكيد]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<em>تأكيد</em>');
  });
  
  test('underline (u)', () => {
    const source = '>.p:: نص مع [u:: تحته خط]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<u>تحته خط</u>');
  });
  
  test('delete (d)', () => {
    const source = '>.p:: نص مع [d:: محذوف]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<del>محذوف</del>');
  });
  
  test('mark', () => {
    const source = '>.p:: نص مع [mark:: مميز]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<mark>مميز</mark>');
  });
  
  test('subscript (sub)', () => {
    const source = '>.p:: H[sub:: 2]O';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<sub>2</sub>');
  });
  
  test('superscript (sup)', () => {
    const source = '>.p:: x[sup:: 2]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<sup>2</sup>');
  });
  
  test('multiple modifiers', () => {
    const source = '>.p:: نص مع [s+e:: مهم جداً]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    // Should have both strong and em
    expect(html).toContain('<strong>');
    expect(html).toContain('<em>');
    expect(html).toContain('مهم جداً');
  });
  
});

describe('Time/Abbr Line Components', () => {
  
  test('time with datetime only', () => {
    const source = '>.time:: 2026-01-15';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<time');
    expect(html).toContain('datetime="2026-01-15"');
    expect(html).toContain('2026-01-15');
    expect(html).toContain('</time>');
  });
  
  test('time with display text', () => {
    const source = '>.time:: 2026-01-15; الخامس عشر من يناير';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<time');
    expect(html).toContain('datetime="2026-01-15"');
    expect(html).toContain('الخامس عشر من يناير');
    expect(html).toContain('</time>');
  });
  
  test('abbr with title', () => {
    const source = '>.abbr:: HTML; HyperText Markup Language';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<abbr');
    expect(html).toContain('title="HyperText Markup Language"');
    expect(html).toContain('HTML');
    expect(html).toContain('</abbr>');
  });
  
  test('RTL abbr', () => {
    const source = '>.abbr:: ج.م.ع; جمهورية مصر العربية';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<abbr');
    expect(html).toContain('title="جمهورية مصر العربية"');
    expect(html).toContain('ج.م.ع');
    expect(html).toContain('</abbr>');
  });
  
  test('LTR time', () => {
    const source = '<.time:: 2026-01-15; January 15th';
    const doc = transform(parse(source));
    const html = render(doc, { defaultDirection: 'rtl' });
    
    expect(html).toContain('<time');
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('datetime="2026-01-15"');
    expect(html).toContain('January 15th');
  });
  
});
