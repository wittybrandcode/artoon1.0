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
import {
  TextBlockContent,
  ListBlockContent,
  CodeBlockContent,
  TableBlockContent,
  MediaBlockContent,
  LineBreakBlockContent,
  DividerBlockContent,
  PreformattedBlockContent,
  FigureBlockContent,
  DetailsBlockContent,
  AbbrBlockContent,
  TimeBlockContent,
  MetaBlockContent,
  LinkBlockContent,
  CustomBlockContent,
  WordBreakBlockContent,
  FileBlockContent
} from '../ui/components/block-renderers';

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
  component: TextBlockContent,
  canConvertTo: ['heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6', 'quote', 'bullet-list', 'numbered-list'],
};

export const heading1Definition: BlockDefinition = {
  type: 'heading1',
  name: 'Heading 1',
  nameAr: 'عنوان 1',
  icon: 'H1',
  category: 'text',
  shortcut: '# ',
  create: () => ({
    id: generateId('h1'),
    type: 'heading1',
    direction: 'rtl',
    content: [],
  } as TextBlock),
  component: TextBlockContent,
  canConvertTo: ['paragraph', 'heading2', 'heading3', 'quote'],
};

export const heading2Definition: BlockDefinition = {
  type: 'heading2',
  name: 'Heading 2',
  nameAr: 'عنوان 2',
  icon: 'H2',
  category: 'text',
  shortcut: '## ',
  create: () => ({
    id: generateId('h2'),
    type: 'heading2',
    direction: 'rtl',
    content: [],
  } as TextBlock),
  component: TextBlockContent,
  canConvertTo: ['paragraph', 'heading1', 'heading3', 'quote'],
};

export const heading3Definition: BlockDefinition = {
  type: 'heading3',
  name: 'Heading 3',
  nameAr: 'عنوان 3',
  icon: 'H3',
  category: 'text',
  shortcut: '### ',
  create: () => ({
    id: generateId('h3'),
    type: 'heading3',
    direction: 'rtl',
    content: [],
  } as TextBlock),
  component: TextBlockContent,
  canConvertTo: ['paragraph', 'heading1', 'heading2', 'quote'],
};

export const heading4Definition: BlockDefinition = {
  type: 'heading4',
  name: 'Heading 4',
  nameAr: 'عنوان 4',
  icon: 'H4',
  category: 'text',
  create: () => ({ id: generateId('h4'), type: 'heading4', direction: 'rtl', content: [] } as TextBlock),
  component: TextBlockContent,
  canConvertTo: ['paragraph', 'heading1', 'heading2', 'heading3', 'heading5', 'heading6', 'quote']
};

export const heading5Definition: BlockDefinition = {
  type: 'heading5',
  name: 'Heading 5',
  nameAr: 'عنوان 5',
  icon: 'H5',
  category: 'text',
  create: () => ({ id: generateId('h5'), type: 'heading5', direction: 'rtl', content: [] } as TextBlock),
  component: TextBlockContent,
  canConvertTo: ['paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading6', 'quote']
};

export const heading6Definition: BlockDefinition = {
  type: 'heading6',
  name: 'Heading 6',
  nameAr: 'عنوان 6',
  icon: 'H6',
  category: 'text',
  create: () => ({ id: generateId('h6'), type: 'heading6', direction: 'rtl', content: [] } as TextBlock),
  component: TextBlockContent,
  canConvertTo: ['paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'quote']
};

export const quoteDefinition: BlockDefinition = {
  type: 'quote',
  name: 'Quote',
  nameAr: 'اقتباس',
  icon: '❝',
  category: 'text',
  shortcut: '> ',
  create: () => ({
    id: generateId('q'),
    type: 'quote',
    direction: 'rtl',
    content: [],
  } as TextBlock),
  component: TextBlockContent,
  canConvertTo: ['paragraph', 'heading1'],
};

export const preformattedDefinition: BlockDefinition = {
  type: 'preformatted',
  name: 'Preformatted',
  nameAr: 'نص محفوظ التنسيق',
  icon: 'PRE',
  category: 'text',
  create: () => ({ id: generateId('pre'), type: 'preformatted', direction: 'rtl', content: '' } as PreformattedBlock),
  component: PreformattedBlockContent
};

export const lineBreakDefinition: BlockDefinition = {
  type: 'line-break',
  name: 'Line Break',
  nameAr: 'سطر جديد',
  icon: 'BR',
  category: 'text',
  shortcut: 'Shift+Enter',
  create: () => ({ id: generateId('br'), type: 'line-break', direction: 'rtl' } as LineBreakBlock),
  component: LineBreakBlockContent
};

export const wordBreakDefinition: BlockDefinition = {
  type: 'word-break',
  name: 'Word Break',
  nameAr: 'فاصل كلمة',
  icon: 'WBR',
  category: 'text',
  create: () => ({ id: generateId('wbr'), type: 'word-break', direction: 'rtl' } as WordBreakBlock),
  component: WordBreakBlockContent
};

// ═══════════════════════════════════════════════════════════════════════════
// List Blocks
// ═══════════════════════════════════════════════════════════════════════════

export const bulletListDefinition: BlockDefinition = {
  type: 'bullet-list',
  name: 'Bullet List',
  nameAr: 'قائمة نقطية',
  icon: '•',
  category: 'list',
  shortcut: '- ',
  create: () => ({
    id: generateId('ul'),
    type: 'bullet-list',
    direction: 'rtl',
    items: [{ id: generateId('li'), content: [], listType: 'ul' }],
  } as ListBlock),
  component: ListBlockContent,
  canConvertTo: ['paragraph', 'numbered-list'],
};

export const numberedListDefinition: BlockDefinition = {
  type: 'numbered-list',
  name: 'Numbered List',
  nameAr: 'قائمة مرقمة',
  icon: '1.',
  category: 'list',
  shortcut: '1. ',
  create: () => ({
    id: generateId('ol'),
    type: 'numbered-list',
    direction: 'rtl',
    items: [{ id: generateId('li'), content: [], listType: 'ol' }],
  } as ListBlock),
  component: ListBlockContent,
  canConvertTo: ['paragraph', 'bullet-list'],
};

export const definitionListDefinition: BlockDefinition = {
  type: 'definition-list',
  name: 'Definition List',
  nameAr: 'قائمة تعريفات',
  icon: 'DL',
  category: 'list',
  create: () => ({
    id: generateId('dl'),
    type: 'definition-list',
    direction: 'rtl',
    items: [{ id: generateId('di'), term: [], definition: [] }]
  } as DefinitionListBlock),
  component: ListBlockContent
};

// ═══════════════════════════════════════════════════════════════════════════
// Advanced Blocks
// ═══════════════════════════════════════════════════════════════════════════

export const codeDefinition: BlockDefinition = {
  type: 'code',
  name: 'Code Block',
  nameAr: 'كتلة كود',
  icon: '</>',
  category: 'advanced',
  shortcut: '```',
  create: () => ({
    id: generateId('code'),
    type: 'code',
    direction: 'ltr',
    code: '',
    language: 'javascript',
    showLineNumbers: true,
  } as CodeBlock),
  component: CodeBlockContent,
};

export const tableDefinition: BlockDefinition = {
  type: 'table',
  name: 'Table',
  nameAr: 'جدول',
  icon: '田',
  category: 'advanced',
  create: () => ({
    id: generateId('table'),
    type: 'table',
    direction: 'rtl',
    rows: [
      { id: generateId('tr'), isHeader: true, cells: [{ id: generateId('td'), content: [] }, { id: generateId('td'), content: [] }] },
      { id: generateId('tr'), cells: [{ id: generateId('td'), content: [] }, { id: generateId('td'), content: [] }] },
    ],
  } as TableBlock),
  component: TableBlockContent,
};

export const dividerDefinition: BlockDefinition = {
  type: 'divider',
  name: 'Divider',
  nameAr: 'فاصل',
  icon: '―',
  category: 'advanced',
  shortcut: '---',
  create: () => ({
    id: generateId('hr'),
    type: 'divider',
    direction: 'rtl',
  } as DividerBlock),
  component: DividerBlockContent,
};

export const figureDefinition: BlockDefinition = {
  type: 'figure',
  name: 'Figure',
  nameAr: 'شكل',
  icon: 'FIG',
  category: 'media',
  create: () => ({
    id: generateId('fig'),
    type: 'figure',
    direction: 'rtl',
    mediaType: 'image',
    src: '',
    caption: [],
  } as FigureBlock),
  component: FigureBlockContent
};

export const detailsDefinition: BlockDefinition = {
  type: 'details',
  name: 'Details',
  nameAr: 'محتوى قابل للطي',
  icon: 'DET',
  category: 'advanced',
  create: () => ({
    id: generateId('det'),
    type: 'details',
    direction: 'rtl',
    summary: [],
    content: [],
    isOpen: false,
  } as DetailsBlock),
  component: DetailsBlockContent
};

export const timeBlockDefinition: BlockDefinition = {
  type: 'time-block',
  name: 'Time',
  nameAr: 'تاريخ/وقت',
  icon: 'TIME',
  category: 'advanced',
  create: () => ({
    id: generateId('time'),
    type: 'time-block',
    direction: 'rtl',
    datetime: new Date().toISOString(),
    displayText: '',
  } as TimeBlock),
  component: TimeBlockContent
};

export const abbrBlockDefinition: BlockDefinition = {
  type: 'abbr-block',
  name: 'Abbreviation',
  nameAr: 'اختصار',
  icon: 'ABBR',
  category: 'advanced',
  create: () => ({
    id: generateId('abbr'),
    type: 'abbr-block',
    direction: 'rtl',
    abbr: '',
    title: '',
  } as AbbrBlock),
  component: AbbrBlockContent
};

export const metaDefinition: BlockDefinition = {
  type: 'meta',
  name: 'Metadata',
  nameAr: 'بيانات وصفية',
  icon: 'META',
  category: 'advanced',
  create: () => ({
    id: generateId('meta'),
    type: 'meta',
    direction: 'rtl',
    fields: [{ id: generateId('field'), name: 'title', value: '' }],
  } as MetaBlock),
  component: MetaBlockContent
};

export const linkBlockDefinition: BlockDefinition = {
  type: 'link-block',
  name: 'Link Block',
  nameAr: 'رابط',
  icon: 'LINK',
  category: 'advanced',
  create: () => ({
    id: generateId('link'),
    type: 'link-block',
    direction: 'rtl',
    url: '',
    text: '',
    modifiers: [],
  } as LinkBlock),
  component: LinkBlockContent
};

export const customBlockDefinition: BlockDefinition = {
  type: 'custom',
  name: 'Custom Block',
  nameAr: 'بلوك مخصص',
  icon: 'CUST',
  category: 'advanced',
  create: () => ({
    id: generateId('cust'),
    type: 'custom',
    direction: 'rtl',
    name: 'custom',
    children: [],
    fields: {},
  } as CustomBlock),
  component: CustomBlockContent
};

// ═══════════════════════════════════════════════════════════════════════════
// Media Blocks
// ═══════════════════════════════════════════════════════════════════════════

export const imageDefinition: BlockDefinition = {
  type: 'image',
  name: 'Image',
  nameAr: 'صورة',
  icon: '🖼️',
  category: 'media',
  create: () => ({
    id: generateId('img'),
    type: 'image',
    direction: 'rtl',
    src: '',
    alt: '',
    caption: [],
  } as MediaBlock),
  component: MediaBlockContent,
};

export const videoDefinition: BlockDefinition = {
  type: 'video',
  name: 'Video',
  nameAr: 'فيديو',
  icon: '🎥',
  category: 'media',
  create: () => ({
    id: generateId('video'),
    type: 'video',
    direction: 'rtl',
    src: '',
    caption: [],
  } as MediaBlock),
  component: MediaBlockContent,
};

export const audioDefinition: BlockDefinition = {
  type: 'audio',
  name: 'Audio',
  nameAr: 'صوت',
  icon: '🔊',
  category: 'media',
  create: () => ({
    id: generateId('audio'),
    type: 'audio',
    direction: 'rtl',
    src: '',
    caption: [],
  } as MediaBlock),
  component: MediaBlockContent
};

export const fileDefinition: BlockDefinition = {
  type: 'file',
  name: 'File',
  nameAr: 'ملف',
  icon: '📎',
  category: 'media',
  create: () => ({
    id: generateId('file'),
    type: 'file',
    direction: 'rtl',
    src: '',
    label: '',
  } as FileBlock),
  component: FileBlockContent,
};

// ═══════════════════════════════════════════════════════════════════════════
// Registry Functions
// ═══════════════════════════════════════════════════════════════════════════

export const defaultBlockDefinitions: BlockDefinition[] = [
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
  wordBreakDefinition,
  bulletListDefinition,
  numberedListDefinition,
  definitionListDefinition,
  codeDefinition,
  tableDefinition,
  dividerDefinition,
  figureDefinition,
  detailsDefinition,
  timeBlockDefinition,
  abbrBlockDefinition,
  metaDefinition,
  linkBlockDefinition,
  customBlockDefinition,
  imageDefinition,
  videoDefinition,
  audioDefinition,
  fileDefinition,
];

export function getDefinition(type: BlockType): BlockDefinition | undefined {
  return defaultBlockDefinitions.find(d => d.type === type);
}

export function getDefinitionsByCategory(category: BlockDefinition['category']): BlockDefinition[] {
  return defaultBlockDefinitions.filter(d => d.category === category);
}
