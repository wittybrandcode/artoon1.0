import React from 'react';
import type { Block } from '../../../types';

interface PreformattedBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function PreformattedBlockContent({ block, isEditable, onUpdate }: PreformattedBlockContentProps) {
  return (
    <div className="block__content preformatted-block" dir="ltr">
      <pre
        contentEditable={isEditable}
        suppressContentEditableWarning
        onBlur={(e) => {
          const text = e.target.textContent || '';
          onUpdate({ content: [{ type: 'plain', value: text }] } as any);
        }}
      >
        {block.content?.[0]?.value || ''}
      </pre>
    </div>
  );
}
