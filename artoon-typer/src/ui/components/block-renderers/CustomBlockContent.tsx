import React from 'react';
import type { Block } from '../../../types';
import { generateId } from '@artoon/core';
import { BlockRenderer } from '../BlockRenderer';

interface CustomBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function CustomBlockContent({ block, isEditable, onUpdate }: CustomBlockContentProps) {
  const direction = block.direction || 'rtl';

  const hasChildren = block.children &&
    Array.isArray(block.children) &&
    block.children.length > 0;

  if (!hasChildren) {
    return (
      <div
        className="block__content custom-block custom-block--empty"
        dir={direction}
      >
        <span style={{ color: '#999', fontStyle: 'italic' }}>
          بلوك مخصص فارغ: {block.name}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`block__content custom-block custom-block-${block.name}`}
      dir={direction}
    >
      {block.children.map((child: any) => {
        const childBlock: Block = {
          id: child.id || generateId(),
          type: child.type || 'paragraph',
          direction: direction,
          content: Array.isArray(child.content) ? child.content : [],
        } as any;

        return (
          <BlockRenderer
            key={childBlock.id}
            block={childBlock}
            isEditable={isEditable}
            onUpdate={() => { }}
          />
        );
      })}
    </div>
  );
}
