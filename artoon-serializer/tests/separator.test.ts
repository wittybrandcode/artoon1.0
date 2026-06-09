// ARTOON Serializer - Separator Node Tests

import { serializeSeparator } from '../src/nodes/separator';
import { SeparatorNode } from '@artoon/ast';

describe('serializeSeparator', () => {
  it('should serialize line break', () => {
    const node: SeparatorNode = {
      type: 'separator',
      separatorType: 'br',
      direction: 'rtl',
      line: 1
    };

    expect(serializeSeparator(node)).toBe('>.br');
  });

  it('should serialize horizontal rule', () => {
    const node: SeparatorNode = {
      type: 'separator',
      separatorType: 'hr',
      direction: 'rtl',
      line: 1
    };

    expect(serializeSeparator(node)).toBe('>.hr');
  });

  it('should serialize word break', () => {
    const node: SeparatorNode = {
      type: 'separator',
      separatorType: 'wbr',
      direction: 'ltr',
      line: 1
    };

    expect(serializeSeparator(node)).toBe('<.wbr');
  });

  it('should serialize with legacy separators array (backward compat)', () => {
    // Test backward compatibility with old format
    const node = {
      type: 'separator',
      separatorType: 'br',
      separators: ['br'],
      direction: 'rtl',
      line: 1
    } as SeparatorNode;

    expect(serializeSeparator(node)).toBe('>.br');
  });
});
