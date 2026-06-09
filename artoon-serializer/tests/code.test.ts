// ARTOON Serializer - Inline Code Node Tests

import { serializeCode } from '../src/nodes/code';
import { CodeNode } from '@artoon/ast';

describe('serializeCode', () => {
  it('should serialize inline code', () => {
    const node: CodeNode = {
      type: 'code',

      nodeType: 'code',
      code: 'const x = 1',
      direction: 'ltr',
      line: 1
    };
    
    expect(serializeCode(node)).toBe('<.[c:: const x = 1]');
  });
  
  it('should serialize inline code with language', () => {
    const node: CodeNode = {
      type: 'code',

      nodeType: 'code',
      code: 'const x = 1',
      language: 'js',
      direction: 'ltr',
      line: 1
    };
    
    expect(serializeCode(node)).toBe('<.[c:: const x = 1; js]');
  });
  
  it('should serialize RTL inline code', () => {
    const node: CodeNode = {
      type: 'code',

      nodeType: 'code',
      code: 'متغير = 1',
      direction: 'rtl',
      line: 1
    };
    
    expect(serializeCode(node)).toBe('>.[c:: متغير = 1]');
  });
});
