import React, { useRef, useState, useCallback, useMemo } from 'react';
import type { Block, ListBlock } from '../../../types';
import { createInlineRenderer } from '../../../inline/InlineRenderer';
import {
  updateItemContentSafe,
  insertAfterItem,
  insertAsChildItem,
  indentItem,
  outdentItem,
  changeParentListType,
  findPrevSibling,
} from '../../helpers/listTreeOps';
import {
  splitTextAtCaret,
  isCaretAtStart,
  focusItemAtStart,
} from '../../helpers/caretUtils';

const inlineRenderer = createInlineRenderer();

/**
 * Individual List Item Component for Memoization
 */
const ListItemComponent = (React.memo || ((c: any) => c))(({
  item,
  depth,
  direction,
  isRTL,
  isEditable,
  marker,
  onBlur,
  onKeyDown,
  onKeyUp,
  children
}: any) => {
  const html = useMemo(() => inlineRenderer.render(item.content), [item.content]);

  return (
    <div className={`list-item list-item--depth-${depth}`} style={{ marginInlineStart: `${depth * 24}px` }}>
      <div className="list-item__main" style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        <span className="list-item__marker" style={{ minWidth: '24px', flexShrink: 0 }}>{marker}</span>
        <div
          className="list-item__content"
          contentEditable={isEditable}
          suppressContentEditableWarning
          dir={direction}
          style={{ direction, textAlign: isRTL ? 'right' : 'left', flexGrow: 1, outline: 'none' }}
          data-item-id={item.id}
          dangerouslySetInnerHTML={{ __html: html }}
          onBlur={(e) => onBlur(item.id, e)}
          onKeyDown={(e) => onKeyDown(item.id, e)}
          onKeyUp={(e) => onKeyUp(item.id, e)}
        />
      </div>
      {children}
    </div>
  );
});

interface ListBlockContentProps {
  onSplitListBlock?: (itemsA: ListBlock["items"], itemsB: ListBlock["items"]) => void;
  block: ListBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onInsertBlock?: (type: string) => void;
}

export function ListBlockContent({ block, isEditable, onUpdate, onInsertBlock, onSplitListBlock }: ListBlockContentProps) {
  const shiftTracker = useRef<{ active: boolean; itemId: string | null; time: number }>({
    active: false, itemId: null, time: 0
  });
  const lastEnterTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isBullet = block.type === 'list' ? (block.items[0]?.listType !== 'ol') : block.type === 'bullet-list';
  const direction = block.direction || 'rtl';
  const isRTL = direction === 'rtl';

  const handleBlur = useCallback((itemId: string, e: React.FocusEvent<HTMLDivElement>) => {
    const text = e.target.textContent || '';
    const newItems = updateItemContentSafe(block.items, itemId, text);
    onUpdate({ items: newItems } as any);
  }, [block.items, onUpdate]);

  const handleKeyUp = useCallback((itemId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Shift') {
      shiftTracker.current.active = false;
    }
  }, []);

  const handleKeyDown = useCallback((itemId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const now = Date.now();
      const isDoubleEnter = now - lastEnterTime.current < 500;
      lastEnterTime.current = now;

      if (isDoubleEnter) {
          onInsertBlock?.('paragraph');
          return;
      }

      const { left, right } = splitTextAtCaret(e.currentTarget as HTMLElement);
      const newItems = updateItemContentSafe(block.items, itemId, left);
      const { items: finalItems } = insertAfterItem(newItems, itemId, { id: 'li-' + Math.random().toString(36).substr(2, 9), content: right ? [{type:'plain', value: right}] : [] });
      onUpdate({ items: finalItems } as any);
      return;
    }

    if (e.key === 'Tab') {
        e.preventDefault();
        const { items: newItems, changed } = e.shiftKey ? outdentItem(block.items, itemId) : indentItem(block.items, itemId);
        if (changed) onUpdate({ items: newItems } as any);
        return;
    }

    if (e.key === 'Backspace' && isCaretAtStart(e.currentTarget as HTMLElement)) {
        const { prevSibling } = findPrevSibling(block.items, itemId);
        if (!prevSibling) {
            onUpdate({ type: 'paragraph', content: block.items[0].content } as any);
            return;
        }
    }
  }, [block.items, onUpdate, onInsertBlock]);

  const renderListItems = (items: any[], depth: number = 0, parentListType?: string): React.ReactNode => {
    let currentGroupIndex = 0;

    return items.map((item) => {
      const effectiveType = item.listType || parentListType || (isBullet ? 'ul' : 'ol');
      currentGroupIndex++;

      const marker = effectiveType === 'ul'
        ? (depth === 0 ? '•' : depth === 1 ? '◦' : '▪')
        : currentGroupIndex + '.';

      return (
        <ListItemComponent
          key={item.id}
          item={item}
          depth={depth}
          direction={direction}
          isRTL={isRTL}
          isEditable={isEditable}
          marker={marker}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        >
          {item.children && item.children.length > 0 && (
            <div className="list-item__children" style={{ marginTop: '0.25rem' }}>
              {renderListItems(item.children, depth + 1, item.childListType)}
            </div>
          )}
        </ListItemComponent>
      );
    });
  };

  return (
    <div className="block__content" ref={containerRef} dir={direction} style={{ direction, textAlign: isRTL ? 'right' : 'left' }} data-block-id={block.id}>
      {renderListItems(block.items)}
    </div>
  );
}
