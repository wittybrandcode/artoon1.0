import React from 'react';
import type { Block } from '../../../types';
import { BlockRenderer } from '../BlockRenderer';// @ts-ignore

interface DetailsBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function DetailsBlockContent({ block, isEditable, onUpdate }: DetailsBlockContentProps) {
  const direction = block.direction || 'rtl';

  return (
    <details className="block__content details-block" dir={direction} open={isEditable}>
      {block.children && block.children.map((child: any) => (
        <BlockRenderer
          key={child.id}
          block={child}
          isEditable={isEditable}
          onUpdate={(updates) => {
            const newChildren = block.children.map((c: any) =>
              c.id === child.id ? { ...c, ...updates } : c
            );
            onUpdate({ children: newChildren } as any);
          }}
        />
      ))}
    </details>
  );
}
