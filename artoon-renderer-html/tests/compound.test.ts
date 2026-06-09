// ARTOON HTML Renderer - Compound Components Tests

import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { render } from '../src';

describe('Figure', () => {
  
  test('figure with image', () => {
    const source = `>.figure::
>.-img:: photo.jpg; وصف الصورة
>.-figcaption:: تعليق على الصورة`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<figure>');
    expect(html).toContain('<img');
    expect(html).toContain('src="photo.jpg"');
    expect(html).toContain('<figcaption>');
    expect(html).toContain('تعليق على الصورة');
    expect(html).toContain('</figure>');
  });
  
});

describe('Details', () => {
  
  test('details with summary', () => {
    const source = `>.details::
>.-summary:: انقر للتفاصيل
>.-p:: المحتوى المخفي`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<details>');
    expect(html).toContain('<summary>');
    expect(html).toContain('انقر للتفاصيل');
    expect(html).toContain('المحتوى المخفي');
    expect(html).toContain('</details>');
  });
  
});
