/**
 * ContextMenu
 * 
 * Context menu for block operations.
 * Shows when clicking the ⋮⋮ drag handle.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { Block, BlockType } from '../../types';
import type { BlockAction } from '../hooks/useEditor';
import {
  Trash2, Copy, Scissors, Clipboard, ArrowUp, ArrowDown, Share2, Type,
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Quote, List,
  ListOrdered, BookOpen, Code, Table, Image, Video, Music, Images, FileDown,
  Minus, Check, ChevronDown, Clock, Info, Tags, Link, Puzzle
} from 'lucide-react';
import './ContextMenu.css';

export interface ContextMenuProps {
  isOpen: boolean;
  position: { top: number; left: number };
  block: Block | null;
  onAction: (action: BlockAction) => void;
  onClose: () => void;
}

/**
 * Menu item definition
 */
interface MenuItem {
  icon: React.ReactNode;
  label: string;
  action: BlockAction;
  danger?: boolean;
  shortcut?: string;
}

const s = 16;
const sw = 2;

/**
 * Menu items
 */
const menuItems: (MenuItem | 'divider')[] = [
  { icon: <Trash2 size={s} strokeWidth={sw} />, label: 'حذف البلوك', action: { type: 'delete' }, danger: true },
  { icon: <Copy size={s} strokeWidth={sw} />, label: 'تكرار', action: { type: 'duplicate' }, shortcut: 'Ctrl+D' },
  { icon: <Scissors size={s} strokeWidth={sw} />, label: 'قص', action: { type: 'cut' } },
  { icon: <Clipboard size={s} strokeWidth={sw} />, label: 'نسخ', action: { type: 'copy' } },
  'divider',
  { icon: <ArrowUp size={s} strokeWidth={sw} />, label: 'نقل لأعلى', action: { type: 'move-up' } },
  { icon: <ArrowDown size={s} strokeWidth={sw} />, label: 'نقل لأسفل', action: { type: 'move-down' } },
];

/**
 * Convert options based on current block type
 */
function getConvertOptions(currentType: BlockType): MenuItem[] {
  const textTypes: BlockType[] = ['paragraph', 'heading1', 'heading2', 'heading3', 'quote'];
  const listTypes: BlockType[] = ['bullet-list', 'numbered-list'];

  const typeLabels: Record<BlockType, string> = {
    'paragraph': 'فقرة',
    'heading1': 'عنوان 1',
    'heading2': 'عنوان 2',
    'heading3': 'عنوان 3',
    'heading4': 'عنوان 4',
    'heading5': 'عنوان 5',
    'heading6': 'عنوان 6',
    'quote': 'اقتباس',
    'bullet-list': 'قائمة نقطية',
    'numbered-list': 'قائمة مرقمة',
    'list': 'قائمة',
    'definition-list': 'قائمة تعريفات',
    'code': 'كود',
    'table': 'جدول',
    'image': 'صورة',
    'video': 'فيديو',
    'audio': 'صوت',
    'figure': 'شكل',
    'file': 'ملف',
    'divider': 'فاصل',
    'preformatted': 'نص محفوظ',
    'line-break': 'سطر جديد',
    'word-break': 'فاصل كلمة',
    'details': 'محتوى قابل للطي',
    'time-block': 'تاريخ/وقت',
    'abbr-block': 'اختصار',
    'meta': 'بيانات وصفية',
    'link-block': 'رابط',
    'custom': 'مخصص',
  };

  // Determine which types can be converted to
  let convertibleTypes: BlockType[] = [];

  if (textTypes.includes(currentType)) {
    convertibleTypes = textTypes.filter(t => t !== currentType);
  } else if (listTypes.includes(currentType)) {
    convertibleTypes = listTypes.filter(t => t !== currentType);
  }

  const iconMap: Record<string, React.ReactNode> = {
    'paragraph': <Type size={s} strokeWidth={sw} />,
    'heading1': <Heading1 size={s} strokeWidth={sw} />,
    'heading2': <Heading2 size={s} strokeWidth={sw} />,
    'heading3': <Heading3 size={s} strokeWidth={sw} />,
    'heading4': <Heading4 size={s} strokeWidth={sw} />,
    'heading5': <Heading5 size={s} strokeWidth={sw} />,
    'heading6': <Heading6 size={s} strokeWidth={sw} />,
    'quote': <Quote size={s} strokeWidth={sw} />,
    'preformatted': <Code size={s} strokeWidth={sw} />,
    'line-break': <Check size={s} strokeWidth={sw} />,
    'word-break': <Check size={s} strokeWidth={sw} />,
    'bullet-list': <List size={s} strokeWidth={sw} />,
    'numbered-list': <ListOrdered size={s} strokeWidth={sw} />,
    'definition-list': <BookOpen size={s} strokeWidth={sw} />,
    'image': <Image size={s} strokeWidth={sw} />,
    'video': <Video size={s} strokeWidth={sw} />,
    'audio': <Music size={s} strokeWidth={sw} />,
    'figure': <Images size={s} strokeWidth={sw} />,
    'file': <FileDown size={s} strokeWidth={sw} />,
    'code': <Code size={s} strokeWidth={sw} />,
    'table': <Table size={s} strokeWidth={sw} />,
    'divider': <Minus size={s} strokeWidth={sw} />,
    'details': <ChevronDown size={s} strokeWidth={sw} />,
    'time-block': <Clock size={s} strokeWidth={sw} />,
    'abbr-block': <Info size={s} strokeWidth={sw} />,
    'meta': <Tags size={s} strokeWidth={sw} />,
    'link-block': <Link size={s} strokeWidth={sw} />,
    'custom': <Puzzle size={s} strokeWidth={sw} />,
  };

  return convertibleTypes.map(type => ({
    icon: iconMap[type] || <Type size={s} strokeWidth={sw} />,
    label: typeLabels[type],
    action: { type: 'convert', to: type } as BlockAction,
  }));
}

export function ContextMenu({ isOpen, position, block, onAction, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showConvertSubmenu, setShowConvertSubmenu] = React.useState(false);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset submenu state when menu closes
  useEffect(() => {
    if (!isOpen) {
      setShowConvertSubmenu(false);
    }
  }, [isOpen]);

  const handleItemClick = useCallback((action: BlockAction) => {
    onAction(action);
  }, [onAction]);

  if (!isOpen || !block) return null;

  // Calculate position
  const menuWidth = 200;
  const menuHeight = 280;
  let posX = position.left;
  let posY = position.top;

  if (typeof window !== 'undefined') {
    if (posX + menuWidth > window.innerWidth - 10) {
      posX = position.left - menuWidth;
    }
    if (posY + menuHeight > window.innerHeight - 10) {
      posY = window.innerHeight - menuHeight - 10;
    }
  }

  const convertOptions = getConvertOptions(block.type);

  return (
    <div
      ref={menuRef}
      className="context-menu visible"
      role="menu"
      aria-label="Block actions"
      style={{
        position: 'fixed',
        top: posY,
        left: posX,
      }}
    >
      {/* Convert submenu (Moved to top) */}
      {convertOptions.length > 0 && (
        <>
          <div
            className="context-menu__item context-menu__sub-trigger"
            role="menuitem"
            tabIndex={0}
            aria-haspopup="menu"
            aria-expanded={showConvertSubmenu}
            onMouseEnter={() => setShowConvertSubmenu(true)}
            onMouseLeave={() => setShowConvertSubmenu(false)}
          >
            <span className="context-menu__item-icon"><Share2 size={s} strokeWidth={sw} /></span>
            <span>تحويل إلى...</span>
            <span style={{ marginRight: 'auto', fontSize: '10px' }}>◀</span>

            {showConvertSubmenu && (
              <div
                className="context-menu__sub-menu"
                role="menu"
                style={{
                  position: 'absolute',
                  right: '100%',
                  top: 0,
                }}
              >
                {convertOptions.map(option => (
                  <div
                    key={option.label}
                    className="context-menu__item"
                    role="menuitem"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(option.action);
                    }}
                  >
                    <span className="context-menu__item-icon">{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="context-menu__divider" />
        </>
      )}

      {menuItems.map((item, index) => {
        if (item === 'divider') {
          return <div key={`divider-${index}`} className="context-menu__divider" />;
        }

        return (
          <div
            key={item.label}
            className={`context-menu__item ${item.danger ? 'context-menu__item--danger' : ''}`}
            role="menuitem"
            tabIndex={0}
            data-action={item.action.type}
            onClick={() => handleItemClick(item.action)}
          >
            <span className="context-menu__item-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="context-menu__item-shortcut">{item.shortcut}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ContextMenu;
