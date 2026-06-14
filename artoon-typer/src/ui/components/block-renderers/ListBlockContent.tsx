import React, { useRef, useState, useEffect } from 'react';
import type { ListBlock, Block } from '../../../types';
import { createInlineRenderer } from '../../../inline/InlineRenderer';
import {
  focusItemAtStart,
  focusItemAtOffset,
  splitTextAtCaret,
  isCaretAtStart,
  isCaretAtEnd,
} from '../../helpers/caretUtils';
import {
  makeId,
  updateItemContentSafe,
  insertAfterItem,
  insertAsChildItem,
  removeItem,
  indentItem,
  outdentItem,
  changeParentListType,
  setItemChildListType,
  findPrevSibling,
} from '../../helpers/listTreeOps';

interface ListBlockContentProps {
  block: ListBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onInsertBlock?: (type: string) => void;
  onSplitListBlock?: (itemsA: ListBlock['items'], itemsB: ListBlock['items']) => void;
}

const inlineRenderer = createInlineRenderer();

export function ListBlockContent({ block, isEditable, onUpdate, onInsertBlock, onSplitListBlock }: ListBlockContentProps) {
  const shiftTracker = useRef<{ active: boolean; itemId: string | null; time: number }>({
    active: false, itemId: null, time: 0
  });

  const lastEnterTime = useRef<number>(0);

  const isBullet = block.type === 'list'
    ? (block.items[0]?.listType !== 'ol')
    : block.type === 'bullet-list';
  const direction = block.direction || 'rtl';
  const isRTL = direction === 'rtl';

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeParentListTypeWrapper = (itemId: string, newType: 'ul' | 'ol' | 'dl', _depth: number) => {
    setActiveMenuId(null);
    const { items: updatedItems, changed } = setItemChildListType(block.items, itemId, newType);
    if (changed) {
      onUpdate({ items: updatedItems } as any);
    }
  };

  const handleBlur = (itemId: string, e: React.FocusEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    if (!text) return;
    const updatedItems = updateItemContentSafe(block.items, itemId, text);
    onUpdate({ items: updatedItems } as any);
  };

  const handleKeyDown = (itemId: string, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey && e.shiftKey && e.key === '7') {
      e.preventDefault();
      const { items: updatedItems, changed } = changeParentListType(block.items, itemId, 'ol');
      if (changed) {
        onUpdate({ items: updatedItems } as any);
      } else {
        const newItems = block.items.map(i => i.id === itemId ? { ...i, listType: 'ol' } : i);
        onUpdate({ items: newItems } as any);
      }
      return;
    }

    if (e.ctrlKey && e.shiftKey && e.key === '8') {
      e.preventDefault();
      const { items: updatedItems, changed } = changeParentListType(block.items, itemId, 'ul');
      if (changed) {
        onUpdate({ items: updatedItems } as any);
      } else {
        const newItems = block.items.map(i => i.id === itemId ? { ...i, listType: 'ul' } : i);
        onUpdate({ items: newItems } as any);
      }
      return;
    }

    if (e.key === 'Shift' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      shiftTracker.current = { active: true, itemId: itemId, time: Date.now() };
      return;
    }

    if (shiftTracker.current.active) {
      shiftTracker.current.active = false;
    }

    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      const newItem = { id: makeId(), content: [] };
      const { items: updatedItems, inserted } = insertAsChildItem(block.items, itemId, newItem);

      if (inserted) {
        onUpdate({ items: updatedItems } as any);
        focusItemAtStart(newItem.id);
      }
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      const now = Date.now();
      const timeSinceLastEnter = now - lastEnterTime.current;
      lastEnterTime.current = now;

      const el = e.currentTarget;
      const fullText = el.textContent || '';
      const { textBefore, textAfter, isSplitting } = splitTextAtCaret(el);

      if (timeSinceLastEnter < 400) {
        const textToEvaluate = isSplitting ? textBefore : fullText;
        if (textToEvaluate.trim() === '') {
          const { items: updatedItems, changed } = outdentItem(block.items, itemId);
          if (changed) {
            onUpdate({ items: updatedItems } as any);
          } else {
            const topLevelIndex = block.items.findIndex(i => i.id === itemId);
            if (topLevelIndex !== -1 && topLevelIndex < block.items.length - 1 && onSplitListBlock) {
              const itemsA = block.items.slice(0, topLevelIndex);
              const itemsB = block.items.slice(topLevelIndex + 1);
              onSplitListBlock(itemsA, itemsB);
            } else {
              const deletedItems = removeItem(block.items, itemId);
              onUpdate({ items: deletedItems } as any);
              if (onInsertBlock) onInsertBlock('paragraph');
            }
          }
          return;
        }
      }

      let updatedItems = updateItemContentSafe(block.items, itemId, textBefore);
      const newItemId = makeId();
      const newItem = {
        id: newItemId,
        content: textAfter ? [{ type: 'plain' as const, value: textAfter }] : []
      };

      const insertResult = insertAfterItem(updatedItems, itemId, newItem);
      updatedItems = insertResult.items;

      onUpdate({ items: updatedItems } as any);
      focusItemAtStart(newItem.id);
      return;
    }

    if (e.key === 'Backspace') {
      const el = e.currentTarget;
      const text = el.textContent || '';
      const isAtStart = isCaretAtStart(el);

      if (isAtStart) {
        e.preventDefault();
        const { prevSibling } = findPrevSibling(block.items, itemId);

        if (prevSibling) {
          const prevText = (prevSibling.content || []).map((c: any) => c.type === 'plain' ? c.value : '').join('');
          const mergeIndex = prevText.length;
          const mergedText = prevText + text;

          let updatedItems = updateItemContentSafe(block.items, prevSibling.id, mergedText);
          updatedItems = removeItem(updatedItems, itemId);

          onUpdate({ items: updatedItems } as any);
          focusItemAtOffset(prevSibling!.id, mergeIndex);
          return;
        } else if (text === '') {
          if (block.items.length <= 1 && (!block.items[0].children || block.items[0].children.length === 0)) return;
          const updatedItems = removeItem(block.items, itemId);
          if (updatedItems.length === 0) return;
          onUpdate({ items: updatedItems } as any);
          return;
        }
      }
    }

    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const { items: updatedItems, changed } = indentItem(block.items, itemId);
      if (changed) onUpdate({ items: updatedItems } as any);
      return;
    }

    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const { items: updatedItems, changed } = outdentItem(block.items, itemId);
      if (changed) onUpdate({ items: updatedItems } as any);
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const el = e.currentTarget;
      const atBoundary = e.key === 'ArrowUp' ? isCaretAtStart(el) : isCaretAtEnd(el);

      if (atBoundary) {
        const allItems = Array.from(document.querySelectorAll(`[data-block-id="${block.id}"] .list-item__content`)) as HTMLElement[];
        const currentIndex = allItems.findIndex(node => node === el);

        if (currentIndex !== -1) {
          if (e.key === 'ArrowUp' && currentIndex > 0) {
            e.preventDefault();
            allItems[currentIndex - 1].focus();
          } else if (e.key === 'ArrowDown' && currentIndex < allItems.length - 1) {
            e.preventDefault();
            allItems[currentIndex + 1].focus();
          }
        }
      }
    }
  };

  const handleKeyUp = (itemId: string, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Shift') return;
    const tracker = shiftTracker.current;
    if (!tracker.active || tracker.itemId !== itemId) return;
    if (Date.now() - tracker.time < 50) return;
    shiftTracker.current = { active: false, itemId: null, time: 0 };

    const newItem = { id: makeId(), content: [] };
    const { items: updatedItems, inserted } = insertAsChildItem(block.items, itemId, newItem);

    if (inserted) {
      onUpdate({ items: updatedItems } as any);
      focusItemAtStart(newItem.id);
    }
  };

  const renderListItems = (items: any[], depth: number = 0, parentListType?: string) => {
    let currentGroupType: string | null = null;
    let currentGroupIndex = 0;

    return items.map((item) => {
      const html = inlineRenderer.render(item.content);
      const effectiveType = item.listType || parentListType || (isBullet ? 'ul' : 'ol');
      const isItemBullet = effectiveType === 'ul';

      if (effectiveType !== currentGroupType) {
        currentGroupType = effectiveType;
        currentGroupIndex = 1;
      } else {
        currentGroupIndex++;
      }

      const marker = isItemBullet
        ? (depth === 0 ? '•' : depth === 1 ? '◦' : '▪')
        : currentGroupIndex + '.';

      const isMenuOpen = activeMenuId === item.id;

      return (
        <div key={item.id} className={`list-item list-item--depth-${depth}`} style={{ marginInlineStart: `${depth * 24}px` }}>
          <div className="list-item__main" style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
            {isEditable && (
              <div className="list-item__actions" contentEditable={false}>
                <button
                  className="list-item__menu-trigger"
                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : item.id); }}
                  title="تغيير نوع القائمة"
                >
                  <i className="fas fa-ellipsis-vertical"></i>
                </button>
                {isMenuOpen && (
                  <div className="list-item__context-menu" dir={direction}>
                    <button onClick={(e) => { e.stopPropagation(); changeParentListTypeWrapper(item.id, 'ul', depth); }}>
                      <i className="fas fa-list-ul menu-icon"></i> قائمة نقطية
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); changeParentListTypeWrapper(item.id, 'ol', depth); }}>
                      <i className="fas fa-list-ol menu-icon"></i> قائمة مرقمة
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); changeParentListTypeWrapper(item.id, 'dl', depth); }}>
                      <i className="fas fa-book-open menu-icon"></i> قائمة تعريفات
                    </button>
                  </div>
                )}
              </div>
            )}
            <span className="list-item__marker" style={{ minWidth: '24px', flexShrink: 0 }}>{marker}</span>
            <div
              className="list-item__content"
              contentEditable={isEditable}
              suppressContentEditableWarning
              dir={direction}
              style={{ direction, textAlign: isRTL ? 'right' : 'left', flexGrow: 1 }}
              data-block-id={block.id}
              data-item-id={item.id}
              dangerouslySetInnerHTML={{ __html: html }}
              onBlur={isEditable ? (e) => handleBlur(item.id, e) : undefined}
              onKeyDown={isEditable ? (e) => handleKeyDown(item.id, e) : undefined}
              onKeyUp={isEditable ? (e) => handleKeyUp(item.id, e) : undefined}
            />
          </div>
          {item.children && item.children.length > 0 && (
            <div className="list-item__children" style={{ marginTop: '0.25rem' }}>
              {renderListItems(item.children, depth + 1, item.childListType)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="block__content" ref={containerRef} dir={direction} style={{ direction, textAlign: isRTL ? 'right' : 'left' }} data-block-id={block.id}>
      {renderListItems(block.items)}
    </div>
  );
}
