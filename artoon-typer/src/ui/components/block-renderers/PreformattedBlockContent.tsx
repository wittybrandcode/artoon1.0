import React from 'react';
import type { Block } from '../../types';

export interface PreformattedBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function PreformattedBlockContent({ block, isEditable, onUpdate }: PreformattedBlockContentProps) {
  const direction = block.direction || 'rtl';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ content: e.target.value });
  };

  return (
    <div className="block__content">
      <textarea
        className="preformatted-content"
        value={block.content || ''}
        onChange={handleChange}
        readOnly={!isEditable}
        dir={direction}
        style={{
          direction,
          fontFamily: 'monospace',
          whiteSpace: 'pre',
          width: '100%',
          minHeight: '100px',
          padding: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      />
    </div>
  );
}
