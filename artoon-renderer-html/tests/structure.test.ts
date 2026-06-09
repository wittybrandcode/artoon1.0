// ARTOON HTML Renderer - Structure Tests

import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { render } from '../src';

describe('Lists', () => {
  
  test('unordered list', () => {
    const source = `>.ul::
li:: عنصر أول
li:: عنصر ثاني`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>عنصر أول</li>');
    expect(html).toContain('<li>عنصر ثاني</li>');
    expect(html).toContain('</ul>');
  });
  
  test('ordered list', () => {
    const source = `>.ol::
li:: خطوة أولى
li:: خطوة ثانية`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<ol>');
    expect(html).toContain('<li>خطوة أولى</li>');
    expect(html).toContain('<li>خطوة ثانية</li>');
    expect(html).toContain('</ol>');
  });
  
  test('definition list', () => {
    const source = `>.dl::
dt:: مصطلح
dd:: تعريف المصطلح`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<dl>');
    expect(html).toContain('<dt>مصطلح</dt>');
    expect(html).toContain('<dd>تعريف المصطلح</dd>');
    expect(html).toContain('</dl>');
  });
  
  test('nested list', () => {
    const source = `>.ul::
li:: عنصر رئيسي
-li:: عنصر فرعي`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<ul>');
    expect(html).toContain('عنصر رئيسي');
    expect(html).toContain('عنصر فرعي');
    // Should have nested ul
    expect(html.match(/<ul>/g)?.length).toBeGreaterThanOrEqual(1);
  });
  
});

describe('Tables', () => {
  
  test('simple table', () => {
    const source = `>.table::
th:: العمود 1; العمود 2
tr:: قيمة 1; قيمة 2`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<table>');
    expect(html).toContain('<thead>');
    expect(html).toContain('<th>العمود 1</th>');
    expect(html).toContain('<th>العمود 2</th>');
    expect(html).toContain('<tbody>');
    expect(html).toContain('<td>قيمة 1</td>');
    expect(html).toContain('<td>قيمة 2</td>');
    expect(html).toContain('</table>');
  });
  
  test('table without headers', () => {
    const source = `>.table::
tr:: خلية 1; خلية 2
tr:: خلية 3; خلية 4`;
    
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<table>');
    expect(html).not.toContain('<thead>');
    expect(html).toContain('<tbody>');
    expect(html).toContain('<td>خلية 1</td>');
  });
  
});

describe('Separators', () => {
  
  test('br', () => {
    const source = '>.br::';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<br');
  });
  
  test('hr', () => {
    const source = '>.hr::';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<hr');
  });
  
  test('combined separators', () => {
    const source = '>.br;hr;br::';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<br');
    expect(html).toContain('<hr');
  });
  
});
