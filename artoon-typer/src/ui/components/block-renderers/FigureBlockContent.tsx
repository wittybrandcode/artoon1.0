import React from 'react';
import type { Block } from '../../../types';
import { BlockRenderer } from '../BlockRenderer';// @ts-ignore

interface FigureBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function FigureBlockContent({ block, isEditable, onUpdate }: FigureBlockContentProps) {
  const direction = block.direction || 'rtl';
  const isRTL = direction === 'rtl';

  return (
    <figure className="block__content figure-block" dir={direction}>
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
    </figure>
  );
}
