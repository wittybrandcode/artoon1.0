import { describe, it, expect } from 'vitest';
import { createEditorController } from '../../src/core';
import type { Block } from '../../src/types';

describe('EditorControllerV2 selection model', () => {
  const initialBlocks: Block[] = [
    {
      id: 'p-1',
      type: 'paragraph',
      direction: 'rtl',
      content: [{ type: 'plain', value: 'hello world' }],
    },
    {
      id: 'p-2',
      type: 'paragraph',
      direction: 'rtl',
      content: [{ type: 'plain', value: 'second block' }],
    },
  ];

  it('sets and reads selection through state primitives', () => {
    const controller = createEditorController({ initialBlocks });
    controller.setSelection({
      blockId: 'p-1',
      anchorOffset: 2,
      focusOffset: 5,
      isCollapsed: false,
    });

    const selection = controller.getSelection();
    expect(selection).toBeTruthy();
    expect(selection?.blockId).toBe('p-1');
    expect(selection?.anchorOffset).toBe(2);
    expect(selection?.focusOffset).toBe(5);
    expect(selection?.isCollapsed).toBe(false);
  });

  it('respects clearSelection while keeping editor state cursor internally', () => {
    const controller = createEditorController({ initialBlocks });
    controller.setSelection({
      blockId: 'p-1',
      anchorOffset: 1,
      focusOffset: 1,
      isCollapsed: true,
    });

    controller.clearSelection();
    expect(controller.getSelection()).toBeNull();
  });

  it('keeps selection mapped after document transactions', () => {
    const controller = createEditorController({ initialBlocks });
    controller.setSelection({
      blockId: 'p-2',
      anchorOffset: 3,
      focusOffset: 3,
      isCollapsed: true,
    });

    controller.updateBlock('p-1', {
      content: [{ type: 'plain', value: 'hello updated world' }],
    } as Partial<Block>);

    const selection = controller.getSelection();
    expect(selection).toBeTruthy();
    expect(selection?.blockId).toBe('p-2');
  });
});
