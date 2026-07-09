import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { getDefaultRegistry } from '../../core/BlockRegistry';
import type { BlockType, BlockCategory, BlockDefinition } from '../../types';
import {
  Type, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  Quote, Code, Search, List, ListOrdered, BookOpen, Image, Video, Music,
  Images, FileDown, Laptop, Table, Minus, ChevronDown, Clock, Info, Tags,
  Link, Puzzle, Check
} from 'lucide-react';
import styles from './AddMenu.module.css';

export interface AddMenuProps {
  isOpen: boolean;
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

interface BlockMenuItem {
  icon: React.ReactNode;
  name: string;
  desc: string;
  type: BlockType;
}

interface DynamicTab {
  id: BlockCategory;
  label: string;
  items: BlockMenuItem[];
}

function getIconForBlock(def: BlockDefinition): React.ReactNode {
  const s = 18;
  const sw = 2;
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
    'code': <Laptop size={s} strokeWidth={sw} />,
    'table': <Table size={s} strokeWidth={sw} />,
    'divider': <Minus size={s} strokeWidth={sw} />,
    'details': <ChevronDown size={s} strokeWidth={sw} />,
    'time-block': <Clock size={s} strokeWidth={sw} />,
    'abbr-block': <Info size={s} strokeWidth={sw} />,
    'meta': <Tags size={s} strokeWidth={sw} />,
    'link-block': <Link size={s} strokeWidth={sw} />,
    'custom': <Puzzle size={s} strokeWidth={sw} />,
  };
  return iconMap[def.type] || <Type size={s} strokeWidth={sw} />;
}

function getDynamicTabs(): DynamicTab[] {
  const registry = getDefaultRegistry();
  // We filter out 'advanced' explicitly here as requested to hide broken/experimental blocks
  const rawTabs = registry.getAddMenuTabs().filter(t => t.id !== 'advanced');

  return rawTabs.map(tab => {
    const items = tab.blocks.map(blockType => {
      const def = registry.get(blockType);
      if (!def) return null;
      return {
        icon: getIconForBlock(def),
        name: def.nameAr,
        desc: def.description || '',
        type: blockType,
      };
    }).filter(Boolean) as BlockMenuItem[];

    return {
      id: tab.id,
      label: tab.labelAr,
      items
    };
  }).filter(tab => tab.items.length > 0);
}

export function AddMenu({ isOpen, position, onSelect, onClose }: AddMenuProps) {
  // --- States ---
  // Mode: Are we browsing categories, browsing blocks inside a category, or searching flat?
  const [searchQuery, setSearchQuery] = useState('');

  // Category Selection (Left panel roughly)
  const [activeCategoryId, setActiveCategoryId] = useState<BlockCategory | null>(null);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  // Block Selection (Right panel flyout or Search list)
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);

  // Focus tracking ('category' or 'block')
  const [focusArea, setFocusArea] = useState<'category' | 'block'>('category');

  // --- Refs ---
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- Data ---
  const categories = useMemo(() => getDynamicTabs(), []);
  const validCategories = categories; // Phase 1 alias

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    // Flatten all blocks for search
    const allBlocks = validCategories.flatMap(cat => cat.items);
    const query = searchQuery.toLowerCase();

    return allBlocks.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query)
    );
  }, [searchQuery, validCategories]);

  // Current Active Blocks List (either from active category or search)
  const activeBlocks = useMemo(() => {
    if (searchQuery.trim()) return searchResults;
    if (activeCategoryId) {
      const cat = validCategories.find(c => c.id === activeCategoryId);
      return cat ? cat.items : [];
    }
    return [];
  }, [searchQuery, searchResults, validCategories, activeCategoryId]);


  // --- Lifecycles ---

  // On Open Reset
  useLayoutEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveCategoryId(null);
      setSelectedCategoryIndex(0);
      setSelectedBlockIndex(0);
      setFocusArea('category');

      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  }, [isOpen]);

  // If search query changes, reset focus to blocks if results exist, else stay on category conceptually (though list empty)
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      setActiveCategoryId(null); // Close flyout
      setFocusArea('block');
      setSelectedBlockIndex(0);
    } else {
      setFocusArea('category');
    }
  }, [searchQuery]);

  // Handle bounds when items list shrinks dynamically (e.g., during search)
  useEffect(() => {
    if (focusArea === 'block') {
      if (selectedBlockIndex >= activeBlocks.length && activeBlocks.length > 0) {
        setSelectedBlockIndex(activeBlocks.length - 1);
      } else if (activeBlocks.length === 0) {
        setSelectedBlockIndex(0);
      }
    } else if (focusArea === 'category') {
      if (selectedCategoryIndex >= validCategories.length && validCategories.length > 0) {
        setSelectedCategoryIndex(validCategories.length - 1);
      }
    }
  }, [activeBlocks.length, selectedBlockIndex, validCategories.length, selectedCategoryIndex, focusArea]);


  // --- Keyboard Logic ---
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing if user is typing normally, only handle navigation keys

      const isSearchActive = searchQuery.trim().length > 0;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (focusArea === 'category') {
            setSelectedCategoryIndex(i => Math.min(i + 1, validCategories.length - 1));
          } else {
            setSelectedBlockIndex(i => Math.min(i + 1, activeBlocks.length - 1));
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (focusArea === 'category') {
            setSelectedCategoryIndex(i => Math.max(i - 1, 0));
          } else {
            setSelectedBlockIndex(i => Math.max(i - 1, 0));
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (!isSearchActive && focusArea === 'category') {
            // Opening flyout (In RTL, left opens the sub-menu)
            const cat = validCategories[selectedCategoryIndex];
            if (cat && cat.items.length > 0) {
              setActiveCategoryId(cat.id);
              setFocusArea('block');
              setSelectedBlockIndex(0);
            }
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (!isSearchActive && focusArea === 'block') {
            // Closing flyout (In RTL, right closes the sub-menu)
            setActiveCategoryId(null);
            setFocusArea('category');
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (focusArea === 'block') {
            if (activeBlocks[selectedBlockIndex]) {
              onSelect(activeBlocks[selectedBlockIndex].type);
            }
          } else if (focusArea === 'category') {
            // If Enter on category, open it as if ArrowLeft was pressed
            const cat = validCategories[selectedCategoryIndex];
            // Toggle behavior
            if (activeCategoryId === cat.id) {
              setActiveCategoryId(null);
            } else {
              if (cat && cat.items.length > 0) {
                setActiveCategoryId(cat.id);
                setFocusArea('block');
                setSelectedBlockIndex(0);
              }
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          // First close flyout if open, else close whole menu
          if (activeCategoryId && focusArea === 'block') {
            setActiveCategoryId(null);
            setFocusArea('category');
            if (searchInputRef.current) searchInputRef.current.focus();
          } else {
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeCategoryId, selectedCategoryIndex, selectedBlockIndex, focusArea, activeBlocks, validCategories, searchQuery, onSelect, onClose]);

  // --- Rendering ---

  if (!isOpen || validCategories.length === 0) return null;

  // Static Positioning Details
  const menuWidth = 260; // Now compact
  const menuHeight = 360; // Max height prediction
  let posX = position.left - (menuWidth / 2); // Center roughly on cursor
  let posY = position.top;

  if (typeof window !== 'undefined') {
    if (posX < 10) posX = 10;
    // Account for potential flyout width (another 260px) to the left
    if (posX < 270) posX = 270;

    if (posX + menuWidth > window.innerWidth - 10) {
      posX = window.innerWidth - menuWidth - 10;
    }
    if (posY + menuHeight > window.innerHeight - 10) {
      posY = position.top - menuHeight - 10;
    }
  }

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div
      className={`${styles.menuWrapper} artoon-slash-menu`}
      role="dialog"
      aria-label="Add block"
      data-testid="add-menu"
      style={{
        position: 'fixed',
        top: posY,
        left: posX,
        zIndex: 1000,
        display: 'flex',
        direction: 'rtl'
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).tagName !== 'INPUT') {
          e.preventDefault();
        }
        e.stopPropagation();
      }}
    >
      {/* --- Main Menu Panel --- */}
      <div className={styles.slashMenu} ref={menuRef}>
        <div className={styles.search}>
          <Search size={16} strokeWidth={2} />
          <input
            ref={searchInputRef}
            type="text"
            className={styles.input}
            aria-label="Search blocks"
            data-testid="add-menu-search"
            placeholder="البحث في البلوكات..."
            value={searchQuery}
            onChange={(e) => {
              let val = e.target.value;
              if (val.startsWith('/')) {
                val = val.substring(1);
              }
              setSearchQuery(val);
            }}
          />
        </div>

        <div className={styles.contentArea}>

          {/* Default Categories View */}
          {!isSearchActive && validCategories.map((cat, index) => {
            const isHovered = focusArea === 'category' && index === selectedCategoryIndex;
            const isExpanded = activeCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                className={`${styles.categoryRow} ${isHovered ? styles.categoryRowHovered : ''} ${isExpanded ? styles.categoryRowExpanded : ''}`}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                data-testid={`category-row-${cat.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (isExpanded) {
                    setActiveCategoryId(null);
                    setFocusArea('category');
                    setSelectedCategoryIndex(index);
                  } else {
                    setActiveCategoryId(cat.id);
                    setFocusArea('block');
                    setSelectedCategoryIndex(index);
                    setSelectedBlockIndex(0);
                  }
                }}
                onMouseEnter={() => {
                  if (focusArea === 'category') {
                    setSelectedCategoryIndex(index);
                  }
                }}
              >
                <div className={styles.categoryRowLeft}>
                  <div className={styles.categoryIcon}>
                    {cat.items[0]?.icon || <Type size={16} />}
                  </div>
                  <div className={styles.categoryTitle}>{cat.label}</div>
                </div>
                <div className={styles.categoryChevron}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </div>
              </div>
            );
          })}

          {/* Search Flat View */}
          {isSearchActive && (
            activeBlocks.length === 0 ? (
              <div className={styles.emptySearch}>لا توجد نتائج مطابقة لـ "{searchQuery}"</div>
            ) : (
              activeBlocks.map((block, index) => {
                const isHovered = focusArea === 'block' && index === selectedBlockIndex;
                return (
                  <div
                    key={`search-${block.type}`}
                    className={`${styles.blockItem} ${isHovered ? styles.blockItemHovered : ''}`}
                    role="button"
                    tabIndex={0}
                    data-testid={`block-item-${block.type}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelect(block.type);
                    }}
                    onMouseEnter={() => {
                      setFocusArea('block');
                      setSelectedBlockIndex(index);
                    }}
                  >
                    <div className={styles.blockIconBox}>{block.icon}</div>
                    <div className={styles.blockInfo}>
                      <div className={styles.blockTitle}>{block.name}</div>
                      <div className={styles.blockDesc}>{block.desc}</div>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>

      {/* --- Global Flyout Menu Panel --- */}
      <div className={`${styles.blocksList} ${activeCategoryId ? styles.blocksListExpanded : ''}`}>
        <div className={styles.blocksListInner}>
          {activeCategoryId && activeBlocks.map((block, index) => {
            const isHovered = focusArea === 'block' && index === selectedBlockIndex;
            return (
              <div
                key={`flyout-${block.type}`}
                className={`${styles.blockItem} ${isHovered ? styles.blockItemHovered : ''}`}
                role="button"
                tabIndex={0}
                data-testid={`block-item-${block.type}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(block.type);
                }}
                onMouseEnter={() => {
                  setFocusArea('block');
                  setSelectedBlockIndex(index);
                }}
              >
                <div className={styles.blockIconBox}>{block.icon}</div>
                <div className={styles.blockInfo}>
                  <div className={styles.blockTitle}>{block.name}</div>
                  <div className={styles.blockDesc}>{block.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default AddMenu;
