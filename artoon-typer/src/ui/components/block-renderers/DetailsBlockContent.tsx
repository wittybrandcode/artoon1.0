import React, { useCallback } from 'react';
import type { Block } from '../../../types';
import { createInlineRenderer } from '../../../inline/InlineRenderer';
import { BlockRenderer } from '../BlockRenderer';

interface DetailsBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

const inlineRenderer = createInlineRenderer();

export function DetailsBlockContent({ block, isEditable, onUpdate }: DetailsBlockContentProps) {
  const direction = block.direction || 'rtl';
  const summaryHtml = inlineRenderer.render(block.summary || []);

  const handleToggle = useCallback((e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const details = e.currentTarget;
    onUpdate({ isOpen: details.open });
  }, [onUpdate]);

  return (
    <div className="block__content" dir={direction}>
      <details open={block.isOpen} onToggle={handleToggle}>
        <summary
          contentEditable={isEditable}
          suppressContentEditableWarning
          style={{ cursor: 'pointer', fontWeight: 'bold' }}
          dangerouslySetInnerHTML={{ __html: summaryHtml }}
        />
        <div style={{ marginTop: '8px', paddingInlineStart: '20px' }}>
          {Array.isArray(block.content) && block.content.map((childBlock: Block) => (
            <BlockRenderer
              key={childBlock.id}
              block={childBlock}
              isEditable={isEditable}
              onUpdate={() => { }}
            />
          ))}
        </div>
      </details>
    </div>
  );
}
