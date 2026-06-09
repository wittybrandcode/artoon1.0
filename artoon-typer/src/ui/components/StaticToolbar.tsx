import React from 'react';
import type { MarkType, BlockType, Direction, SelectionState } from '../../types';
import { Toolbar } from '../../design-system/Toolbar';
import {
    Bold, Italic, Underline, Strikethrough, Highlighter,
    Code, Link, Superscript, Subscript,
    AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Quote,
    Undo, Redo
} from 'lucide-react';

export interface StaticToolbarProps {
    activeMarks: MarkType[];
    focusedBlockType?: BlockType;
    focusedBlockAlign?: 'left' | 'center' | 'right';
    selection?: SelectionState | null;
    onToggleMark: (mark: MarkType) => void;
    onConvertBlock: (type: BlockType) => void;
    onSetDirection?: (dir: Direction) => void;
    onInsertBlock?: (type: string) => void;
    onAction?: (action: 'undo' | 'redo') => void;
    onAlign?: (align: 'left' | 'center' | 'right') => void;
    onLink?: () => void;
    disabled?: boolean;
}

export function StaticToolbar({
    activeMarks,
    focusedBlockType,
    focusedBlockAlign,
    selection = null,
    onToggleMark,
    onConvertBlock,
    onAction,
    onAlign,
    onLink,
    disabled = false
}: StaticToolbarProps) {

    return (
        <div className="toolbar-container" style={{ paddingBottom: '8px' }}>
            <Toolbar.Root
                activeMarks={activeMarks}
                focusedBlockType={focusedBlockType}
                focusedBlockAlign={focusedBlockAlign}
                selection={selection}
                onToggleMark={onToggleMark}
                onConvertBlock={onConvertBlock}
                onAction={onAction}
                onAlign={onAlign}
                onLink={onLink}
                disabled={disabled}
                blocks={[]}
            >
                {/* Basic Formatting */}
                <Toolbar.Group label="أساسي" showIf={['caret', 'text-selection']}>
                    <Toolbar.Button format="bold" icon={<Bold size={18} strokeWidth={2.5} />} tooltip="عريض" shortcut="Ctrl+B" />
                    <Toolbar.Button format="italic" icon={<Italic size={18} strokeWidth={2.5} />} tooltip="مائل" shortcut="Ctrl+I" />
                    <Toolbar.Button format="underline" icon={<Underline size={18} strokeWidth={2.5} />} tooltip="مسطر" shortcut="Ctrl+U" />
                    <Toolbar.Button format="strikethrough" icon={<Strikethrough size={18} strokeWidth={2.5} />} tooltip="مشطوب" />
                    <Toolbar.Button format="mark" icon={<Highlighter size={18} strokeWidth={2.5} />} tooltip="تظليل" />
                </Toolbar.Group>

                <Toolbar.Separator />

                {/* Inline Elements */}
                <Toolbar.Group label="مضمن" showIf={['caret', 'text-selection']}>
                    <Toolbar.Button format="code" icon={<Code size={18} strokeWidth={2.5} />} tooltip="كود مضمن" />
                    <Toolbar.Button action="link" icon={<Link size={18} strokeWidth={2.5} />} tooltip="رابط" shortcut="Ctrl+K" />
                    <Toolbar.Button format="sup" icon={<Superscript size={18} strokeWidth={2.5} />} tooltip="أعلى" />
                    <Toolbar.Button format="sub" icon={<Subscript size={18} strokeWidth={2.5} />} tooltip="أسفل" />
                </Toolbar.Group>

                <Toolbar.Separator />

                {/* Alignment (Block only) */}
                <Toolbar.Group label="محاذاة" showIf={['caret', 'block-selection']}>
                    <Toolbar.Button align="left" icon={<AlignLeft size={18} strokeWidth={2.5} />} tooltip="يسار" />
                    <Toolbar.Button align="center" icon={<AlignCenter size={18} strokeWidth={2.5} />} tooltip="وسط" />
                    <Toolbar.Button align="right" icon={<AlignRight size={18} strokeWidth={2.5} />} tooltip="يمين" />
                </Toolbar.Group>

                <Toolbar.Separator />

                {/* Lists (Block only) */}
                <Toolbar.Group label="قوائم" showIf={['caret', 'block-selection']}>
                    <Toolbar.Button blockType="bullet-list" icon={<List size={18} strokeWidth={2.5} />} tooltip="قائمة نقطية" />
                    <Toolbar.Button blockType="numbered-list" icon={<ListOrdered size={18} strokeWidth={2.5} />} tooltip="قائمة مرقمة" />
                    <Toolbar.Button blockType="quote" icon={<Quote size={18} strokeWidth={2.5} />} tooltip="اقتباس" />
                </Toolbar.Group>

                <Toolbar.Separator />

                {/* Headings */}
                <Toolbar.Group label="رأس" showIf={['caret', 'block-selection']}>
                    <select
                        className="input"
                        style={{ width: '120px', height: '36px', background: 'transparent', border: '1px solid var(--color-border-light)', borderRadius: '6px', fontSize: '13px' }}
                        value={focusedBlockType?.startsWith('heading') ? focusedBlockType : 'paragraph'}
                        onChange={(e) => onConvertBlock(e.target.value as BlockType)}
                    >
                        <option value="paragraph">فقرة</option>
                        <option value="heading1">H1 عنوان 1</option>
                        <option value="heading2">H2 عنوان 2</option>
                        <option value="heading3">H3 عنوان 3</option>
                        <option value="heading4">H4 عنوان 4</option>
                    </select>
                </Toolbar.Group>

                <Toolbar.Separator />

                {/* Actions */}
                <Toolbar.Group>
                    <Toolbar.Button action="undo" icon={<Undo size={18} strokeWidth={2.5} />} tooltip="تراجع" shortcut="Ctrl+Z" />
                    <Toolbar.Button action="redo" icon={<Redo size={18} strokeWidth={2.5} />} tooltip="إعادة" shortcut="Ctrl+Y" />
                </Toolbar.Group>

            </Toolbar.Root>
        </div>
    );
}
