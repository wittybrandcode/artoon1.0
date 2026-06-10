import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { render } from '../src';

describe('Security Sanitization', () => {
  test('sanitizes javascript: links', () => {
    const source = '>.p:: [a:: javascript:alert(1); Click me]';
    const doc = transform(parse(source));
    const html = render(doc);
    expect(html).toContain('href="about:blank"');
    expect(html).not.toContain('href="javascript:alert(1)"');
  });

  test('sanitizes data: links (non-image)', () => {
    const source = '>.p:: [a:: data:text/html,evil; Dangerous]';
    const doc = transform(parse(source));
    const html = render(doc);
    expect(html).toContain('href="about:blank"');
  });

  test('allows safe https links', () => {
    const source = '>.p:: [a:: https://google.com; Google]';
    const doc = transform(parse(source));
    const html = render(doc);
    expect(html).toContain('href="https://google.com"');
  });

  test('sanitizes media src', () => {
    const source = '>.video:: javascript:alert(1); Evil video';
    const doc = transform(parse(source));
    const html = render(doc);
    expect(html).toContain('src="about:blank"');
  });
});
