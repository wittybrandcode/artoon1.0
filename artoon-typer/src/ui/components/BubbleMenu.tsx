/**
 * BubbleMenu - Professional Floating Formatting Menu
 * 
 * Material Design inspired bubble menu that appears on text selection.
 * Features smooth animations, intelligent positioning, and active state tracking.
 * 
 * @module BubbleMenu
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { MarkType } from '../../types';
import { Toolbar } from '../../design-system/Toolbar';
import {
  Bold, Italic, Underline, Strikethrough, Highlighter, Link, Code
} from 'lucide-react';

export interface BubbleMenuProps {
  /** Callback when a format is toggled */
  onFormat: (format: MarkType) => void;
  /** Callback when link button is clicked */
  onLink: () => void;
  /** Active marks in current selection */
  activeMarks?: MarkType[];
  /** Whether the menu is disabled */
  disabled?: boolean;
}

/**
 * Professional Bubble Menu Component
 * 
 * Appears above selected text with formatting options.
 * Uses Material Design principles for visual hierarchy and interaction.
 */
export function BubbleMenu({
  onFormat,
  onLink,
  activeMarks = [],
  disabled = false
}: BubbleMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  /**
   * Calculate optimal menu position based on selection
   */
  const calculatePosition = useCallback((rect: DOMRect) => {
    const menuWidth = 320;
    const menuHeight = 48;
    const spacing = 12;
    const viewportPadding = 16;

    // Center horizontally on selection
    let left = rect.left + (rect.width / 2) - (menuWidth / 2);
    let top = rect.top - menuHeight - spacing + window.scrollY;

    // Keep within viewport horizontally
    const maxLeft = window.innerWidth - menuWidth - viewportPadding;
    const minLeft = viewportPadding;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    // If no space above, show below selection
    if (rect.top - menuHeight - spacing < 0) {
      top = rect.bottom + spacing + window.scrollY;
    }

    return { top, left };
  }, []);

  /**
   * Handle text selection changes
   */
  useEffect(() => {
    const handleSelectionChange = () => {
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Use RAF for smooth positioning
      animationFrameRef.current = requestAnimationFrame(() => {
        const selection = window.getSelection();

        // Hide if no selection or collapsed
        if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
          setIsVisible(false);
          setShowColorPicker(false);
          return;
        }

        // Get selection bounding rect
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Calculate and set position
        const pos = calculatePosition(rect);
        setPosition(pos);
        setIsVisible(true);
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [calculatePosition]);

  /**
   * Handle format button click
   */
  const handleFormat = useCallback((format: MarkType) => {
    if (disabled) return;
    onFormat(format);
  }, [onFormat, disabled]);

  /**
   * Check if a mark is active
   */
  const isActive = useCallback((mark: MarkType) => {
    return activeMarks.includes(mark);
  }, [activeMarks]);

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className={`inline-toolbar ${isVisible ? 'inline-toolbar--open' : ''}`}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 100,
      }}
      role="toolbar"
      aria-label="تنسيق النص"
      onMouseDown={(e) => e.preventDefault()}
    >
      <Toolbar.Root
        activeMarks={activeMarks}
        onToggleMark={onFormat}
        onConvertBlock={() => { }} // BubbleMenu only does marks
        onLink={onLink}
        disabled={disabled}
        selection={{ isCollapsed: false, blockId: '', anchorOffset: 0, focusOffset: 0 }} // Force text-selection context
        blocks={[]}
      >
        <Toolbar.Group>
          <Toolbar.Button format="bold" icon={<Bold size={18} strokeWidth={2.5} />} tooltip="عريض" shortcut="Ctrl+B" />
          <Toolbar.Button format="italic" icon={<Italic size={18} strokeWidth={2.5} />} tooltip="مائل" shortcut="Ctrl+I" />
          <Toolbar.Button format="underline" icon={<Underline size={18} strokeWidth={2.5} />} tooltip="مسطر" shortcut="Ctrl+U" />
          <Toolbar.Button format="strikethrough" icon={<Strikethrough size={18} strokeWidth={2.5} />} tooltip="مشطوب" />
          <Toolbar.Button format="mark" icon={<Highlighter size={18} strokeWidth={2.5} />} tooltip="تظليل" />
        </Toolbar.Group>

        <Toolbar.Separator />

        <Toolbar.Group>
          <Toolbar.Button action="link" icon={<Link size={18} strokeWidth={2.5} />} tooltip="رابط" shortcut="Ctrl+K" />
          <Toolbar.Button format="code" icon={<Code size={18} strokeWidth={2.5} />} tooltip="كود" />
        </Toolbar.Group>
      </Toolbar.Root>
    </div>
  );
}

export default BubbleMenu;
