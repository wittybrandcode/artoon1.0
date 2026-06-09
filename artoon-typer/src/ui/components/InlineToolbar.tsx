/**
 * InlineToolbar
 * 
 * Floating toolbar that appears when text is selected.
 * Provides formatting options (bold, italic, underline, etc.)
 */

import React, { useCallback } from 'react';
import type { Modifier } from '../../types';

export interface InlineToolbarProps {
  isOpen: boolean;
  position: { top: number; left: number };
  activeMarks: Modifier[];
  onToggleMark: (mark: Modifier) => void;
  onInsertLink?: () => void;
  onInsertCode?: () => void;
}

/**
 * Toolbar button definition
 */
interface ToolbarButton {
  id: string;
  icon: React.ReactNode;
  mark?: Modifier;
  action?: () => void;
  tooltip: string;
  className?: string;
}

export function InlineToolbar({
  isOpen,
  position,
  activeMarks,
  onToggleMark,
  onInsertLink,
  onInsertCode,
}: InlineToolbarProps) {
  
  const handleMarkClick = useCallback((mark: Modifier) => {
    onToggleMark(mark);
  }, [onToggleMark]);
  
  if (!isOpen) return null;
  
  // Calculate position
  const toolbarWidth = 280;
  let posX = position.left - toolbarWidth / 2;
  let posY = position.top - 50;
  
  if (typeof window !== 'undefined') {
    if (posX < 10) posX = 10;
    if (posX + toolbarWidth > window.innerWidth - 10) {
      posX = window.innerWidth - toolbarWidth - 10;
    }
    if (posY < 10) posY = position.top + 30;
  }
  
  const buttons: (ToolbarButton | 'divider')[] = [
    {
      id: 'bold',
      icon: <b>B</b>,
      mark: 's',
      tooltip: 'عريض (Ctrl+B)',
    },
    {
      id: 'italic',
      icon: <i>I</i>,
      mark: 'e',
      tooltip: 'مائل (Ctrl+I)',
    },
    {
      id: 'underline',
      icon: <u>U</u>,
      mark: 'u',
      tooltip: 'مسطر (Ctrl+U)',
    },
    {
      id: 'strike',
      icon: <s>S</s>,
      mark: 'd',
      tooltip: 'مشطوب',
    },
    'divider',
    {
      id: 'highlight',
      icon: '🖍',
      mark: 'mark',
      tooltip: 'تمييز',
    },
    {
      id: 'link',
      icon: '🔗',
      action: onInsertLink,
      tooltip: 'رابط (Ctrl+K)',
    },
    {
      id: 'code',
      icon: '</>',
      action: onInsertCode,
      tooltip: 'كود',
    },
  ];
  
  return (
    <div 
      className="inline-toolbar visible"
      style={{
        position: 'fixed',
        top: posY,
        left: posX,
      }}
    >
      {buttons.map((button, index) => {
        if (button === 'divider') {
          return <div key={`divider-${index}`} className="toolbar-divider" />;
        }
        
        const isActive = button.mark && activeMarks.includes(button.mark);
        
        return (
          <button
            key={button.id}
            className={`toolbar-btn ${isActive ? 'active' : ''} ${button.className || ''}`}
            data-mark={button.mark}
            title={button.tooltip}
            onClick={() => {
              if (button.action) {
                button.action();
              } else if (button.mark) {
                handleMarkClick(button.mark);
              }
            }}
          >
            {button.icon}
          </button>
        );
      })}
    </div>
  );
}

export default InlineToolbar;
