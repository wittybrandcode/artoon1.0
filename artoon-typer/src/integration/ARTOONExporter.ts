/**
 * ARTOONExporter
 * 
 * Exports editor blocks to ARTOON format text.
 * Uses @artoon/serializer for serialization.
 * 
 * UPDATED in Type Unification Phase 4:
 * - All nodes now have both `type` and `nodeType` (compatibility layer)
 * - Uses `separatorType` instead of `separators[]`
 * - Uses `ListItem.children?: ListItem[]` directly
 */

import { serialize } from '@artoon/serializer';
import type {
  ARTOONDocument,
  ContentNode,
  TextNode,
  ListNode,
  ListItem as ASTListItem,
  BlockNode,
  TableNode,
  TableRow as ASTTableRow,
  TableCell as ASTTableCell,
  MediaNode,
  SeparatorNode,
  InlineContent,
  TextType,
  ListType,
} from '@artoon/ast';
import type {
  Block,
  TextBlock,
  ListBlock,
  ListItem,
  CodeBlock,
  TableBlock,
  TableCell,
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
} from '../types';

/**
 * Export options
 */
export interface ExportOptions {
  /** Pretty print output */
  prettyPrint?: boolean;
  /** Add blank lines between blocks */
  blankLinesBetween?: boolean;
}

const DEFAULT_OPTIONS: ExportOptions = {
  prettyPrint: true,
  blankLinesBetween: true,
};

/**
 * ARTOONExporter - converts editor blocks to ARTOON text
 */
export class ARTOONExporter {
  private options: Required<ExportOptions>;
  private lineCounter: number = 1;

  constructor(options: ExportOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options } as Required<ExportOptions>;
  }

  /**
   * Export blocks to ARTOON text
   */
  export(blocks: Block[]): string {
    if (!blocks || blocks.length === 0) {
      return '';
    }

    this.lineCounter = 1;
    const doc = this.convertToDocument(blocks);

    return serialize(doc, {
      blankLinesBetween: this.options.blankLinesBetween,
    });
  }

  /**
   * Convert blocks to AST document
   */
  private convertToDocument(blocks: Block[]): any {
    const content: ContentNode[] = [];
    let metaNode: BlockNode | undefined;

    for (const block of blocks) {
      // Handle META block separately
      if (block.type === 'meta') {
        metaNode = this.convertMetaBlock(block as MetaBlock);
        continue;
      }

      const node = this.convertBlock(block);
      if (node) {
        content.push(node);
      }
    }

    return {
      version: '1.0',
      meta: metaNode,  // BlockNode for parser compatibility
      content,
    };
  }

  /**
   * Convert a single block to AST node
   */
  private convertBlock(block: Block): ContentNode | null {
    switch (block.type) {
      case 'paragraph':
      case 'heading1':
      case 'heading2':
      case 'heading3':
      case 'heading4':
      case 'heading5':
      case 'heading6':
      case 'quote':
        return this.convertTextBlock(block as TextBlock);
      case 'preformatted':
        return this.convertPreformattedBlock(block as PreformattedBlock);
      case 'line-break':
        return this.convertLineBreakBlock(block as LineBreakBlock);
      case 'list':
      case 'bullet-list':
      case 'numbered-list':
        return this.convertListBlock(block as ListBlock);
      case 'definition-list':
        return this.convertDefinitionListBlock(block as DefinitionListBlock);
      case 'code':
        return this.convertCodeBlock(block as CodeBlock);
      case 'table':
        return this.convertTableBlock(block as TableBlock);
      case 'image':
      case 'video':
      case 'audio':
        return this.convertMediaBlock(block as MediaBlock);
      case 'figure':
        return this.convertFigureBlock(block as FigureBlock);
      case 'file':
        return this.convertFileBlock(block as FileBlock);
      case 'divider':
        return this.convertDividerBlock(block as DividerBlock);
      case 'details':
        return this.convertDetailsBlock(block as DetailsBlock);
      case 'time-block':
        return this.convertTimeBlock(block as TimeBlock);
      case 'abbr-block':
        return this.convertAbbrBlock(block as AbbrBlock);
      case 'meta':
        return this.convertMetaBlock(block as MetaBlock);
      case 'link-block':
        return this.convertLinkBlock(block as LinkBlock);
      case 'custom':
        return this.convertCustomBlock(block as CustomBlock);
      case 'word-break':
        return this.convertWordBreakBlock(block as WordBreakBlock);
      default:
        return null;
    }
  }

  /**
   * Convert TextBlock to TextNode
   */
  private convertTextBlock(block: TextBlock): TextNode {
    return {
      type: 'text',
      nodeType: 'text',
      textType: this.getTextType(block.type),
      direction: block.direction,
      line: this.lineCounter++,
      content: this.convertInlineContent(block.content),
    };
  }

  /**
   * Convert PreformattedBlock to TextNode
   */
  private convertPreformattedBlock(block: PreformattedBlock): TextNode {
    return {
      type: 'text',
      nodeType: 'text',
      textType: 'pre',
      direction: block.direction,
      line: this.lineCounter++,
      content: [{ type: 'plain', value: block.content }],
    };
  }

  /**
   * Convert LineBreakBlock to SeparatorNode
   */
  private convertLineBreakBlock(block: LineBreakBlock): SeparatorNode {
    return {
      type: 'separator',
      nodeType: 'separator',
      separatorType: 'br',
      direction: block.direction,
      line: this.lineCounter++,
    };
  }

  /**
   * Convert inline content to AST format
   */
  private convertInlineContent(content: readonly InlineContent[] | undefined): readonly InlineContent[] {
    if (!content || content.length === 0) {
      return [{ type: 'plain', value: '' }];
    }
    return content;
  }

  /**
   * Get AST text type from block type
   */
  private getTextType(blockType: TextBlock['type']): TextType {
    switch (blockType) {
      case 'heading1': return 't1';
      case 'heading2': return 't2';
      case 'heading3': return 't3';
      case 'heading4': return 't4';
      case 'heading5': return 't5';
      case 'heading6': return 't6';
      case 'quote': return 'q';
      default: return 'p';
    }
  }

  /**
   * Convert ListBlock to ListNode
   */
  private convertListBlock(block: ListBlock): ListNode {
    // Phase 20: Derive listType from item-level types, not block.type.
    // block.type 'bullet-list'/'numbered-list' are legacy — always check items first.
    let listType: ListType;
    if (block.items.length > 0 && block.items[0].listType) {
      listType = block.items[0].listType as ListType;
    } else if (block.type === 'numbered-list') {
      listType = 'ol';
    } else {
      listType = 'ul';
    }

    return {
      type: 'list',
      nodeType: 'list',
      listType,
      direction: block.direction,
      line: this.lineCounter++,
      items: this.convertListItems(block.items),
    };
  }

  /**
   * Convert DefinitionListBlock to ListNode
   */
  private convertDefinitionListBlock(block: DefinitionListBlock): ListNode {
    const items: ASTListItem[] = [];

    for (const item of block.items) {
      items.push({
        itemType: 'dt',
        content: this.convertInlineContent(item.term),
      });
      items.push({
        itemType: 'dd',
        content: this.convertInlineContent(item.definition),
      });
    }

    return {
      type: 'list',
      nodeType: 'list',
      listType: 'dl',
      direction: block.direction,
      line: this.lineCounter++,
      items,
    };
  }

  /**
   * Convert list items to AST format
   * Uses preserved itemType and childListType from import
   */
  private convertListItems(items: ListItem[]): ASTListItem[] {
    return items.map(item => ({
      itemType: item.itemType || 'li',
      listType: item.listType,
      childListType: item.childListType,
      content: this.convertInlineContent(item.content),
      children: item.children && item.children.length > 0
        ? this.convertListItems(item.children)
        : undefined,
    }));
  }

  /**
   * Convert CodeBlock to BlockNode
   */
  private convertCodeBlock(block: CodeBlock): BlockNode {
    return {
      type: 'block',
      nodeType: 'block',
      blockName: 'code',
      isCode: true,
      language: block.language || 'plaintext',
      direction: block.direction,
      line: this.lineCounter++,
      content: block.code || '',
    };
  }

  /**
   * Convert TableBlock to TableNode
   */
  private convertTableBlock(block: TableBlock): TableNode {
    const rows: ASTTableRow[] = [];
    let headers: ASTTableRow | undefined;

    for (const row of block.rows) {
      const astRow: ASTTableRow = {
        rowType: row.isHeader ? 'th' : 'tr',
        cells: this.convertTableCells(row.cells),
      };

      if (row.isHeader) {
        headers = astRow;
      } else {
        rows.push(astRow);
      }
    }

    return {
      type: 'table',
      nodeType: 'table',
      direction: block.direction,
      line: this.lineCounter++,
      headers,
      rows,
    };
  }

  /**
   * Convert table cells to AST format
   */
  private convertTableCells(cells: TableCell[]): ASTTableCell[] {
    return cells.map(cell => ({
      content: this.convertInlineContent(cell.content),
    }));
  }

  /**
   * Convert MediaBlock to MediaNode
   */
  private convertMediaBlock(block: MediaBlock): MediaNode {
    return {
      type: 'media',
      nodeType: 'media',
      mediaType: this.getMediaType(block.type),
      direction: block.direction,
      line: this.lineCounter++,
      src: block.src || '',
      alt: block.alt,
    };
  }

  /**
   * Convert FigureBlock to BlockNode
   */
  private convertFigureBlock(block: FigureBlock): BlockNode {
    const content: ContentNode[] = [];

    content.push({
      type: 'media',
      nodeType: 'media',
      mediaType: block.mediaType === 'video' ? 'video' :
        block.mediaType === 'audio' ? 'audio' : 'img',
      direction: block.direction,
      line: this.lineCounter++,
      src: block.src || '',
      alt: block.alt,
    } as MediaNode);

    if (block.caption && block.caption.length > 0) {
      content.push({
        type: 'text',
        nodeType: 'text',
        textType: 'p',
        direction: block.direction,
        line: this.lineCounter++,
        content: block.caption,
      } as TextNode);
    }

    return {
      type: 'block',
      nodeType: 'block',
      blockName: 'figure',
      direction: block.direction,
      line: this.lineCounter++,
      content,
      isCode: false,
    };
  }

  /**
   * Convert FileBlock to MediaNode
   */
  private convertFileBlock(block: FileBlock): MediaNode {
    return {
      type: 'media',
      nodeType: 'media',
      mediaType: 'file',
      direction: block.direction,
      line: this.lineCounter++,
      src: block.src || '',
      alt: block.label,
    };
  }

  /**
   * Get AST media type from block type
   */
  private getMediaType(blockType: MediaBlock['type']): 'img' | 'video' | 'audio' | 'file' {
    switch (blockType) {
      case 'video': return 'video';
      case 'audio': return 'audio';
      default: return 'img';
    }
  }

  /**
   * Convert DividerBlock to SeparatorNode
   */
  private convertDividerBlock(block: DividerBlock): SeparatorNode {
    return {
      type: 'separator',
      nodeType: 'separator',
      separatorType: 'hr',
      direction: block.direction,
      line: this.lineCounter++,
    };
  }


  /**
   * Convert DetailsBlock to BlockNode
   */
  private convertDetailsBlock(block: DetailsBlock): BlockNode {
    const content: ContentNode[] = [];

    if (block.summary && block.summary.length > 0) {
      content.push({
        type: 'text',
        nodeType: 'text',
        textType: 'p',
        direction: block.direction,
        line: this.lineCounter++,
        content: block.summary,
      } as TextNode);
    }

    for (const nestedBlock of block.content) {
      const node = this.convertBlock(nestedBlock);
      if (node) {
        content.push(node);
      }
    }

    return {
      type: 'block',
      nodeType: 'block',
      blockName: 'details',
      direction: block.direction,
      line: this.lineCounter++,
      content,
      isCode: false,
    };
  }

  /**
   * Convert TimeBlock to TextNode
   */
  private convertTimeBlock(block: TimeBlock): TextNode {
    const value = block.displayText
      ? `${block.datetime}; ${block.displayText}`
      : block.datetime;

    return {
      type: 'text',
      nodeType: 'text',
      textType: 'time',
      direction: block.direction,
      line: this.lineCounter++,
      content: [{ type: 'plain', value }],
    };
  }

  /**
   * Convert AbbrBlock to TextNode
   */
  private convertAbbrBlock(block: AbbrBlock): TextNode {
    const abbr = `${block.abbr}; ${block.title}`;

    return {
      type: 'text',
      nodeType: 'text',
      textType: 'abbr',
      direction: block.direction,
      line: this.lineCounter++,
      content: [{ type: 'plain', value: abbr }],
    };
  }

  /**
   * Convert MetaBlock to BlockNode
   */
  private convertMetaBlock(block: MetaBlock): BlockNode {
    const content: ContentNode[] = [];

    for (const field of block.fields) {
      if (field.name && field.value) {
        // Create a field node with fieldName property
        content.push({
          type: 'text',
          nodeType: 'text',
          textType: 'p',
          direction: block.direction,
          line: this.lineCounter++,
          content: [{ type: 'plain', value: field.value }],
          fieldName: field.name,  // Add fieldName for META fields
        } as any);
      }
    }

    return {
      type: 'block',
      nodeType: 'block',
      blockName: 'meta',
      direction: block.direction,
      line: this.lineCounter++,
      content,
      isCode: false,
    };
  }

  /**
   * Convert LinkBlock to LinkNode (ARTOON-native)
   * Produces type: 'link' so serializer uses serializeLink() → >.a:: url; text
   */
  private convertLinkBlock(block: LinkBlock): any {
    return {
      type: 'link',
      nodeType: 'link',
      direction: block.direction,
      line: this.lineCounter++,
      url: block.url || '',
      text: block.text || block.url || '',
      modifiers: block.modifiers || [],
    };
  }

  /**
   * Convert CustomBlock to BlockNode
   */
  private convertCustomBlock(block: CustomBlock): BlockNode {
    const content: ContentNode[] = [];

    for (const child of block.children) {
      content.push({
        type: 'text',
        nodeType: 'text',
        textType: (child.type as TextType) || 'p',
        direction: block.direction,
        line: this.lineCounter++,
        content: typeof child.content === 'string'
          ? [{ type: 'plain', value: child.content } as const]
          : child.content,
      } as TextNode);
    }

    return {
      type: 'block',
      nodeType: 'block',
      blockName: block.name,
      direction: block.direction,
      line: this.lineCounter++,
      content,
      isCode: false,
    };
  }

  /**
   * Convert WordBreakBlock to SeparatorNode
   */
  private convertWordBreakBlock(block: WordBreakBlock): SeparatorNode {
    return {
      type: 'separator',
      nodeType: 'separator',
      separatorType: 'wbr',
      direction: block.direction,
      line: this.lineCounter++,
    };
  }
}

/**
 * Create an ARTOON exporter
 */
export function createARTOONExporter(options?: ExportOptions): ARTOONExporter {
  return new ARTOONExporter(options);
}

/**
 * Export blocks to ARTOON text (convenience function)
 */
export function exportARTOON(blocks: Block[], options?: ExportOptions): string {
  return new ARTOONExporter(options).export(blocks);
}
