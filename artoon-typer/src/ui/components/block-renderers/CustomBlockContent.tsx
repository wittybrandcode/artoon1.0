import React from 'react';
import type { Block } from '../../../types';

interface CustomBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function CustomBlockContent({ block, isEditable, onUpdate }: CustomBlockContentProps) {
  const direction = block.direction || 'rtl';

  return (
    <div className="block__content custom-block" dir={direction}>
      <div className="custom-block__header">
        <span className="custom-block__name">{block.blockName}</span>
      </div>
      <div className="custom-block__body">
         (محتوى البلوك المخصص قيد التطوير)
      </div>
    </div>
  );
}
