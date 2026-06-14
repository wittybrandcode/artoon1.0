import React from 'react';
import type { Block } from '../../../types';
import { createInlineRenderer } from '../../../inline/InlineRenderer';

interface DefinitionListBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

const inlineRenderer = createInlineRenderer();

export function DefinitionListBlockContent({ block, isEditable, onUpdate }: DefinitionListBlockContentProps) {
  const direction = block.direction || 'rtl';
  const isRTL = direction === 'rtl';

  const makeId = () => 'di-' + Math.random().toString(36).slice(2, 9);

  const handleBlur = (itemId: string, field: 'term' | 'definition', e: React.FocusEvent<HTMLElement>) => {
    const text = e.currentTarget.textContent || '';
    if (!text) return;
    const updatedItems = (block.items || []).map((item: any) => {
      if (item.id === itemId) {
        const existing = item[field] || [];
        const isPlain = existing.length === 0 || existing.every((c: any) => c.type === 'plain');
        if (isPlain) {
          return { ...item, [field]: [{ type: 'plain' as const, value: text }] };
        }
      }
      return item;
    });
    onUpdate({ items: updatedItems } as any);
  };

  const handleKeyDown = (itemId: string, field: 'term' | 'definition', e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && field === 'definition') {
      e.preventDefault();
      const newItem = { id: makeId(), term: [], definition: [] };
      const items = [...(block.items || [])];
      const idx = items.findIndex((item: any) => item.id === itemId);
      items.splice(idx + 1, 0, newItem);
      onUpdate({ items } as any);
      setTimeout(() => {
        const el = document.querySelector(`[data-def-id="${newItem.id}-term"]`) as HTMLElement;
        el?.focus();
      }, 0);
      return;
    }
    if (e.key === 'Backspace') {
      const text = e.currentTarget.textContent || '';
      if (text === '' && field === 'term') {
        const items = block.items || [];
        if (items.length <= 1) return;
        e.preventDefault();
        const updatedItems = items.filter((item: any) => item.id !== itemId);
        onUpdate({ items: updatedItems } as any);
        return;
      }
    }
  };

  return (
    <div className="block__content" dir={direction} style={{ direction, textAlign: isRTL ? 'right' : 'left' }}>
      <dl>
        {(block.items || []).map((item: any) => {
          const termHtml = inlineRenderer.render(item.term || []);
          const defHtml = inlineRenderer.render(item.definition || []);

          return (
            <React.Fragment key={item.id}>
              <dt
                contentEditable={isEditable}
                suppressContentEditableWarning
                dir={direction}
                style={{ direction, textAlign: isRTL ? 'right' : 'left', fontWeight: 'bold', marginTop: '8px' }}
                data-def-id={`${item.id}-term`}
                dangerouslySetInnerHTML={{ __html: termHtml }}
                onBlur={isEditable ? (e) => handleBlur(item.id, 'term', e) : undefined}
                onKeyDown={isEditable ? (e) => handleKeyDown(item.id, 'term', e) : undefined}
              />
              <dd
                contentEditable={isEditable}
                suppressContentEditableWarning
                dir={direction}
                style={{ direction, textAlign: isRTL ? 'right' : 'left', marginInlineStart: '20px' }}
                data-def-id={`${item.id}-definition`}
                dangerouslySetInnerHTML={{ __html: defHtml }}
                onBlur={isEditable ? (e) => handleBlur(item.id, 'definition', e) : undefined}
                onKeyDown={isEditable ? (e) => handleKeyDown(item.id, 'definition', e) : undefined}
              />
            </React.Fragment>
          );
        })}
      </dl>
    </div>
  );
}
