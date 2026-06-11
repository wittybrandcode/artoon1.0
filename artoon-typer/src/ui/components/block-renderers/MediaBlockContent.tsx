import React from 'react';
import type { Block, MediaBlock } from '../../../types';

interface MediaBlockContentProps {
  block: MediaBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function MediaBlockContent({ block, isEditable, onUpdate }: MediaBlockContentProps) {
  const direction = block.direction || 'rtl';

  const renderMedia = () => {
    switch (block.type) {
      case 'img':
        return <img src={block.src} alt={block.alt || ''} title={block.title} />;
      case 'video':
        return <video src={block.src} controls title={block.title} />;
      case 'audio':
        return <audio src={block.src} controls title={block.title} />;
      default:
        return null;
    }
  };

  return (
    <div className="block__content" dir={direction}>
      <div className="media-container">
        {renderMedia()}
        {block.title && <div className="media-caption">{block.title}</div>}
      </div>
    </div>
  );
}
