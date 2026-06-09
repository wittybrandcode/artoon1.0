/**
 * Default Block Definitions
 * 
 * All built-in block type definitions for the editor.
 */

import type {
  BlockDefinition,
  TextBlock,
  ListBlock,
  CodeBlock,
  TableBlock,
  MediaBlock,
  DividerBlock,
  PreformattedBlock,
  LineBreakBlock,
  DefinitionListBlock,
  FigureBlock,
  FileBlock,
  DetailsBlock,
  TimeBlock,
  AbbrBlock,
  MetaBlock,
  LinkBlock,
  CustomBlock,
  WordBreakBlock,
  BlockType,
} from '../types';
import { generateId } from '../core/utils';

// ═══════════════════════════════════════════════════════════════════════════
// Text Blocks
// ═══════════════════════════════════════════════════════════════════════════

export const paragraphDefinition: BlockDefinition = {
  type: 'paragraph',
  name: 'Paragraph',
  nameAr: 'فقرة',
  description: 'Plain text paragraph',
  icon: '📝',
  category: 'text',
  create: () => ({
    id: generateId('p'),
    type: 'paragraph',
    direction: 'rtl',
    content: [],
  } as TextBlock),
  canConvertTo: ['heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6', 'quote', 'bullet-list', 'numbered-list'],
};

export const heading1Definition: BlockDefinition = {
  type: 'heading1',
  name: 'Heading 1',
  nameAr: 'عنوان 1',
  description: 'Large section heading',
  icon: 'H1',
  category: 'text',
  shortcut: '# ',
  create: () => ({
    id: generateId('h1'),
    type: 'heading1',
    direction: 'rtl',
    content: [],
  } as TextBlock),
  canConvertTo: ['paragraph', 'heading2', 'heading3', 'bullet-list', 'numbered-list'],
};

export const heading2Definition: BlockDefinition = {
  type: 'heading2',
  name: 'Heading 2',
  nameAr: 'عنوان 2',
  description: 'Medium section heading',
  icon: 'H2',
  category: 'text',
  shortcut: '## ',
  create: () => ({
    id: generateId('h2'),
    type: 'heading2',
    direction: 'rtl',
    content: [],
  } as TextBlock),
  canConvertTo: ['paragraph', 'heading1', 'heading3', 'bullet-list', 'numbered-list'],
};

export const heading3Definition: BlockDefinition = {
  type: 'heading3',
  name: 'Heading 3',
  nameAr: 'عنوان 3',
  description: 'Small section heading',
  icon: 'H3',
  category: 'text',
  shortcut: '### ',
  create: () => ({
    id: generateId('h3'),
    type: 'heading3',
    direction: 'rtl',
    content: [],
  } as TextBlock),
  canConvertTo: ['paragraph', 'heading1', 'heading2', 'bullet-list', 'numbered-list'],
};

export const heading4Definition: BlockDefinition = {
  type: 'heading4',
  name: 'Heading 4',
  nameAr: 'عنوان 4',
  icon: 'H4',
  category: 'text',
  shortcut: '#### ',
  create: () => ({
    id: generateId('h4'),
    type: 'heading4',
    direction: 'rtl',
    content: [],
  } as TextBlock),
  canConvertTo: ['paragraph', 'bullet-list', 'numbered-list'],
};

export const heading5Definition: BlockDefinition = {
  type: 'heading5',
  name: 'Heading 5',
  nameAr: 'عنوان 5',
  icon: 'H5',
  category: 'text',
  shortcut: '##### ',
  create: () => ({
    id: generateId('h5'),
    type: 'heading5',
    direction: 'rtl',
    content: [],
  } as TextBlock),
  canConvertTo: ['paragraph', 'bullet-list', 'numbered-list'],
};

export const heading6Definition: BlockDefinition = {
  type: 'heading6',
  name: 'Heading 6',
  nameAr: 'عنوان 6',
  icon: 'H6',
  category: 'text',
  shortcut: '###### ',
  create: () => ({
    id: generateId('h6'),
    type: 'heading6',
    direction: 'rtl',
    content: [],
  } as TextBlock),
  canConvertTo: ['paragraph', 'bullet-list', 'numbered-list'],
};

export const quoteDefinition: BlockDefinition = {
  type: 'quote',
  name: 'Quote',
  nameAr: 'اقتباس',
  description: 'Capture a quote',
  icon: '❝',
  category: 'text',
  shortcut: '> ',
  create: () => ({
    id: generateId('q'),
    type: 'quote',
    direction: 'rtl',
    content: [],
  } as TextBlock),
  canConvertTo: ['paragraph', 'bullet-list', 'numbered-list'],
};

export const preformattedDefinition: BlockDefinition = {
  type: 'preformatted',
  name: 'Preformatted',
  nameAr: 'نص محفوظ التنسيق',
  description: 'Text with preserved whitespace and formatting',
  icon: '📄',
  category: 'text',
  create: () => ({
    id: generateId('pre'),
    type: 'preformatted',
    direction: 'rtl',
    content: '',
  } as PreformattedBlock),
};

export const lineBreakDefinition: BlockDefinition = {
  type: 'line-break',
  name: 'Line Break',
  nameAr: 'سطر جديد',
  description: 'Insert a line break',
  icon: '↵',
  category: 'text',
  shortcut: 'Shift+Enter',
  create: () => ({
    id: generateId('br'),
    type: 'line-break',
    direction: 'rtl',
  } as LineBreakBlock),
};

// ═══════════════════════════════════════════════════════════════════════════
// List Blocks
// ═══════════════════════════════════════════════════════════════════════════

export const bulletListDefinition: BlockDefinition = {
  type: 'bullet-list',
  name: 'Bullet List',
  nameAr: 'قائمة نقطية',
  description: 'Create a simple bulleted list',
  icon: '•',
  category: 'list',
  shortcut: '- ',
  create: () => ({
    id: generateId('ul'),
    type: 'bullet-list',
    direction: 'rtl',
    items: [{ id: generateId('li'), content: [] }],
  } as ListBlock),
  canConvertTo: ['numbered-list', 'paragraph'],
};

export const numberedListDefinition: BlockDefinition = {
  type: 'numbered-list',
  name: 'Numbered List',
  nameAr: 'قائمة مرقمة',
  description: 'Create a numbered list',
  icon: '1.',
  category: 'list',
  shortcut: '1. ',
  create: () => ({
    id: generateId('ol'),
    type: 'numbered-list',
    direction: 'rtl',
    items: [{ id: generateId('li'), content: [] }],
  } as ListBlock),
  canConvertTo: ['bullet-list', 'paragraph'],
};

export const definitionListDefinition: BlockDefinition = {
  type: 'definition-list',
  name: 'Definition List',
  nameAr: 'قائمة تعريفات',
  description: 'List of terms and definitions',
  icon: '📚',
  category: 'list',
  create: () => ({
    id: generateId('dl'),
    type: 'definition-list',
    direction: 'rtl',
    items: [
      {
        id: generateId('di'),
        term: [],
        definition: [],
      },
    ],
  } as DefinitionListBlock),
  canConvertTo: ['bullet-list', 'numbered-list'],
};

// ═══════════════════════════════════════════════════════════════════════════
// Media Blocks
// ═══════════════════════════════════════════════════════════════════════════

export const imageDefinition: BlockDefinition = {
  type: 'image',
  name: 'Image',
  nameAr: 'صورة',
  description: 'Upload or embed an image',
  icon: '🖼️',
  category: 'media',
  create: () => ({
    id: generateId('img'),
    type: 'image',
    direction: 'rtl',
    src: '',
    alt: '',
  } as MediaBlock),
};

export const videoDefinition: BlockDefinition = {
  type: 'video',
  name: 'Video',
  nameAr: 'فيديو',
  description: 'Embed a video',
  icon: '🎬',
  category: 'media',
  create: () => ({
    id: generateId('video'),
    type: 'video',
    direction: 'rtl',
    src: '',
  } as MediaBlock),
};

export const audioDefinition: BlockDefinition = {
  type: 'audio',
  name: 'Audio',
  nameAr: 'صوت',
  description: 'Embed an audio file',
  icon: '🎵',
  category: 'media',
  create: () => ({
    id: generateId('audio'),
    type: 'audio',
    direction: 'rtl',
    src: '',
  } as MediaBlock),
};

export const figureDefinition: BlockDefinition = {
  type: 'figure',
  name: 'Figure',
  nameAr: 'شكل',
  description: 'Image, video or audio with caption',
  icon: '🖼️',
  category: 'media',
  create: () => ({
    id: generateId('figure'),
    type: 'figure',
    direction: 'rtl',
    mediaType: 'image',
    src: '',
    alt: '',
    caption: [],
  } as FigureBlock),
};

export const fileDefinition: BlockDefinition = {
  type: 'file',
  name: 'File',
  nameAr: 'ملف',
  description: 'Downloadable file attachment',
  icon: '📎',
  category: 'media',
  create: () => ({
    id: generateId('file'),
    type: 'file',
    direction: 'rtl',
    src: '',
    label: '',
  } as FileBlock),
};

// ═══════════════════════════════════════════════════════════════════════════
// Advanced Blocks
// ═══════════════════════════════════════════════════════════════════════════

export const codeDefinition: BlockDefinition = {
  type: 'code',
  name: 'Code',
  nameAr: 'كود',
  description: 'Capture a code snippet',
  icon: '💻',
  category: 'advanced',
  shortcut: '```',
  create: () => ({
    id: generateId('code'),
    type: 'code',
    direction: 'ltr', // Code is always LTR
    language: '',
    code: '',
  } as CodeBlock),
};

export const tableDefinition: BlockDefinition = {
  type: 'table',
  name: 'Table',
  nameAr: 'جدول',
  description: 'Add a table',
  icon: '📊',
  category: 'advanced',
  create: () => ({
    id: generateId('table'),
    type: 'table',
    direction: 'rtl',
    rows: [
      {
        id: generateId('tr'),
        isHeader: true,
        cells: [
          { id: generateId('td'), content: [] },
          { id: generateId('td'), content: [] },
        ],
      },
      {
        id: generateId('tr'),
        isHeader: false,
        cells: [
          { id: generateId('td'), content: [] },
          { id: generateId('td'), content: [] },
        ],
      },
    ],
    hasHeader: true,
  } as TableBlock),
};

export const dividerDefinition: BlockDefinition = {
  type: 'divider',
  name: 'Divider',
  nameAr: 'فاصل',
  description: 'Visually divide blocks',
  icon: '—',
  category: 'advanced',
  shortcut: '---',
  create: () => ({
    id: generateId('hr'),
    type: 'divider',
    direction: 'rtl',
  } as DividerBlock),
};

// ═══════════════════════════════════════════════════════════════════════════
// Phase 3: Advanced Blocks
// ═══════════════════════════════════════════════════════════════════════════

export const detailsDefinition: BlockDefinition = {
  type: 'details',
  name: 'Details',
  nameAr: 'محتوى قابل للطي',
  description: 'Collapsible content section',
  icon: '📂',
  category: 'advanced',
  create: () => ({
    id: generateId('details'),
    type: 'details',
    direction: 'rtl',
    summary: [],
    content: [],
    isOpen: false,
  } as DetailsBlock),
};

export const timeBlockDefinition: BlockDefinition = {
  type: 'time-block',
  name: 'Time',
  nameAr: 'تاريخ/وقت',
  description: 'Display a date or time',
  icon: '📅',
  category: 'advanced',
  create: () => ({
    id: generateId('time'),
    type: 'time-block',
    direction: 'rtl',
    datetime: new Date().toISOString().split('T')[0],
    displayText: '',
  } as TimeBlock),
};

export const abbrBlockDefinition: BlockDefinition = {
  type: 'abbr-block',
  name: 'Abbreviation',
  nameAr: 'اختصار',
  description: 'Define an abbreviation',
  icon: '🔤',
  category: 'advanced',
  create: () => ({
    id: generateId('abbr'),
    type: 'abbr-block',
    direction: 'rtl',
    abbr: '',
    title: '',
  } as AbbrBlock),
};

export const metaDefinition: BlockDefinition = {
  type: 'meta',
  name: 'Metadata',
  nameAr: 'بيانات وصفية',
  description: 'Document metadata fields',
  icon: '📋',
  category: 'advanced',
  create: () => ({
    id: generateId('meta'),
    type: 'meta',
    direction: 'rtl',
    fields: [
      { id: generateId('field'), name: 'title', value: '' },
    ],
  } as MetaBlock),
};

// ═══════════════════════════════════════════════════════════════════════════
// Phase 4: Additional Blocks
// ═══════════════════════════════════════════════════════════════════════════

export const linkBlockDefinition: BlockDefinition = {
  type: 'link-block',
  name: 'Link Block',
  nameAr: 'رابط',
  description: 'Standalone link — mirrors ARTOON LinkNode (>.a::)',
  icon: '🔗',
  category: 'advanced',
  create: () => ({
    id: generateId('link'),
    type: 'link-block',
    direction: 'rtl',
    url: '',
    text: '',
    modifiers: [],
  } as LinkBlock),
};

export const customBlockDefinition: BlockDefinition = {
  type: 'custom',
  name: 'Custom Block',
  nameAr: 'بلوك مخصص',
  description: 'User-defined custom block',
  icon: '🧩',
  category: 'advanced',
  create: () => ({
    id: generateId('custom'),
    type: 'custom',
    direction: 'rtl',
    name: 'custom',
    children: [],
    fields: {},
  } as CustomBlock),
};

export const wordBreakDefinition: BlockDefinition = {
  type: 'word-break',
  name: 'Word Break',
  nameAr: 'فاصل كلمة',
  description: 'Word break opportunity',
  icon: '⎵',
  category: 'text',
  create: () => ({
    id: generateId('wbr'),
    type: 'word-break',
    direction: 'rtl',
  } as WordBreakBlock),
};

// ═══════════════════════════════════════════════════════════════════════════
// All Definitions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * All default block definitions
 */
export const defaultBlockDefinitions: BlockDefinition[] = [
  // Text
  paragraphDefinition,
  heading1Definition,
  heading2Definition,
  heading3Definition,
  heading4Definition,
  heading5Definition,
  heading6Definition,
  quoteDefinition,
  preformattedDefinition,
  lineBreakDefinition,
  // Lists
  bulletListDefinition,
  numberedListDefinition,
  definitionListDefinition,
  // Media
  imageDefinition,
  videoDefinition,
  audioDefinition,
  figureDefinition,
  fileDefinition,
  // Advanced
  codeDefinition,
  tableDefinition,
  dividerDefinition,
  // Phase 3: Advanced
  detailsDefinition,
  timeBlockDefinition,
  abbrBlockDefinition,
  metaDefinition,
  // Phase 4: Additional
  linkBlockDefinition,
  customBlockDefinition,
  wordBreakDefinition,
];

/**
 * Get definition by type
 */
export function getDefinition(type: BlockType): BlockDefinition | undefined {
  return defaultBlockDefinitions.find(d => d.type === type);
}

/**
 * Get definitions by category
 */
export function getDefinitionsByCategory(category: BlockDefinition['category']): BlockDefinition[] {
  return defaultBlockDefinitions.filter(d => d.category === category);
}
