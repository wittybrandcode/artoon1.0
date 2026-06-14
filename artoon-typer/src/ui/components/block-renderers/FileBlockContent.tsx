import React from 'react';
import type { Block } from '../../../types';
import { sanitizeUrl } from '@artoon/core';

interface FileBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function FileBlockContent({ block, isEditable, onUpdate }: FileBlockContentProps) {
  const direction = block.direction || 'rtl';
  const safeSrc = sanitizeUrl(block.src || '#');

  return (
    <div className="block__content" dir={direction}>
      <a
        href={safeSrc}
        download
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          background: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
        }}
      >
        📎 {block.label || 'تحميل الملف'}
      </a>
    </div>
  );
}
