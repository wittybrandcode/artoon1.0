import React, { useCallback, useRef, useEffect } from 'react';
import type { TextBlock, Block } from '../../../types';
import { createInlineRenderer } from '../../../inline/InlineRenderer';

interface TextBlockContentProps {
  block: TextBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

const inlineRenderer = createInlineRenderer();

export function TextBlockContent({ block, isEditable, onUpdate }: TextBlockContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const direction = block.direction || 'rtl';
  const isRTL = direction === 'rtl';

  useEffect(() => {
    if (!contentRef.current) return;

    const html = inlineRenderer.render(block.content);

    if (contentRef.current.innerHTML !== html) {
      const inputHandler = contentRef.current.oninput;
      contentRef.current.oninput = null;

      const isFocused = document.activeElement === contentRef.current;

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

      contentRef.current.innerHTML = html || '';

      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.oninput = inputHandler;
        }
      }, 0);

      if (isFocused && savedSelection && contentRef.current) {
        try {
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

          contentRef.current.focus();
        } catch (e) {
          // Silently ignore
        }
      }
    }
  }, [block.content, block.id]);

  const handleInput = useCallback(() => {
    if (!contentRef.current) return;

    const currentText = contentRef.current.textContent || '';

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
