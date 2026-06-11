import React from 'react';
import type { Block } from '../../../types';

interface FileBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function FileBlockContent({ block, isEditable, onUpdate }: FileBlockContentProps) {
  const direction = block.direction || 'rtl';

  return (
    <div className="block__content file-block" dir={direction}>
      <div className="file-block__container">
        <i className="fas fa-file file-icon"></i>
        <div className="file-info">
          <div className="file-name">{block.label || block.src}</div>
          <a href={block.src} download className="file-download">تحميل الملف</a>
        </div>
      </div>
    </div>
  );
}
