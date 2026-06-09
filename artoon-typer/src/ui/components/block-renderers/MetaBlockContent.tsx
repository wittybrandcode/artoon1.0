import React from 'react';
import type { Block } from '../../../types';

/**
 * Meta block content
 */
interface MetaBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function MetaBlockContent({ block, isEditable, onUpdate }: MetaBlockContentProps) {
  const direction = block.direction || 'rtl';

  return (
    <div className="block__content" dir={direction}>
      <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
        <strong>📋 بيانات وصفية:</strong>
        <dl style={{ marginTop: '8px' }}>
          {(block.fields || []).map((field: any) => (
            <React.Fragment key={field.id}>
              <dt style={{ fontWeight: 'bold', marginTop: '4px' }}>{field.name}:</dt>
              <dd style={{ marginInlineStart: '20px' }}>{field.value}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
    </div>
  );
}
