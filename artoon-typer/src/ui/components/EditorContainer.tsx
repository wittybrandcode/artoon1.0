/**
 * EditorContainer
 * 
 * Main container component for the ARTOON-TYPER editor.
 * Renders all blocks and manages menus/toolbars.
 * Integrated with @dnd-kit for professional drag-and-drop.
 */

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useEditor, UseEditorOptions } from '../hooks/useEditor';
import { BlockWrapper } from './BlockWrapper';
import { BlockRenderer } from './BlockRenderer';
import { AddMenu } from './AddMenu';
import { BubbleMenu } from './BubbleMenu';
import { ContextMenu } from './ContextMenu';
import { LinkDialog } from './LinkDialog';
import { StaticToolbar } from './StaticToolbar';
import { StatusBar } from './StatusBar';
import { ValidationPanel } from './ValidationPanel';
import type { Block, BlockType, MarkType, Direction } from '../../types';
import { generateId } from '../../core/utils';

// @dnd-kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface EditorContainerProps extends UseEditorOptions {
  className?: string;
  theme?: 'light' | 'dark';
  placeholder?: string;
  defaultDirection?: 'rtl' | 'ltr';
  onThemeToggle?: (theme: 'light' | 'dark') => void;
  onDirectionToggle?: (dir: 'rtl' | 'ltr') => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export function EditorContainer({
  className = '',
  theme = 'light',
  placeholder = 'اكتب / لإضافة بلوك...',
  defaultDirection = 'rtl',
  onThemeToggle,
  onDirectionToggle,
  ...editorOptions
}: EditorContainerProps) {
  const ObjectedEditorOptions = { ...editorOptions, defaultDirection };
  const editor = useEditor(ObjectedEditorOptions);

  const {
    blocks,
    focusedBlockId,
    slashMenu,
    blockMenu,
    linkDialog,
    hasTextSelection,
    validationResult,
    activeMarks,
    selectionPosition,
    editorRef,
    // Operations
    addBlock,
    removeBlock,
    updateBlock,
    moveBlock,
    focusBlock,
    toggleBlockDirection,
    // Menu operations
    openSlashMenu,
    closeSlashMenu,
    insertBlock,
    openBlockMenu,
    closeBlockMenu,
    handleBlockAction,
    // Mark operations
    toggleMark,
    // Link operations
    openLinkDialog,
    closeLinkDialog,
    insertLink,
    // Content operations
    createFirstBlock,
  } = editor;

  // ─── Dnd-Kit Drag and Drop ──────────────────────────────────────────

  const [activeId, setActiveId] = useState<string | null>(null);

  // Advanced sensors for pointer (mouse/touch) and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement to start drag (prevents accidental drags on click)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Close menus when starting a drag
    closeSlashMenu();
    closeBlockMenu();
  }, [closeSlashMenu, closeBlockMenu]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Compensate for EditorController's moveBlock downward index shifting
        const compensatedIndex = newIndex > oldIndex ? newIndex + 1 : newIndex;
        moveBlock(active.id as string, compensatedIndex);
      }
    }

    setActiveId(null);
  }, [blocks, moveBlock]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // Drop animation config
  const dropAnimation = useMemo(() => ({
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  }), []);

  const activeBlock = useMemo(
    () => blocks.find((b) => b.id === activeId),
    [activeId, blocks]
  );

  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);
  const [showValidationPanel, setShowValidationPanel] = useState(false);

  // ─── Event Handlers ─────────────────────────────────────────────────

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.artoon-slash-menu') && !target.closest('.block-separator__btn')) {
        closeSlashMenu();
      }
      if (!target.closest('.context-menu') && !target.closest('.block__handle')) {
        closeBlockMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [closeSlashMenu, closeBlockMenu]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSlashMenu();
        closeBlockMenu();
        closeLinkDialog();
      }

      if (e.ctrlKey && e.key === 'b') { e.preventDefault(); toggleMark('bold' as any); }
      if (e.ctrlKey && e.key === 'i') { e.preventDefault(); toggleMark('italic' as any); }
      if (e.ctrlKey && e.key === 'u') { e.preventDefault(); toggleMark('underline' as any); }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) openLinkDialog();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeSlashMenu, closeBlockMenu, closeLinkDialog, toggleMark, openLinkDialog]);

  const handleAddClick = useCallback((e: React.MouseEvent, afterBlockId: string | null) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    openSlashMenu(
      { top: rect.bottom + 5, left: rect.left + rect.width / 2 },
      afterBlockId || ''
    );
  }, [openSlashMenu]);

  const handleDragClick = useCallback((e: React.MouseEvent, block: Block) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    openBlockMenu({ top: rect.bottom + 5, left: rect.left }, block);
    focusBlock(block.id);
  }, [openBlockMenu, focusBlock]);

  // Handle Undo/Redo from Toolbar
  const handleAction = useCallback((action: 'undo' | 'redo') => {
    if (action === 'undo') {
      editor.undo();
      return;
    }

    editor.redo();
  }, [editor]);

  const handleToolbarConvert = useCallback((newType: BlockType) => {
    if (focusedBlockId) editor.convertBlock(focusedBlockId, newType);
  }, [focusedBlockId, editor]);

  const focusedBlock = blocks.find((b) => b.id === focusedBlockId);

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div
      className={`app artoon-typer artoon-typer--${theme} ${className}`}
      dir={defaultDirection}
      data-readonly={editorOptions.readOnly}
    >
      <StaticToolbar
        activeMarks={activeMarks as MarkType[]}
        focusedBlockType={focusedBlock?.type}
        focusedBlockAlign={(focusedBlock?.meta as any)?.align as 'left' | 'center' | 'right'}
        selection={editor.selection}
        onToggleMark={toggleMark}
        onConvertBlock={handleToolbarConvert}
        disabled={editorOptions.readOnly || !focusedBlockId}
        onAction={handleAction}
        onLink={openLinkDialog}
        onAlign={(align) => {
          if (focusedBlockId && focusedBlock) {
            updateBlock(focusedBlockId, { meta: { ...focusedBlock.meta, align } as any });
          }
        }}
      />

      <main className="app-main">
        <div className="editor-container">
          <div className="editor" ref={editorRef as any}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
              <SortableContext
                items={blockIds}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block, index) => (
                  <BlockWrapper
                    key={block.id}
                    block={block}
                    isFocused={focusedBlockId === block.id}
                    onFocus={() => focusBlock(block.id)}
                    onAddClick={(e) => handleAddClick(e, block.id)}
                    onDragClick={(e) => handleDragClick(e, block)}
                    onDirectionToggle={() => toggleBlockDirection(block.id)}
                    readOnly={editorOptions.readOnly}
                  >
                    <BlockRenderer
                      block={block}
                      isEditable={!editorOptions.readOnly}
                      onUpdate={(updates) => updateBlock(block.id, updates)}
                      onInsertBlock={(type) => {
                        const newBlock = editor.addBlock(type as any, index + 1);
                        setTimeout(() => editor.focusBlock(newBlock.id), 0);
                      }}
                      onSplitListBlock={(itemsA, itemsB) => {
                        // 1. Remove the old single list block
                        editor.removeBlock(block.id);

                        let offset = 0;
                        // 2. Insert the top half of the list (if not empty)
                        if (itemsA.length > 0) {
                          editor.insertRawBlock({ ...block, id: generateId(), items: itemsA } as any, index + offset);
                          offset++;
                        }

                        // 3. Insert the new intermediate paragraph
                        const pBlock = editor.addBlock('paragraph', index + offset);
                        offset++;

                        // 4. Insert the bottom half of the list (if not empty)
                        if (itemsB.length > 0) {
                          editor.insertRawBlock({ ...block, id: generateId(), items: itemsB } as any, index + offset);
                        }

                        // 5. Focus the newly injected paragraph
                        setTimeout(() => editor.focusBlock(pBlock.id), 0);
                      }}
                    />
                  </BlockWrapper>
                ))}
              </SortableContext>

              {/* Professional Ghost Overlay */}
              <DragOverlay dropAnimation={dropAnimation}>
                {activeId && activeBlock ? (
                  <div className="block-row block-row--dragging" dir={activeBlock.direction || defaultDirection}>
                    <div className={`block block--${activeBlock.type}`}>
                      <BlockRenderer
                        block={activeBlock}
                        isEditable={false} // Overlay should not be editable
                        onUpdate={() => { }}
                      />
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {blocks.length === 0 && (
              <div className="placeholder" onClick={createFirstBlock}>
                {placeholder}
              </div>
            )}
          </div>

          <StatusBar
            blockCount={blocks.length}
            theme={theme}
            direction={defaultDirection}
            validationResult={editor.validationResult}
            onToggleValidationPanel={() => setShowValidationPanel(prev => !prev)}
          />
          {showValidationPanel && (
            <ValidationPanel
              validationResult={editor.validationResult}
              onClose={() => setShowValidationPanel(false)}
            />
          )}
        </div>
      </main>

      <AddMenu
        isOpen={slashMenu.isOpen}
        position={slashMenu.position}
        onSelect={insertBlock}
        onClose={closeSlashMenu}
      />

      <BubbleMenu
        onFormat={(mark: MarkType) => toggleMark(mark as any)}
        onLink={openLinkDialog}
        activeMarks={activeMarks as MarkType[]}
        disabled={editorOptions.readOnly}
      />

      <LinkDialog
        isOpen={linkDialog.isOpen}
        onClose={closeLinkDialog}
        onInsert={insertLink}
        selectedText={linkDialog.text}
      />

      <ContextMenu
        isOpen={blockMenu.isOpen}
        position={blockMenu.position}
        block={blockMenu.block}
        onAction={handleBlockAction}
        onClose={closeBlockMenu}
      />
    </div>
  );
}

export default EditorContainer;
