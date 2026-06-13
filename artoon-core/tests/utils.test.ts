import { escapeHtml, sanitizeUrl } from '../src/index';

describe('@artoon/core utils', () => {
  test('escapeHtml', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });
  test('sanitizeUrl', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('https://artoon.dev')).toBe('https://artoon.dev');
  });
});
