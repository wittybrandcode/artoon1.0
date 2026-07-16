/**
 * BlockWrapper
 * 
 * Wraps each block with controls (drag handle, menu, direction toggle).
 * Handles hover states and provides the drag handle for reordering via @dnd-kit.
 */

import React, { useState } from 'react';
import { GripVertical, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Block } from '../../types';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface BlockWrapperProps {
  block: Block;
  isFocused: boolean;
  children: React.ReactNode;
  onFocus: () => void;
  onAddClick: (e: React.MouseEvent) => void;
  onDragClick: (e: React.MouseEvent) => void;
  onDirectionToggle: () => void;
  readOnly?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export function BlockWrapper({
  block,
  isFocused,
  children,
  onFocus,
  onAddClick,
  onDragClick,
  onDirectionToggle,
  readOnly = false,
}: BlockWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);

  // @dnd-kit Sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    disabled: readOnly
  });

  // Apply ultra-smooth transforms when dragging or sorting
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // When dragging, we can lower opacity of the ghost left behind in the list,
    // or elevate it via z-index
    opacity: isDragging ? 0.4 : 1,
    boxShadow: isDragging ? 'var(--shadow-lg)' : undefined,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  };

  const isRTL = block.direction === 'rtl' || (!block.direction && true);
  const direction = block.direction || 'rtl';

  // Block type → CSS class
  const getBlockTypeClass = () => {
    switch (block.type) {
      case 'heading1': return 'block--heading1';
      case 'heading2': return 'block--heading2';
      case 'heading3': return 'block--heading3';
      case 'quote': return 'block--quote';
      case 'code': return 'block--code';
      case 'list': return 'block--list';
      case 'bullet-list': return 'block--bullet-list';
      case 'numbered-list': return 'block--numbered-list';
      case 'definition-list': return 'block--definition-list';
      case 'divider': return 'block--divider';
      case 'image': return 'block--image';
      default: return 'block--paragraph';
    }
  };

  const rowClasses = [
    'block-row',
    isDragging && 'block-row--dragging', // the v2 class for ghost
    isFocused && 'block-row--focused',
  ].filter(Boolean).join(' ');

  const blockClasses = [
    'block',
    getBlockTypeClass(),
    isFocused && 'focused',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={rowClasses}
      data-block-id={block.id}
      onMouseEnter={() => !isDragging && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Block Controls - position based on direction */}
      <div
        className={`block__controls ${isRTL ? 'block__controls--rtl' : 'block__controls--ltr'}`}
        style={{ opacity: isHovered || isFocused || isDragging ? 1 : 0 }}
      >
        <div className="block__controls-group">
          {/* Drag Handle & Menu Trigger combined */}
          <div
            className={`block__action-btn block__drag ${isDragging ? 'grabbing' : ''}`}
            title="خيارات البلوك أو اسحب للترتيب"
            aria-label="Block options or drag to reorder"
            onClick={onDragClick}
            {...attributes}
            {...listeners}
            style={{
              cursor: readOnly ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'),
              touchAction: 'none' // Required for pointer sensors on mobile
            }}
          >
            <GripVertical size={16} />
          </div>

          {/* Direction Toggle */}
          <button
            className={`block__action-btn block__dir`}
            title="تغيير اتجاه النص"
            onClick={(e) => {
              e.stopPropagation();
              onDirectionToggle();
            }}
            aria-label="Toggle text direction"
            disabled={readOnly}
          >
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      <div
        className={blockClasses}
        dir={direction}
        data-direction={direction}
        onClick={onFocus}
      >
        {/* Block Content */}
        {children}
      </div>

      {/* Horizontal Add Button (Between blocks) */}
      <div
        className="block__add-horizontal"
        style={{ opacity: isHovered && !isDragging ? 1 : 0 }}
        onClick={!readOnly ? onAddClick : undefined}
        title="إضافة بلوك جديد هنا"
      >
        <div className="block__add-horizontal-line" />
        <button
          className="block__add-horizontal-btn"
          aria-label="Add block between"
          disabled={readOnly}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default BlockWrapper;
