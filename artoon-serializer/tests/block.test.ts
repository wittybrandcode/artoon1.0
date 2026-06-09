// ARTOON Serializer - Block Node Tests

import { serializeBlock } from '../src/nodes/block';
import { BlockNode } from '@artoon/ast';

describe('serializeBlock', () => {
  it('should serialize code block', () => {
    const node: BlockNode = {
      type: 'block',

      nodeType: 'block',
      blockName: 'code',
      isCode: true,
      language: 'js',
      direction: 'ltr',
      line: 1,
      content: 'const x = 1;\nconsole.log(x);'
    };
    
    expect(serializeBlock(node)).toBe(
      '<code:js>.\n' +
      'const x = 1;\n' +
      'console.log(x);\n' +
      '.<code>'
    );
  });
  
  it('should serialize code block without language', () => {
    const node: BlockNode = {
      type: 'block',

      nodeType: 'block',
      blockName: 'code',
      isCode: true,
      direction: 'ltr',
      line: 1,
      content: 'plain code'
    };
    
    expect(serializeBlock(node)).toBe(
      '<code>.\n' +
      'plain code\n' +
      '.<code>'
    );
  });
  
  it('should serialize meta block with fields', () => {
    const node: BlockNode = {
      type: 'block',

      nodeType: 'block',
      blockName: 'meta',
      isCode: false,
      direction: 'rtl',
      line: 1,
      content: [],
      fields: [
        { name: 'title', direction: 'rtl', value: 'عنوان المقال' },
        { name: 'author', direction: 'rtl', value: 'المؤلف' }
      ]
    };
    
    expect(serializeBlock(node)).toBe(
      '<meta>.\n' +
      '>.-:title: عنوان المقال\n' +
      '>.-:author: المؤلف\n' +
      '.<meta>'
    );
  });
  
  it('should serialize custom block with fields', () => {
    const node: BlockNode = {
      type: 'block',

      nodeType: 'block',
      blockName: 'profile',
      isCode: false,
      direction: 'rtl',
      line: 1,
      content: '>.p:: أحمد محمد',
      fields: [
        { name: 'location', direction: 'ltr', value: 'algeria' }
      ]
    };
    
    expect(serializeBlock(node)).toBe(
      '<profile>.\n' +
      '<.-:location: algeria\n' +
      '>.p:: أحمد محمد\n' +
      '.<profile>'
    );
  });
  
  it('should serialize empty custom block', () => {
    const node: BlockNode = {
      type: 'block',

      nodeType: 'block',
      blockName: 'note',
      isCode: false,
      direction: 'rtl',
      line: 1,
      content: []
    };
    
    expect(serializeBlock(node)).toBe(
      '<note>.\n' +
      '.<note>'
    );
  });
});
