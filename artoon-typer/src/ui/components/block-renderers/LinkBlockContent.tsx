import React from 'react';
import type { Block } from '../../../types';

interface LinkBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function LinkBlockContent({ block, isEditable, onUpdate }: LinkBlockContentProps) {
  const direction = block.direction || 'rtl';

  return (
    <div className="block__content link-block" dir={direction}>
      <div className="link-preview">
        <div className="link-info">
          <div className="link-title">{block.text || block.url}</div>
          <a href={block.url} target="_blank" rel="noopener noreferrer" className="link-url">
            {block.url}
          </a>
        </div>
      </div>
    </div>
  );
}
