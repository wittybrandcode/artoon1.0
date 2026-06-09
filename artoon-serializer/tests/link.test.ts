// ARTOON Serializer - Link Node Tests

import { serializeLink } from '../src/nodes/link';
import { LinkNode } from '@artoon/ast';

describe('serializeLink', () => {
  it('should serialize simple link', () => {
    const node: LinkNode = {
      type: 'link',

      nodeType: 'link',
      url: 'https://example.com',
      text: 'الرابط',
      modifiers: [],
      direction: 'rtl',
      line: 1
    };
    
    expect(serializeLink(node)).toBe('>.a:: https://example.com; الرابط');
  });
  
  it('should serialize link without text', () => {
    const node: LinkNode = {
      type: 'link',

      nodeType: 'link',
      url: 'https://example.com',
      modifiers: [],
      direction: 'rtl',
      line: 1
    };
    
    expect(serializeLink(node)).toBe('>.a:: https://example.com');
  });
  
  it('should serialize link with modifier', () => {
    const node: LinkNode = {
      type: 'link',

      nodeType: 'link',
      url: 'https://example.com',
      text: 'رابط مهم',
      modifiers: ['s'],
      direction: 'rtl',
      line: 1
    };
    
    expect(serializeLink(node)).toBe('>.[s+a:: https://example.com; رابط مهم]');
  });
  
  it('should serialize link with multiple modifiers', () => {
    const node: LinkNode = {
      type: 'link',

      nodeType: 'link',
      url: 'https://example.com',
      text: 'رابط مهم ومؤكد',
      modifiers: ['s', 'e'],
      direction: 'rtl',
      line: 1
    };
    
    expect(serializeLink(node)).toBe('>.[s+e+a:: https://example.com; رابط مهم ومؤكد]');
  });
  
  it('should serialize LTR link', () => {
    const node: LinkNode = {
      type: 'link',

      nodeType: 'link',
      url: 'https://example.com',
      text: 'Link',
      modifiers: [],
      direction: 'ltr',
      line: 1
    };
    
    expect(serializeLink(node)).toBe('<.a:: https://example.com; Link');
  });
});
