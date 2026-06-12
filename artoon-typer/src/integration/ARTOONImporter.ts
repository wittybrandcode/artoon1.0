/**
 * ARTOONImporter
 * 
 * Imports ARTOON format text and converts it to editor blocks.
 * Uses @artoon/parser for parsing.
 * 
 * SIMPLIFIED in Type Unification Phase 4:
 * - Parser now outputs InlineContent[] directly (no more ParsedContent conversion)
 * - Parser uses `type` property (same as editor blocks)
 * - Parser uses `separatorType` instead of `separators[]`
 * - Parser uses `ListItem.children?: ListItem[]` directly
 */

import { parse } from '@artoon/parser';
import type {
  Direction,
  InlineContent,
  ListItem as ASTListItem,
  SeparatorType,
} from '@artoon/ast';
import type {
  Block,
  TextBlock,
  ListBlock,
  ListItem,
  CodeBlock,
  TableBlock,
  TableRow,
  MediaBlock,
  DividerBlock,
  PreformattedBlock,
  LineBreakBlock,
  DefinitionListBlock,
  DefinitionItem,
  FigureBlock,
  FileBlock,
  DetailsBlock,
  TimeBlock,
  AbbrBlock,
  MetaBlock,
  MetaField,
  LinkBlock,
  CustomBlock,
  WordBreakBlock,
} from '../types';
import { generateId } from '../core/utils';

// ═══════════════════════════════════════════════════════════════════════════
// Parser AST Types (aligned with @artoon/parser output)
// ═══════════════════════════════════════════════════════════════════════════

interface ParserASTNode {
  type: string;
  line: number;
  direction: Direction;
}

interface ParserTextNode extends ParserASTNode {
  type: 'text';
  textType: string;
  content: readonly InlineContent[];  // Parser now outputs InlineContent[] directly!
}

interface ParserListNode extends ParserASTNode {
  type: 'list';
  listType: 'ul' | 'ol' | 'dl';
  items: readonly ASTListItem[];  // Uses AST ListItem directly
}

interface ParserBlockNode extends ParserASTNode {
  type: 'block';
  blockName: string;
  lang?: string;
  content: ParserASTNode[] | string;
}

interface ParserTableNode extends ParserASTNode {
  type: 'table';
  headers: string[];
  rows: string[][];
}

interface ParserMediaNode extends ParserASTNode {
  type: 'media';
  mediaType: 'img' | 'video' | 'audio' | 'file';
  src: string;
  alt?: string;
  title?: string;
  label?: string;
}

interface ParserSeparatorNode extends ParserASTNode {
  type: 'separator';
  separatorType: SeparatorType;  // Changed from separators[] to separatorType
}

interface ParserCompoundNode extends ParserASTNode {
  type: 'compound';
  compoundType: 'figure' | 'details';
  children: ParserASTNode[];
}

interface ParserDocumentNode {
  type: 'document';
  meta?: ParserBlockNode;
  children: ParserASTNode[];
}

interface ParseResult {
  ast: ParserDocumentNode;
  errors: unknown[];
}

/**
 * Import options
 */
export interface ImportOptions {
  /** Default direction for blocks */
  defaultDirection?: Direction;
}

const DEFAULT_OPTIONS: ImportOptions = {
  defaultDirection: 'rtl',
};

/**
 * ARTOONImporter - converts ARTOON text to editor blocks
 * 
 * SIMPLIFIED: Parser now handles InlineContent[] conversion,
 * so we just need to add IDs and map types.
 */
export class ARTOONImporter {
  private options: Required<ImportOptions>;

  constructor(options: ImportOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options } as Required<ImportOptions>;
  }

  /**
   * Import ARTOON text to blocks
   */
  import(artoonText: string): Block[] {
    if (!artoonText || artoonText.trim() === '') {
      return [];
    }

    try {
      const result = parse(artoonText) as ParseResult;
      return this.convertDocument(result.ast);
    } catch (error) {
      console.error('ARTOONImporter: Parse error', error);
      return [];
    }
  }

  /**
   * Convert AST document to blocks
   */
  private convertDocument(doc: ParserDocumentNode): Block[] {
    const blocks: Block[] = [];

    // Import META block first if present
    if (doc.meta) {
      const metaBlock = this.convertBlockNode(doc.meta);
      if (metaBlock) {
        blocks.push(metaBlock);
      }
    }

    if (!doc.children || !Array.isArray(doc.children)) {
      return blocks;
    }

    for (const node of doc.children) {
      const block = this.convertNode(node);
      if (block) {
        blocks.push(block);
      }
    }

    return blocks;
  }

  /**
   * Convert a single AST node to a block
   */
  private convertNode(node: ParserASTNode): Block | null {
    switch (node.type) {
      case 'text':
        return this.convertTextNode(node as ParserTextNode);
      case 'list':
        return this.convertListNode(node as ParserListNode);
      case 'block':
        return this.convertBlockNode(node as ParserBlockNode);
      case 'table':
        return this.convertTableNode(node as ParserTableNode);
      case 'media':
        return this.convertMediaNode(node as ParserMediaNode);
      case 'separator':
        return this.convertSeparatorNode(node as ParserSeparatorNode);
      case 'compound':
        return this.convertCompoundNode(node as ParserCompoundNode);
      case 'link':
        return this.convertLinkNode(node as any);
      default:
        return null;
    }
  }

  /**
   * Convert LinkNode to LinkBlock
   * Maps ARTOON's LinkNode (>.a:: url; text) to editor's link-block
   */
  private convertLinkNode(node: { type: 'link'; url: string; text?: string; modifiers: any[]; direction: any }): LinkBlock {
    return {
      id: generateId(),
      type: 'link-block',
      direction: node.direction || this.options.defaultDirection,
      url: node.url || '',
      text: node.text || node.url || '',
      modifiers: node.modifiers || [],
    } as LinkBlock;
  }

  /**
   * Convert text node to TextBlock
   * SIMPLIFIED: content is already InlineContent[]
   */
  private convertTextNode(node: ParserTextNode): TextBlock | PreformattedBlock | LineBreakBlock | TimeBlock | AbbrBlock | WordBreakBlock | MediaBlock | FileBlock {
    // Handle preformatted text
    if (node.textType === 'pre') {
      const plainText = this.getPlainText(node.content);
      return {
        id: generateId(),
        type: 'preformatted',
        direction: node.direction || this.options.defaultDirection,
        content: plainText,
      } as PreformattedBlock;
    }

    // Handle line break
    if (node.textType === 'br') {
      return {
        id: generateId(),
        type: 'line-break',
        direction: node.direction || this.options.defaultDirection,
      } as LineBreakBlock;
    }

    // Handle word break
    if (node.textType === 'wbr') {
      return {
        id: generateId(),
        type: 'word-break',
        direction: node.direction || this.options.defaultDirection,
      } as WordBreakBlock;
    }

    // Handle media components (img, video, audio)
    if (node.textType === 'img' || node.textType === 'video' || node.textType === 'audio') {
      const text = this.getPlainText(node.content);
      const parts = text.split(';').map((s: string) => s.trim());
      const mediaType = node.textType === 'video' ? 'video' :
        node.textType === 'audio' ? 'audio' : 'image';
      return {
        id: generateId(),
        type: mediaType,
        direction: node.direction || this.options.defaultDirection,
        src: parts[0] || '',
        alt: parts[1] || '',
        caption: parts[2] ? [{ type: 'plain', value: parts[2] }] : undefined,
      } as MediaBlock;
    }

    // Handle file component
    if (node.textType === 'file') {
      const text = this.getPlainText(node.content);
      const parts = text.split(';').map((s: string) => s.trim());
      return {
        id: generateId(),
        type: 'file',
        direction: node.direction || this.options.defaultDirection,
        src: parts[0] || '',
        label: parts[1] || 'ملف',
      } as FileBlock;
    }

    // Handle time block
    if (node.textType === 'time') {
      const text = this.getPlainText(node.content);
      const parts = text.split(';').map((s: string) => s.trim());
      return {
        id: generateId(),
        type: 'time-block',
        direction: node.direction || this.options.defaultDirection,
        datetime: parts[0] || '',
        displayText: parts[1] || '',
      } as TimeBlock;
    }

    // Handle abbr block
    if (node.textType === 'abbr') {
      const text = this.getPlainText(node.content);
      const parts = text.split(';').map((s: string) => s.trim());
      return {
        id: generateId(),
        type: 'abbr-block',
        direction: node.direction || this.options.defaultDirection,
        abbr: parts[0] || '',
        title: parts[1] || '',
      } as AbbrBlock;
    }

    // NOTE: Standalone links (>.a::) are handled by convertLinkNode via case 'link'
    // They never reach this method as TextNode

    const blockType = this.getTextBlockType(node.textType);

    return {
      id: generateId(),
      type: blockType,
      direction: node.direction || this.options.defaultDirection,
      content: node.content,  // Already InlineContent[] - no conversion needed!
    };
  }

  /**
   * Get plain text from InlineContent[]
   */
  private getPlainText(content: readonly InlineContent[]): string {
    if (!content || content.length === 0) return '';
    return content.map(item => {
      if (item.type === 'plain') return item.value;
      return item.value || '';
    }).join('');
  }

  /**
   * Get block type from component type
   */
  private getTextBlockType(componentType?: string): TextBlock['type'] {
    switch (componentType) {
      case 't1': return 'heading1';
      case 't2': return 'heading2';
      case 't3': return 'heading3';
      case 't4': return 'heading4';
      case 't5': return 'heading5';
      case 't6': return 'heading6';
      case 'q': return 'quote';
      default: return 'paragraph';
    }
  }

  /**
   * Get block type from any component type (for custom blocks)
   */
  private getBlockType(componentType?: string): Block['type'] {
    switch (componentType) {
      case 't1': return 'heading1';
      case 't2': return 'heading2';
      case 't3': return 'heading3';
      case 't4': return 'heading4';
      case 't5': return 'heading5';
      case 't6': return 'heading6';
      case 'q': return 'quote';
      case 'p': return 'paragraph';
      case 'text': return 'paragraph';
      default: return 'paragraph';
    }
  }

  /**
   * Convert list node to ListBlock or DefinitionListBlock
   * SIMPLIFIED: items already have correct structure
   */
  private convertListNode(node: ParserListNode): ListBlock | DefinitionListBlock {
    // Handle definition list
    if (node.listType === 'dl') {
      return this.convertDefinitionList(node);
    }

    // Phase 20: Always use unified 'list' type.
    // Each item carries its own listType (ul/ol), so block-level type is irrelevant.
    return {
      id: generateId(),
      type: 'list',
      direction: node.direction || this.options.defaultDirection,
      items: this.addIdsToListItems(node.items),
    };
  }

  /**
   * Add IDs to list items recursively
   * SIMPLIFIED: children is already ListItem[] (not ListNode)
   * Preserves itemType and childListType for ARTOON round-trip fidelity
   */
  private addIdsToListItems(items: readonly ASTListItem[]): ListItem[] {
    return items.map(item => ({
      id: generateId(),
      itemType: item.itemType,          // Preserve ARTOON itemType (li, dt, dd)
      listType: item.listType,          // Phase 18: Preserve per-item list type
      childListType: item.childListType, // Preserve nested list container type
      content: item.content,            // Already InlineContent[]
      children: item.children ? this.addIdsToListItems(item.children) : undefined,
    }));
  }

  /**
   * Convert definition list
   */
  private convertDefinitionList(node: ParserListNode): DefinitionListBlock {
    const items: DefinitionItem[] = [];
    let currentItem: DefinitionItem | null = null;

    for (const item of node.items || []) {
      if (item.itemType === 'dt') {
        // Start new definition item
        if (currentItem) {
          items.push(currentItem);
        }
        currentItem = {
          id: generateId(),
          term: [...item.content],  // Spread to mutable InlineContent[]
          definition: [],
        };
      } else if (item.itemType === 'dd' && currentItem) {
        // Add definition to current item
        currentItem.definition = [...item.content];  // Spread to mutable InlineContent[]
      }
    }

    // Push last item
    if (currentItem) {
      items.push(currentItem);
    }

    // Ensure at least one item
    if (items.length === 0) {
      items.push({
        id: generateId(),
        term: [],
        definition: [],
      });
    }

    return {
      id: generateId(),
      type: 'definition-list',
      direction: node.direction || this.options.defaultDirection,
      items,
    };
  }


  /**
   * Convert block node to CodeBlock, MetaBlock, or DetailsBlock
   */
  private convertBlockNode(node: ParserBlockNode): CodeBlock | MetaBlock | DetailsBlock | CustomBlock | null {
    // Handle code blocks
    if (node.blockName === 'code') {
      return {
        id: generateId(),
        type: 'code',
        direction: node.direction || this.options.defaultDirection,
        language: node.lang || 'plaintext',
        code: typeof node.content === 'string' ? node.content : '',
        showLineNumbers: true,
      };
    }

    // Handle meta blocks
    if (node.blockName === 'meta') {
      const fields: MetaField[] = [];
      if (Array.isArray(node.content)) {
        for (const child of node.content) {
          const childAny = child as { fieldName?: string; content?: InlineContent[] | string };
          if (childAny.fieldName && childAny.content) {
            const content = childAny.content;
            fields.push({
              id: generateId(),
              name: childAny.fieldName,
              value: Array.isArray(content)
                ? this.getPlainText(content)
                : (typeof content === 'string' ? content : ''),
            });
          }
        }
      }
      return {
        id: generateId(),
        type: 'meta',
        direction: node.direction || this.options.defaultDirection,
        fields: fields.length > 0 ? fields : [{ id: generateId(), name: '', value: '' }],
      };
    }

    // Handle details blocks
    if (node.blockName === 'details') {
      const content: Block[] = [];
      let summary: InlineContent[] = [];

      if (Array.isArray(node.content)) {
        for (const child of node.content) {
          const childAny = child as { fieldName?: string; textType?: string; content?: readonly InlineContent[] };
          if (childAny.fieldName === 'summary' || childAny.textType === 'summary') {
            summary = [...(childAny.content || [])];
          } else {
            const block = this.convertNode(child as ParserASTNode);
            if (block) content.push(block);
          }
        }
      }

      return {
        id: generateId(),
        type: 'details',
        direction: node.direction || this.options.defaultDirection,
        summary,
        content,
        isOpen: false,
      };
    }

    // Handle custom blocks (any other block name)
    let children: any[] = [];

    if (typeof node.content === 'string' && node.content.trim()) {
      // DON'T parse string content - it might be code examples or other content
      // that shouldn't be interpreted as ARTOON syntax.
      // This prevents issues with code blocks containing ARTOON syntax as examples.
      children = [{
        id: generateId(),
        type: 'paragraph',
        content: [{ type: 'plain' as const, value: node.content }],
      }];
    } else if (Array.isArray(node.content)) {
      // Content is already an array of nodes
      children = node.content.map((child) => {
        const childAny = child as { textType?: string; content?: readonly InlineContent[] | string };
        const textType = childAny.textType || 'p';
        const blockType = this.getBlockType(textType);

        return {
          id: generateId(),
          type: blockType,
          content: Array.isArray(childAny.content)
            ? childAny.content
            : (typeof childAny.content === 'string'
              ? [{ type: 'plain' as const, value: childAny.content }]
              : []),
        };
      });
    }

    return {
      id: generateId(),
      type: 'custom',
      direction: node.direction || this.options.defaultDirection,
      name: node.blockName,
      children,
      fields: {},
    } as CustomBlock;
  }

  /**
   * Convert table node to TableBlock
   */
  private convertTableNode(node: ParserTableNode): TableBlock {
    const rows: TableRow[] = [];

    // Add header row if exists
    if (node.headers && node.headers.length > 0) {
      rows.push({
        id: generateId(),
        cells: node.headers.map(header => ({
          id: generateId(),
          content: [{ type: 'plain' as const, value: header }],
        })),
        isHeader: true,
      });
    }

    // Add data rows
    if (node.rows) {
      for (const row of node.rows) {
        rows.push({
          id: generateId(),
          cells: row.map(cell => ({
            id: generateId(),
            content: [{ type: 'plain' as const, value: cell }],
          })),
          isHeader: false,
        });
      }
    }

    return {
      id: generateId(),
      type: 'table',
      direction: node.direction || this.options.defaultDirection,
      rows,
      hasHeader: node.headers && node.headers.length > 0,
    };
  }

  /**
   * Convert media node to MediaBlock or FileBlock
   */
  private convertMediaNode(node: ParserMediaNode): MediaBlock | FileBlock {
    // Handle file type
    if (node.mediaType === 'file') {
      return {
        id: generateId(),
        type: 'file',
        direction: node.direction || this.options.defaultDirection,
        src: node.src || '',
        label: node.label || node.alt || 'ملف',
      } as FileBlock;
    }

    const mediaType = this.getMediaBlockType(node.mediaType);

    return {
      id: generateId(),
      type: mediaType,
      direction: node.direction || this.options.defaultDirection,
      src: node.src || '',
      alt: node.alt,
    };
  }

  /**
   * Get media block type
   */
  private getMediaBlockType(mediaType?: string): MediaBlock['type'] {
    switch (mediaType) {
      case 'video': return 'video';
      case 'audio': return 'audio';
      default: return 'image';
    }
  }

  /**
   * Convert separator node to DividerBlock or LineBreakBlock
   * UPDATED: uses separatorType instead of separators[]
   */
  private convertSeparatorNode(node: ParserSeparatorNode): DividerBlock | LineBreakBlock | null {
    // Handle hr (divider)
    if (node.separatorType === 'hr') {
      return {
        id: generateId(),
        type: 'divider',
        direction: node.direction || this.options.defaultDirection,
      };
    }

    // Handle br (line break)
    if (node.separatorType === 'br') {
      return {
        id: generateId(),
        type: 'line-break',
        direction: node.direction || this.options.defaultDirection,
      };
    }

    return null;
  }

  /**
   * Convert compound node to FigureBlock or DetailsBlock
   */
  private convertCompoundNode(node: ParserCompoundNode): FigureBlock | DetailsBlock | null {
    if (node.compoundType === 'figure') {
      return this.convertFigureNode(node);
    }

    if (node.compoundType === 'details') {
      return this.convertDetailsNode(node);
    }

    return null;
  }

  /**
   * Convert figure compound to FigureBlock
   */
  private convertFigureNode(node: ParserCompoundNode): FigureBlock | null {
    // Extract media child
    const mediaChild = node.children.find(
      child => child.type === 'media'
    ) as ParserMediaNode | undefined;

    if (!mediaChild) {
      console.warn('Figure without media child');
      return null;
    }

    // Extract caption child (figcaption or caption)
    const captionChild = node.children.find(
      child => child.type === 'text' &&
        ((child as ParserTextNode).textType === 'figcaption' ||
          (child as ParserTextNode).textType === 'caption')
    ) as ParserTextNode | undefined;

    // Map media type
    const mediaType = this.getFigureMediaType(mediaChild.mediaType);

    return {
      id: generateId(),
      type: 'figure',
      direction: node.direction || this.options.defaultDirection,
      mediaType,
      src: mediaChild.src || '',
      alt: mediaChild.alt,
      caption: [...(captionChild?.content || [])],
    };
  }

  /**
   * Convert details compound to DetailsBlock
   */
  private convertDetailsNode(node: ParserCompoundNode): DetailsBlock {
    // Extract summary child
    const summaryChild = node.children.find(
      child => child.type === 'text' &&
        (child as ParserTextNode).textType === 'summary'
    ) as ParserTextNode | undefined;

    // Extract content children (all except summary)
    const contentChildren = node.children.filter(
      child => !(child.type === 'text' &&
        (child as ParserTextNode).textType === 'summary')
    );

    // Convert content children to blocks
    const content: Block[] = [];
    for (const child of contentChildren) {
      const block = this.convertNode(child);
      if (block) {
        content.push(block);
      }
    }

    return {
      id: generateId(),
      type: 'details',
      direction: node.direction || this.options.defaultDirection,
      summary: [...(summaryChild?.content || [])],
      content,
      isOpen: false,
    };
  }

  /**
   * Map parser media type to figure media type
   */
  private getFigureMediaType(mediaType: string): 'image' | 'video' | 'audio' {
    switch (mediaType) {
      case 'video': return 'video';
      case 'audio': return 'audio';
      default: return 'image';
    }
  }
}

/**
 * Create an ARTOON importer
 */
export function createARTOONImporter(options?: ImportOptions): ARTOONImporter {
  return new ARTOONImporter(options);
}

/**
 * Import ARTOON text to blocks (convenience function)
 */
export function importARTOON(artoonText: string, options?: ImportOptions): Block[] {
  return new ARTOONImporter(options).import(artoonText);
}
