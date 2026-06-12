import React from 'react';
import type { Block } from '../../../types';
import { BlockRendererProps } from '../BlockRendererTypes';

export function DetailsBlockContent({ block, isEditable, onUpdate, renderBlock }: BlockRendererProps) {
  const direction = block.direction || 'rtl';

  return (
    <details className="block__content details-block" dir={direction} open={isEditable}>
      {block.children && block.children.map((child: any) => (
        renderBlock ? renderBlock({
          block: child,
          isEditable,
          onUpdate: (updates) => {
            const newChildren = block.children.map((c: any) =>
              c.id === child.id ? { ...c, ...updates } : c
            );
            onUpdate({ children: newChildren } as any);
          },
          renderBlock
        }) : <div key={child.id}>Renderer not provided</div>
      ))}
    </details>
  );
}
