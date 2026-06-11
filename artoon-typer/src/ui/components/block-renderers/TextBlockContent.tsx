import React, { useRef, useEffect, useCallback } from 'react';
import type { Block, TextBlock } from '../../../types';
import { createInlineRenderer } from '../../../inline/InlineRenderer';

const inlineRenderer = createInlineRenderer();

/**
 * Text block content (paragraph, heading, quote)
 */
interface TextBlockContentProps {
  block: TextBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function TextBlockContent({ block, isEditable, onUpdate }: TextBlockContentProps) {
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
      const inputHandler = (contentRef.current as any).oninput;
      (contentRef.current as any).oninput = null;

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
          (contentRef.current as any).oninput = inputHandler;
        }
      }, 0);

      // Restore selection if was focused
      if (isFocused && savedSelection && contentRef.current) {
        try {
          // Helper to find deepest text node
          const getDeepestTextNode = (node: Node): Node | null => {
            if (node.nodeType === Node.TEXT_NODE) return node;
            for (let i = 0; i < node.childNodes.length; i++) {
              const result = getDeepestTextNode(node.childNodes[i]);
              if (result) return result;
            }
            return null;
          };

          const textNode = getDeepestTextNode(contentRef.current);
          if (textNode) {
            const range = document.createRange();
            const sel = window.getSelection();
            const start = Math.min(savedSelection.start, textNode.textContent?.length || 0);
            const end = Math.min(savedSelection.end, textNode.textContent?.length || 0);
            range.setStart(textNode, start);
            range.setEnd(textNode, end);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        } catch (e) {
          console.warn('Could not restore selection', e);
        }
      }
    }
  }, [block.content, block.direction]);

  const handleInput = useCallback(() => {
    if (contentRef.current) {
      // For now, we'll store as a single plain text item
      // The full parser will handle complex inline conversion if needed
      const text = contentRef.current.textContent || '';
      onUpdate({
        content: [{ type: 'plain', value: text }]
      });
    }
  }, [onUpdate]);

  return (
    <div
      ref={contentRef}
      className="block__content"
      contentEditable={isEditable}
      suppressContentEditableWarning
      onInput={handleInput}
      dir={direction}
      style={{
        direction,
        textAlign: isRTL ? 'right' : 'left',
        outline: 'none',
        minHeight: '1em'
      }}
      data-block-id={block.id}
    />
  );
}
