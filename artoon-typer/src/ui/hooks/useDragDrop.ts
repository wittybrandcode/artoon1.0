/**
 * useDragDrop Hook
 * 
 * React hook for drag and drop functionality.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  DragDropManager, 
  createDragDropManager,
  type DragState,
  type DropPosition,
  type DragDropManagerOptions,
} from '../../core/DragDropManager';
import type { EditorControllerInterface } from '../../types';

/**
 * useDragDrop options
 */
export interface UseDragDropOptions {
  /** Editor controller */
  controller: EditorControllerInterface;
  /** Container element ref */
  containerRef?: React.RefObject<HTMLElement>;
}

/**
 * useDragDrop return type
 */
export interface UseDragDropReturn {
  /** Whether currently dragging */
  isDragging: boolean;
  /** ID of the block being dragged */
  draggedBlockId: string | null;
  /** Current drop position */
  dropPosition: DropPosition | null;
  /** Start drag operation */
  handleDragStart: (blockId: string, event: React.DragEvent | React.MouseEvent | React.TouchEvent) => void;
  /** Handle drag over */
  handleDragOver: (event: React.DragEvent | React.MouseEvent | React.TouchEvent) => void;
  /** Handle drop */
  handleDrop: (event: React.DragEvent | React.MouseEvent | React.TouchEvent) => void;
  /** End drag operation */
  handleDragEnd: () => void;
  /** Get drag handle props for a block */
  getDragHandleProps: (blockId: string) => DragHandleProps;
  /** Get drop zone props */
  getDropZoneProps: () => DropZoneProps;
}

/**
 * Props for drag handle element
 */
export interface DragHandleProps {
  draggable: boolean;
  onDragStart: (event: React.DragEvent) => void;
  onDragEnd: () => void;
  onMouseDown: (event: React.MouseEvent) => void;
  onTouchStart: (event: React.TouchEvent) => void;
}

/**
 * Props for drop zone element
 */
export interface DropZoneProps {
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragLeave: () => void;
}

/**
 * useDragDrop hook
 */
export function useDragDrop(options: UseDragDropOptions): UseDragDropReturn {
  const { controller, containerRef } = options;
  
  // State
  const [isDragging, setIsDragging] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  
  // Create drag drop manager
  const dragDropManager = useMemo(() => {
    return createDragDropManager({
      controller,
      container: containerRef?.current,
      onDragStart: (blockId) => {
        setIsDragging(true);
        setDraggedBlockId(blockId);
      },
      onDragEnd: () => {
        setIsDragging(false);
        setDraggedBlockId(null);
        setDropPosition(null);
      },
      onDropPositionChange: (position) => {
        setDropPosition(position);
      },
    });
  }, [controller]);
  
  // Update container when ref changes
  useEffect(() => {
    if (containerRef?.current) {
      dragDropManager.setContainer(containerRef.current);
    }
  }, [dragDropManager, containerRef?.current]);
  
  // Handlers
  const handleDragStart = useCallback((
    blockId: string, 
    event: React.DragEvent | React.MouseEvent | React.TouchEvent
  ) => {
    dragDropManager.startDrag(blockId, event.nativeEvent as any);
  }, [dragDropManager]);
  
  const handleDragOver = useCallback((
    event: React.DragEvent | React.MouseEvent | React.TouchEvent
  ) => {
    dragDropManager.handleDragOver(event.nativeEvent as any);
  }, [dragDropManager]);
  
  const handleDrop = useCallback((
    event: React.DragEvent | React.MouseEvent | React.TouchEvent
  ) => {
    dragDropManager.handleDrop(event.nativeEvent as any);
  }, [dragDropManager]);
  
  const handleDragEnd = useCallback(() => {
    dragDropManager.endDrag();
  }, [dragDropManager]);
  
  // Get props for drag handle
  const getDragHandleProps = useCallback((blockId: string): DragHandleProps => {
    return {
      draggable: true,
      onDragStart: (event: React.DragEvent) => {
        handleDragStart(blockId, event);
      },
      onDragEnd: handleDragEnd,
      onMouseDown: (event: React.MouseEvent) => {
        // For custom drag implementation without native drag
      },
      onTouchStart: (event: React.TouchEvent) => {
        handleDragStart(blockId, event);
      },
    };
  }, [handleDragStart, handleDragEnd]);
  
  // Get props for drop zone
  const getDropZoneProps = useCallback((): DropZoneProps => {
    return {
      onDragOver: (event: React.DragEvent) => {
        event.preventDefault();
        handleDragOver(event);
      },
      onDrop: (event: React.DragEvent) => {
        event.preventDefault();
        handleDrop(event);
      },
      onDragLeave: () => {
        setDropPosition(null);
      },
    };
  }, [handleDragOver, handleDrop]);
  
  return {
    isDragging,
    draggedBlockId,
    dropPosition,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    getDragHandleProps,
    getDropZoneProps,
  };
}
