import React from 'react';
import { Bold, Italic, Underline, Strikethrough, Highlighter, Link, Code } from 'lucide-react';
import { Toolbar } from './index';

export function CommonFormattingButtons() {
    return (
        <Toolbar.Group label="تنسيق" showIf={['caret', 'text-selection']}>
            <Toolbar.Button format="bold" icon={<Bold size={18} strokeWidth={2.5} />} tooltip="عريض" shortcut="Ctrl+B" />
            <Toolbar.Button format="italic" icon={<Italic size={18} strokeWidth={2.5} />} tooltip="مائل" shortcut="Ctrl+I" />
            <Toolbar.Button format="underline" icon={<Underline size={18} strokeWidth={2.5} />} tooltip="مسطر" shortcut="Ctrl+U" />
            <Toolbar.Button format="strikethrough" icon={<Strikethrough size={18} strokeWidth={2.5} />} tooltip="مشطوب" />
            <Toolbar.Button format="mark" icon={<Highlighter size={18} strokeWidth={2.5} />} tooltip="تظليل" />
        </Toolbar.Group>
    );
}

export function CommonLinkCodeButtons() {
    return (
        <Toolbar.Group>
            <Toolbar.Button action="link" icon={<Link size={18} strokeWidth={2.5} />} tooltip="رابط" shortcut="Ctrl+K" />
            <Toolbar.Button format="code" icon={<Code size={18} strokeWidth={2.5} />} tooltip="كود" />
        </Toolbar.Group>
    );
}
