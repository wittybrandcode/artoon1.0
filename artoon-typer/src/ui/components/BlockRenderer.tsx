/**
 * BlockRenderer
 * 
 * Renders the content of a block based on its type.
 * Handles contenteditable for text blocks.
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
import type {
  Block,
  TextBlock,
  ListBlock,
  CodeBlock,
  TableBlock,
  MediaBlock,
  InlineContent,
} from '../../types';
import { InlineRenderer, createInlineRenderer } from '../../inline/InlineRenderer';
import {
  AbbrBlockContent,
  LineBreakBlockContent,
  MetaBlockContent,
  TimeBlockContent,
  WordBreakBlockContent,
} from './block-renderers';
import { generateId } from '../../core/utils';
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
} from '../helpers/listTreeOps';
import {
  splitTextAtCaret,
  isCaretAtStart,
  isCaretAtEnd,
  focusItemAtStart,
  focusItemAtOffset,
} from '../helpers/caretUtils';

export interface BlockRendererProps {
  block: Block;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onInsertBlock?: (type: string) => void;
  onSplitListBlock?: (itemsA: ListBlock['items'], itemsB: ListBlock['items']) => void;
}

// Create inline renderer instance
const inlineRenderer = createInlineRenderer();

export function BlockRenderer({ block, isEditable, onUpdate, onInsertBlock, onSplitListBlock }: BlockRendererProps) {
  switch (block.type) {
    case 'paragraph':
    case 'heading1':
    case 'heading2':
    case 'heading3':
    case 'heading4':
    case 'heading5':
    case 'heading6':
    case 'quote':
      return (
        <TextBlockContent
          block={block as TextBlock}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'preformatted':
      return (
        <PreformattedBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'line-break':
      return <LineBreakBlockContent />;

    case 'word-break':
      return <WordBreakBlockContent />;

    case 'list':
    case 'bullet-list':
    case 'numbered-list':
      return (
        <ListBlockContent
          block={block as ListBlock}
          isEditable={isEditable}
          onUpdate={onUpdate}
          onInsertBlock={onInsertBlock}
          onSplitListBlock={onSplitListBlock}
        />
      );

    case 'definition-list':
      return (
        <DefinitionListBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'code':
      return (
        <CodeBlockContent
          block={block as CodeBlock}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'table':
      return (
        <TableBlockContent
          block={block as TableBlock}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'image':
    case 'video':
    case 'audio':
      return (
        <MediaBlockContent
          block={block as MediaBlock}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'figure':
      return (
        <FigureBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'file':
      return (
        <FileBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'divider':
      return <DividerBlockContent />;

    case 'details':
      return (
        <DetailsBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'time-block':
      return (
        <TimeBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'abbr-block':
      return (
        <AbbrBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'meta':
      return (
        <MetaBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'link-block':
      return (
        <LinkBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'custom':
      return (
        <CustomBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    default:
      return <div className="block__content">نوع بلوك غير معروف: {(block as any).type}</div>;
  }
}

/**
 * Text block content (paragraph, heading, quote)
 */
interface TextBlockContentProps {
  block: TextBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

function TextBlockContent({ block, isEditable, onUpdate }: TextBlockContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Determine direction - default to RTL
  const direction = block.direction || 'rtl';
  const isRTL = direction === 'rtl';

  // Update content when block.content changes
  useEffect(() => {
    if (!contentRef.current) return;

    const html = inlineRenderer.render(block.content);

    // Only update if HTML actually changed
    if (contentRef.current.innerHTML !== html) {
      // CRITICAL: Disable input event temporarily to prevent re-parsing
      const inputHandler = contentRef.current.oninput;
      contentRef.current.oninput = null;

      // Check if element is focused
      const isFocused = document.activeElement === contentRef.current;

      // Save selection if focused
      let savedSelection: { start: number; end: number } | null = null;
      if (isFocused) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          savedSelection = {
            start: range.startOffset,
            end: range.endOffset
          };
        }
      }

      // Update HTML
      contentRef.current.innerHTML = html || '';

      // Re-enable input event
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.oninput = inputHandler;
        }
      }, 0);

      // Restore selection if was focused
      if (isFocused && savedSelection && contentRef.current) {
        try {
          // Helper to find deepest text node
          const getDeepestTextNode = (node: Node): Node | null => {
            if (node.nodeType === Node.TEXT_NODE) return node;
            if (node.childNodes && node.childNodes.length > 0) {
              return getDeepestTextNode(node.childNodes[0]);
            }
            return null;
          };

          const textNode = getDeepestTextNode(contentRef.current);
          if (textNode) {
            const range = document.createRange();
            const maxLength = (textNode.textContent || '').length;

            const start = Math.min(Math.max(0, savedSelection.start), maxLength);
            const end = Math.min(Math.max(0, savedSelection.end), maxLength);

            range.setStart(textNode, start);
            range.setEnd(textNode, end);

            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
          }

          // Refocus if needed
          contentRef.current.focus();
        } catch (e) {
          // Silently ignore cursor restoration errors, safely reset selection to end if needed
        }
      }
    }
  }, [block.content, block.id]);

  const handleInput = useCallback(() => {
    if (!contentRef.current) return;

    const currentText = contentRef.current.textContent || '';

    // Update only if plain text (preserve inline components like links)
    if (!block.content || block.content.length === 0 ||
      (block.content.length === 1 && block.content[0].type === 'plain')) {
      onUpdate({
        content: [{ type: 'plain', value: currentText }]
      } as Partial<Block>);
    }
  }, [block.content, onUpdate]);

  return (
    <div
      ref={contentRef}
      className="block__content"
      contentEditable={isEditable}
      suppressContentEditableWarning
      dir={direction}
      style={{
        direction: direction,
        textAlign: isRTL ? 'right' : 'left'
      }}
      data-placeholder={isRTL ? "اكتب شيئاً..." : "Type something..."}
      data-block-id={block.id}
      onInput={handleInput}
    />
  );
}

/**
 * List block content — interactive, ARTOON-aligned
 * Supports: editing (onBlur), Enter/Backspace, Tab/Shift+Tab nesting
 */
interface ListBlockContentProps {
  block: ListBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onInsertBlock?: (type: string) => void;
  onSplitListBlock?: (itemsA: ListBlock['items'], itemsB: ListBlock['items']) => void;
}

function ListBlockContent({ block, isEditable, onUpdate, onInsertBlock, onSplitListBlock }: ListBlockContentProps) {

  // Shift-alone tracker for child creation
  const shiftTracker = useRef<{ active: boolean; itemId: string | null; time: number }>({
    active: false, itemId: null, time: 0
  });

  // Double Enter tracker
  const lastEnterTime = useRef<number>(0);

  // Derive isBullet from items, not block.type
  const isBullet = block.type === 'list'
    ? (block.items[0]?.listType !== 'ol')
    : block.type === 'bullet-list';
  const direction = block.direction || 'rtl';
  const isRTL = direction === 'rtl';

  // State to track which list item has its context menu open
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Tree helpers imported from listTreeOps ────────────────────────

  /** Set listType directly on the clicked item (uses React state) */
  const changeParentListTypeWrapper = (itemId: string, newType: 'ul' | 'ol' | 'dl', _depth: number) => {
    setActiveMenuId(null);
    const { items: updatedItems, changed } = setItemChildListType(block.items, itemId, newType);
    if (changed) {
      onUpdate({ items: updatedItems } as any);
    }
  };

  // ── Event handlers ──────────────────────────────────────────────

  const handleBlur = (itemId: string, e: React.FocusEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    if (!text) return; // Don't save empty — Backspace handler deals with deletion
    const updatedItems = updateItemContentSafe(block.items, itemId, text);
    onUpdate({ items: updatedItems } as any);
  };

  const handleKeyDown = (itemId: string, e: React.KeyboardEvent<HTMLDivElement>) => {
    // Ctrl+Shift+7 -> Numbered list
    if (e.ctrlKey && e.shiftKey && e.key === '7') {
      e.preventDefault();
      const { items: updatedItems, changed } = changeParentListType(block.items, itemId, 'ol');
      if (changed) {
        onUpdate({ items: updatedItems } as any);
      } else {
        // Update item's own listType directly
        const newItems = block.items.map(i => i.id === itemId ? { ...i, listType: 'ol' } : i);
        onUpdate({ items: newItems } as any);
      }
      return;
    }

    // Ctrl+Shift+8 -> Bulleted list
    if (e.ctrlKey && e.shiftKey && e.key === '8') {
      e.preventDefault();
      const { items: updatedItems, changed } = changeParentListType(block.items, itemId, 'ul');
      if (changed) {
        onUpdate({ items: updatedItems } as any);
      } else {
        // Update item's own listType directly
        const newItems = block.items.map(i => i.id === itemId ? { ...i, listType: 'ul' } : i);
        onUpdate({ items: newItems } as any);
      }
      return;
    }

    // Shift alone → track for child creation on keyup
    if (e.key === 'Shift' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      shiftTracker.current = { active: true, itemId: itemId, time: Date.now() };
      return;
    }

    // Any other key pressed → Shift is being used as modifier, cancel tracking
    if (shiftTracker.current.active) {
      shiftTracker.current.active = false;
    }

    // Shift+Enter → also create child item (backup shortcut)
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

    // Enter → insert new item after current (same level)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      const now = Date.now();
      const timeSinceLastEnter = now - lastEnterTime.current;
      lastEnterTime.current = now;

      // Split text at caret position
      const el = e.currentTarget;
      const fullText = el.textContent || '';
      const { textBefore, textAfter, isSplitting } = splitTextAtCaret(el);

      // Double Enter quickly < 400ms to exit list
      if (timeSinceLastEnter < 400) {
        const textToEvaluate = isSplitting ? textBefore : fullText;
        if (textToEvaluate.trim() === '') {
          // Empty item -> outdent it or remove it entirely
          const { items: updatedItems, changed } = outdentItem(block.items, itemId);
          if (changed) {
            onUpdate({ items: updatedItems } as any);
          } else {
            // Find its index to see if we're in the middle of the list
            const topLevelIndex = block.items.findIndex(i => i.id === itemId);
            if (topLevelIndex !== -1 && topLevelIndex < block.items.length - 1 && onSplitListBlock) {
              // Split the list at this point
              const itemsA = block.items.slice(0, topLevelIndex);
              const itemsB = block.items.slice(topLevelIndex + 1);
              onSplitListBlock(itemsA, itemsB);
            } else {
              // It's the last item (or first alone), remove it and insert a paragraph below
              const deletedItems = removeItem(block.items, itemId);
              onUpdate({ items: deletedItems } as any);
              if (onInsertBlock) onInsertBlock('paragraph');
            }
          }
          return;
        }
      }

      // Text Splitting: split text at caret and create new item
      // 1. Update current item with textBefore
      let updatedItems = updateItemContentSafe(block.items, itemId, textBefore);

      // 2. Insert new item with textAfter
      const newItemId = makeId();
      const newItem = {
        id: newItemId,
        content: textAfter ? [{ type: 'plain' as const, value: textAfter }] : []
      };

      const insertResult = insertAfterItem(updatedItems, itemId, newItem);
      updatedItems = insertResult.items;

      onUpdate({ items: updatedItems } as any);

      // Focus new item after render
      focusItemAtStart(newItem.id);
      return;
    }

    // Text Merging on Backspace
    if (e.key === 'Backspace') {
      const el = e.currentTarget;
      const text = el.textContent || '';
      const isAtStart = isCaretAtStart(el);

      if (isAtStart) {
        e.preventDefault();

        // Use imported findPrevSibling from listTreeOps
        const { prevSibling } = findPrevSibling(block.items, itemId);

        if (prevSibling) {
          // Merge text with previous sibling
          const prevText = (prevSibling.content || []).map((c: any) => c.type === 'plain' ? c.value : '').join('');
          const mergeIndex = prevText.length;
          const mergedText = prevText + text;

          let updatedItems = updateItemContentSafe(block.items, prevSibling.id, mergedText); // Update previous sibling

          // Elevate children if any, then remove current item
          updatedItems = removeItem(updatedItems, itemId);

          onUpdate({ items: updatedItems } as any);

          // Restore cursor precisely at merge point
          focusItemAtOffset(prevSibling!.id, mergeIndex);
          return;
        } else if (text === '') {
          // No previous sibling and text is empty -> delete/outdent
          if (block.items.length <= 1 && (!block.items[0].children || block.items[0].children.length === 0)) return;
          const updatedItems = removeItem(block.items, itemId);
          if (updatedItems.length === 0) return;
          onUpdate({ items: updatedItems } as any);
          return;
        }
      }
    }

    // Tab → indent
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const { items: updatedItems, changed } = indentItem(block.items, itemId);
      if (changed) onUpdate({ items: updatedItems } as any);
      return;
    }

    // Shift+Tab → outdent
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const { items: updatedItems, changed } = outdentItem(block.items, itemId);
      if (changed) onUpdate({ items: updatedItems } as any);
      return;
    }

    // Smart Arrow Navigation
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const el = e.currentTarget;
      const atBoundary = e.key === 'ArrowUp' ? isCaretAtStart(el) : isCaretAtEnd(el);

      if (atBoundary) {
        // Find all focusable items in the DOM belonging to this block (ordered vertically)
        const allItems = Array.from(document.querySelectorAll(`[data-block-id="${block.id}"] .list-item__input`)) as HTMLElement[];
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

  /** Shift-alone → create new child item on key release */
  const handleKeyUp = (itemId: string, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Shift') return;
    const tracker = shiftTracker.current;
    // Only fire if: (1) tracker is active, (2) same item, (3) at least 50ms elapsed
    if (!tracker.active || tracker.itemId !== itemId) return;
    if (Date.now() - tracker.time < 50) return;
    // Reset tracker immediately to prevent double-fire
    shiftTracker.current = { active: false, itemId: null, time: 0 };

    const newItem = { id: makeId(), content: [] };
    const { items: updatedItems, inserted } = insertAsChildItem(block.items, itemId, newItem);

    if (inserted) {
      onUpdate({ items: updatedItems } as any);
      focusItemAtStart(newItem.id);
    }
  };


  // ── Render ──────────────────────────────────────────────────────

  const renderListItems = (items: typeof block.items, depth: number = 0, parentIndex: number[] = [], parentListType?: string) => {
    let currentGroupType: string | null = null;
    let currentGroupIndex = 0;

    return items.map((item, index) => {
      const html = inlineRenderer.render(item.content);

      // Use item's own listType first, then parent's childListType, then block type
      const effectiveType = item.listType || parentListType || (isBullet ? 'ul' : 'ol');
      const isItemBullet = effectiveType === 'ul';

      if (effectiveType !== currentGroupType) {
        currentGroupType = effectiveType;
        currentGroupIndex = 1;
      } else {
        currentGroupIndex++;
      }

      // Use only local index for the marker (matching HTML <ol> behavior where each level restarts at 1)
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
              {renderListItems(item.children, depth + 1, [], item.childListType)}
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

/**
 * Code block content - WYSIWYG Style
 */
interface CodeBlockContentProps {
  block: CodeBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

function CodeBlockContent({ block, isEditable, onUpdate }: CodeBlockContentProps) {
  const codeRef = useRef<HTMLElement>(null);

  const handleCodeChange = useCallback(() => {
    if (codeRef.current) {
      const newCode = codeRef.current.textContent || '';
      onUpdate({ code: newCode } as Partial<CodeBlock>);
    }
  }, [onUpdate]);

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ language: e.target.value } as Partial<CodeBlock>);
  }, [onUpdate]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(block.code);
  }, [block.code]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    }
  }, []);

  return (
    <div className="block__content code-block-wysiwyg">
      <div className="code-header">
        <select
          value={block.language || 'plaintext'}
          onChange={handleLanguageChange}
          disabled={!isEditable}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
          <option value="cpp">C++</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="json">JSON</option>
          <option value="xml">XML</option>
          <option value="sql">SQL</option>
          <option value="bash">Bash</option>
          <option value="plaintext">Plain Text</option>
        </select>
        <button
          className="btn btn--icon"
          title="نسخ الكود"
          onClick={handleCopy}
        >
          📋
        </button>
      </div>
      <pre className={`language-${block.language || 'plaintext'}`} dir="ltr">
        <code
          ref={codeRef}
          contentEditable={isEditable}
          suppressContentEditableWarning
          onInput={handleCodeChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          dir="ltr"
          style={{
            direction: 'ltr',
            textAlign: 'left',
          }}
        >
          {block.code}
        </code>
      </pre>
    </div>
  );
}

/**
 * Table block content
 */
interface TableBlockContentProps {
  block: TableBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

function TableBlockContent({ block, isEditable, onUpdate }: TableBlockContentProps) {
  const direction = block.direction || 'rtl';
  const isRTL = direction === 'rtl';

  return (
    <div className="block__content" dir={direction} style={{ direction, textAlign: isRTL ? 'right' : 'left' }} data-block-id={block.id}>
      <table>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={row.id}>
              {row.cells.map((cell) => {
                const html = inlineRenderer.render(cell.content);
                const CellTag = row.isHeader ? 'th' : 'td';

                return (
                  <CellTag
                    key={cell.id}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    dir={direction}
                    style={{ direction, textAlign: isRTL ? 'right' : 'left' }}
                    data-block-id={block.id}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Media block content (image, video, audio)
 */
interface MediaBlockContentProps {
  block: MediaBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

function MediaBlockContent({ block, isEditable, onUpdate }: MediaBlockContentProps) {
  const [imageStatus, setImageStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = React.useState(block.src);
  const captionHtml = block.caption ? inlineRenderer.render(block.caption) : '';

  // Reset status when src changes
  React.useEffect(() => {
    setImageStatus('loading');
    setImageSrc(block.src);
  }, [block.src]);

  const handleImageLoad = useCallback(() => {
    setImageStatus('loaded');
  }, []);

  const handleImageError = useCallback(() => {
    setImageStatus('error');
    console.error('Failed to load media:', block.src);
  }, [block.src]);

  const handleRetry = useCallback(() => {
    setImageStatus('loading');
    // Add timestamp to force reload
    setImageSrc(block.src + (block.src.includes('?') ? '&' : '?') + 'retry=' + Date.now());
  }, [block.src]);

  const renderMedia = () => {
    switch (block.type) {
      case 'image':
        return (
          <>
            {imageStatus === 'loading' && (
              <div
                className="media-loading"
                style={{
                  padding: '40px',
                  background: '#f8f9fa',
                  textAlign: 'center',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                <div style={{ color: '#6c757d', fontSize: '14px' }}>
                  جاري تحميل الصورة...
                </div>
              </div>
            )}

            {imageStatus === 'error' && (
              <div
                className="media-error"
                style={{
                  padding: '40px',
                  background: '#fff3cd',
                  border: '2px dashed #ffc107',
                  textAlign: 'center',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#856404' }}>
                  فشل تحميل الصورة
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#856404',
                    wordBreak: 'break-all',
                    marginBottom: '16px',
                    padding: '8px',
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: '4px',
                  }}
                >
                  {block.src}
                </div>
                <button
                  onClick={handleRetry}
                  style={{
                    padding: '8px 16px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  🔄 إعادة المحاولة
                </button>
              </div>
            )}

            <img
              src={imageSrc}
              alt={block.alt || ''}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                width: block.width || 'auto',
                height: block.height || 'auto',
                maxWidth: '100%',
                display: imageStatus === 'loaded' ? 'block' : 'none',
              }}
            />
          </>
        );
      case 'video':
        return (
          <video
            src={block.src}
            controls
            onLoadedData={handleImageLoad}
            onError={handleImageError}
            style={{
              width: block.width || '100%',
              height: block.height || 'auto',
              maxWidth: '100%',
            }}
          />
        );
      case 'audio':
        return (
          <audio
            src={block.src}
            controls
            onLoadedData={handleImageLoad}
            onError={handleImageError}
            style={{ width: '100%' }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="block__content">
      {block.src ? (
        <>
          {renderMedia()}
          {captionHtml && imageStatus === 'loaded' && (
            <div
              className="image-caption"
              contentEditable={isEditable}
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: captionHtml }}
            />
          )}
        </>
      ) : (
        <div className="media-placeholder">
          {block.type === 'image' && '🖼 انقر لإضافة صورة'}
          {block.type === 'video' && '🎬 انقر لإضافة فيديو'}
          {block.type === 'audio' && '🔊 انقر لإضافة صوت'}
        </div>
      )}
    </div>
  );
}

/**
 * Divider block content
 */
function DividerBlockContent() {
  return (
    <div className="block__content">
      <hr />
    </div>
  );
}

/**
 * Preformatted block content
 */
interface PreformattedBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

function PreformattedBlockContent({ block, isEditable, onUpdate }: PreformattedBlockContentProps) {
  const direction = block.direction || 'rtl';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ content: e.target.value });
  };

  return (
    <div className="block__content">
      <textarea
        className="preformatted-content"
        value={block.content || ''}
        onChange={handleChange}
        readOnly={!isEditable}
        dir={direction}
        style={{
          direction,
          fontFamily: 'monospace',
          whiteSpace: 'pre',
          width: '100%',
          minHeight: '100px',
          padding: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      />
    </div>
  );
}

/**
 * Definition list block content
 */
interface DefinitionListBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

function DefinitionListBlockContent({ block, isEditable, onUpdate }: DefinitionListBlockContentProps) {
  const direction = block.direction || 'rtl';
  const isRTL = direction === 'rtl';

  const makeId = () => 'di-' + Math.random().toString(36).slice(2, 9);

  /** Save term or definition on blur — smart: saves PlainText-only fields,
   *  protects fields with InlineComponent (bold, links, etc.) */
  const handleBlur = (itemId: string, field: 'term' | 'definition', e: React.FocusEvent<HTMLElement>) => {
    const text = e.currentTarget.textContent || '';
    if (!text) return;
    const updatedItems = (block.items || []).map((item: any) => {
      if (item.id === itemId) {
        const existing = item[field] || [];
        // Safe to save: empty or PlainText only — no InlineComponents
        const isPlain = existing.length === 0 || existing.every((c: any) => c.type === 'plain');
        if (isPlain) {
          return { ...item, [field]: [{ type: 'plain' as const, value: text }] };
        }
      }
      return item;
    });
    onUpdate({ items: updatedItems } as any);
  };

  /** Enter on dd → add new definition item; Backspace on empty → delete */
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

/**
 * Figure block content
 */
interface FigureBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

function FigureBlockContent({ block, isEditable, onUpdate }: FigureBlockContentProps) {
  const [mediaStatus, setMediaStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  const captionHtml = block.caption ? inlineRenderer.render(block.caption) : '';

  const handleMediaLoad = useCallback(() => {
    setMediaStatus('loaded');
  }, []);

  const handleMediaError = useCallback(() => {
    setMediaStatus('error');
    console.error('Failed to load figure media:', block.src);
  }, [block.src]);

  const handleRetry = useCallback(() => {
    setMediaStatus('loading');
    // Force reload by updating key
    onUpdate({ src: block.src + (block.src.includes('?') ? '&' : '?') + 'retry=' + Date.now() });
  }, [block.src, onUpdate]);

  const renderMedia = () => {
    switch (block.mediaType) {
      case 'image':
        return (
          <>
            {mediaStatus === 'loading' && (
              <div style={{ padding: '40px', background: '#f8f9fa', textAlign: 'center', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                <div style={{ color: '#6c757d', fontSize: '14px' }}>جاري تحميل الصورة...</div>
              </div>
            )}
            {mediaStatus === 'error' && (
              <div style={{ padding: '40px', background: '#fff3cd', border: '2px dashed #ffc107', textAlign: 'center', borderRadius: '8px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#856404' }}>فشل تحميل الصورة</div>
                <button
                  onClick={handleRetry}
                  style={{
                    padding: '8px 16px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  🔄 إعادة المحاولة
                </button>
              </div>
            )}
            <img
              src={block.src || ''}
              alt={block.alt || ''}
              onLoad={handleMediaLoad}
              onError={handleMediaError}
              style={{
                maxWidth: '100%',
                display: mediaStatus === 'loaded' ? 'block' : 'none',
              }}
            />
          </>
        );
      case 'video':
        return (
          <video
            src={block.src || ''}
            controls
            onLoadedData={handleMediaLoad}
            onError={handleMediaError}
            style={{ maxWidth: '100%' }}
          />
        );
      case 'audio':
        return (
          <audio
            src={block.src || ''}
            controls
            onLoadedData={handleMediaLoad}
            onError={handleMediaError}
          />
        );
      default:
        return <img src={block.src || ''} alt={block.alt || ''} style={{ maxWidth: '100%' }} />;
    }
  };

  return (
    <div className="block__content">
      <figure>
        {block.src ? renderMedia() : <div style={{ padding: '20px', background: '#f0f0f0', textAlign: 'center' }}>🖼️ لا توجد وسائط</div>}
        {captionHtml && mediaStatus === 'loaded' && (
          <figcaption
            contentEditable={isEditable}
            suppressContentEditableWarning
            style={{ marginTop: '8px', fontStyle: 'italic', fontSize: '0.9em' }}
            dangerouslySetInnerHTML={{ __html: captionHtml }}
          />
        )}
      </figure>
    </div>
  );
}

/**
 * File block content
 */
interface FileBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

function FileBlockContent({ block, isEditable, onUpdate }: FileBlockContentProps) {
  const direction = block.direction || 'rtl';

  return (
    <div className="block__content" dir={direction}>
      <a
        href={block.src || '#'}
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

/**
 * Details block content
 */
interface DetailsBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

function DetailsBlockContent({ block, isEditable, onUpdate }: DetailsBlockContentProps) {
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

/**
 * Link block content — interactive, ARTOON-aligned
 * Mirrors ARTOON LinkNode: url, text, modifiers
 */
interface LinkBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

function LinkBlockContent({ block, isEditable, onUpdate }: LinkBlockContentProps) {
  const direction = block.direction || 'rtl';
  const [isEditing, setIsEditing] = useState(!block.url);
  const [localUrl, setLocalUrl] = useState(block.url || '');
  const [localText, setLocalText] = useState(block.text || '');

  // Sync state when block changes externally
  useEffect(() => {
    setLocalUrl(block.url || '');
    setLocalText(block.text || '');
  }, [block.url, block.text]);

  const handleSave = () => {
    if (!localUrl.trim()) return;
    onUpdate({
      url: localUrl.trim(),
      text: localText.trim() || localUrl.trim(),
      modifiers: block.modifiers || [],
    } as any);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      if (block.url) setIsEditing(false);
    }
  };

  // Edit mode
  if (isEditable && isEditing) {
    return (
      <div className="block__content" dir={direction}>
        <div style={{
          background: 'var(--color-bg-secondary, #f8f9fa)',
          border: '2px solid var(--color-primary, #0066cc)',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary, #0066cc)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🔗 رابط مستقل ({">.a::"})
          </div>
          <input
            type="text"
            placeholder="https://example.com"
            value={localUrl}
            onChange={e => setLocalUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            dir="ltr"
            style={{
              padding: '8px 12px',
              border: '1px solid var(--color-border-default, #ddd)',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'monospace',
              outline: 'none',
              background: 'var(--color-bg-primary, #fff)',
              color: 'var(--color-text-primary, #1a1a1a)',
            }}
            autoFocus
          />
          <input
            type="text"
            placeholder="نص الرابط"
            value={localText}
            onChange={e => setLocalText(e.target.value)}
            onKeyDown={handleKeyDown}
            dir={direction}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--color-border-default, #ddd)',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              background: 'var(--color-bg-primary, #fff)',
              color: 'var(--color-text-primary, #1a1a1a)',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <code style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #999)', direction: 'ltr' }}>
              {'>.a:: '}{localUrl || 'url'}{'; '}{localText || 'text'}
            </code>
            <button
              onClick={handleSave}
              disabled={!localUrl.trim()}
              style={{
                padding: '6px 16px',
                background: localUrl.trim() ? 'var(--color-primary, #0066cc)' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: localUrl.trim() ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              حفظ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Preview mode
  return (
    <div className="block__content" dir={direction}>
      <div
        onClick={() => isEditable && setIsEditing(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          background: 'var(--color-primary, #0066cc)',
          color: 'white',
          borderRadius: '6px',
          cursor: isEditable ? 'pointer' : 'default',
          fontSize: '14px',
          textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}
        title={block.url || '#'}
      >
        🔗 {block.text || block.url || 'رابط'}
      </div>
    </div>
  );
}

/**
 * Custom block content
 */
interface CustomBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

function CustomBlockContent({ block, isEditable, onUpdate }: CustomBlockContentProps) {
  const direction = block.direction || 'rtl';

  // Check if children exist and are valid
  const hasChildren = block.children &&
    Array.isArray(block.children) &&
    block.children.length > 0;

  // Show placeholder if empty
  if (!hasChildren) {
    return (
      <div
        className="block__content custom-block custom-block--empty"
        dir={direction}
      >
        <span style={{ color: '#999', fontStyle: 'italic' }}>
          بلوك مخصص فارغ: {block.name}
        </span>
      </div>
    );
  }

  // Render children blocks
  return (
    <div
      className={`block__content custom-block custom-block-${block.name}`}
      dir={direction}
    >
      {block.children.map((child: any) => {
        // Convert child to proper Block type
        const childBlock: Block = {
          id: child.id || generateId(),
          type: child.type || 'paragraph',
          direction: direction,
          content: Array.isArray(child.content) ? child.content : [],
        } as any;

        return (
          <BlockRenderer
            key={childBlock.id}
            block={childBlock}
            isEditable={isEditable}
            onUpdate={() => { }}
          />
        );
      })}
    </div>
  );
}

export default BlockRenderer;
