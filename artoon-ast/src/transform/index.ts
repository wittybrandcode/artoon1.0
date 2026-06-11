// ARTOON AST Transformer
// Converts Parser AST to Canonical AST
// Version 2.0 - Uses new type format with compatibility layer

import {
  ARTOONDocument,
  ContentNode,
  TextNode,
  SeparatorNode,
  ListNode,
  ListItem,
  TableNode,
  TableRow,
  TableCell,
  CompoundNode,
  CompoundChild,
  BlockNode,
  MediaNode,
  LinkNode,
  CodeNode,
  CommentNode,
  DocumentMeta,
  InlineContent,
  PlainText,
  InlineComponent,
  Direction,
  Modifier,
  TextType,
  ListType,
  ListItemType,
  SeparatorType,
  MetaField,
  InlineComponentType
} from '../types';

import { createCompatNode } from '../compat';
// Note: parseInlineContent from @artoon/parser is NOT imported here to avoid
// circular dependency (ast -> parser -> ast). Table cell content is parsed 
// as plain text and the actual inline parsing happens at a higher level.

import type {
  ParserParseResult,
  ParserDocumentNode,
  ParserNode,
  ParserTextNode,
  ParserSeparatorNode,
  ParserListNode,
  ParserListItem,
  ParserTableNode,
  ParserCompoundNode,
  ParserBlockNode,
  ParserMediaNode,
  ParserLinkNode,
  ParserCodeNode,
  ParserCommentNode,
  ParserBlockField,
  ParsedContent,
  ParserInlineToken
} from './parser-types';

/**
 * Transform parser result to canonical AST
 */
export function transform<T = unknown>(inputResult: T): ARTOONDocument {
  const parserResult = inputResult as unknown as ParserParseResult;
  if (!parserResult || !parserResult.ast) {
    throw new Error('Invalid parser result');
  }
  const { ast, errors } = parserResult;

  return {
    version: '2.0',
    meta: transformMeta(ast.meta),
    content: transformChildren(ast.children),
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Transform meta block to DocumentMeta
 */
function transformMeta(meta?: ParserBlockNode): DocumentMeta | undefined {
  if (!meta || !meta.fields) return undefined;

  const result: Record<string, unknown> = {};
  const custom: Record<string, string> = {};

  for (const field of meta.fields) {
    const name = field.name;
    const value = field.value;

    switch (name) {
      case 'title':
        result.title = value;
        break;
      case 'description':
        result.description = value;
        break;
      case 'author':
        result.author = value;
        break;
      case 'date':
        result.date = value;
        break;
      case 'lang':
        result.lang = value;
        break;
      case 'dir':
        result.dir = value as Direction;
        break;
      case 'version':
        result.version = value;
        break;
      case 'status':
        result.status = value;
        break;
      case 'license':
        result.license = value;
        break;
      case 'tags':
        result.tags = value.split(';').map((t: string) => t.trim());
        break;
      default:
        custom[name] = value;
    }
  }

  if (Object.keys(custom).length > 0) {
    result.custom = custom;
  }

  return Object.keys(result).length > 0 ? (result as DocumentMeta) : undefined;
}

/**
 * Transform array of parser nodes to canonical nodes
 */
function transformChildren(children: readonly ParserNode[]): ContentNode[] {
  return children.map(transformNode).filter((n): n is ContentNode => n !== null);
}

/**
 * Transform single parser node to canonical node
 */
function transformNode(node: ParserNode): ContentNode | null {
  switch (node.type) {
    case 'text':
      return transformTextNode(node);
    case 'separator':
      return transformSeparatorNode(node);
    case 'list':
      return transformListNode(node);
    case 'table':
      return transformTableNode(node);
    case 'compound':
      return transformCompoundNode(node);
    case 'block':
      return transformBlockNode(node);
    case 'media':
      return transformMediaNode(node);
    case 'link':
      return transformLinkNode(node);
    case 'code':
      return transformCodeNode(node);
    case 'comment':
      return transformCommentNode(node);
    default:
      return null;
  }
}

/**
 * Transform text node
 */
function transformTextNode(node: ParserTextNode): TextNode {
  return createCompatNode<TextNode>({
    type: 'text',
    line: node.line,
    direction: node.direction,
    textType: node.textType as TextType,
    content: transformInlineContent(node.content)
  });
}

/**
 * Transform separator node
 * 
 * @migration v2.0: Uses separatorType (single) instead of separators (array)
 */
function transformSeparatorNode(node: ParserSeparatorNode & { separators?: SeparatorType[] }): SeparatorNode {
  // Get separator type - take first from array if old format
  const separatorType = node.separatorType ||
    (node.separators && node.separators[0]) ||
    'hr';

  return createCompatNode<SeparatorNode>({
    type: 'separator',
    line: node.line,
    direction: node.direction,
    separatorType: separatorType as SeparatorType,
    // Keep separators for backward compatibility
    separators: node.separators || [separatorType]
  }) as SeparatorNode;
}

/**
 * Transform list node
 */
function transformListNode(node: ParserListNode): ListNode {
  return createCompatNode<ListNode>({
    type: 'list',
    line: node.line,
    direction: node.direction,
    listType: node.listType as ListType,
    items: node.items.map(transformListItem)
  });
}

/**
 * Transform list item
 * 
 * @migration v2.0: children is now ListItem[] instead of ListNode
 */
function transformListItem(item: ParserListItem): ListItem {
  let children: ListItem[] | undefined;

  // v2.0: children is ListItem[] (direct items, not wrapped in ListNode)
  if (item.children && item.children.length > 0) {
    // If children is array of ListNodes (old parser format), extract items
    const firstChild = item.children[0] as unknown as ParserListNode;
    if (firstChild && 'items' in firstChild && firstChild.items) {
      children = firstChild.items.map(transformListItem);
    } else {
      // Already ListItem[]
      children = item.children.map(transformListItem);
    }
  }

  return {
    itemType: item.itemType as ListItemType,
    content: transformInlineContent(item.content),
    ...(children ? { children } : {})
  };
}

/**
 * Transform table node
 */
function transformTableNode(node: ParserTableNode): TableNode {
  let headers: TableRow | undefined;

  // Transform headers
  if (node.headers && node.headers.length > 0) {
    headers = {
      rowType: 'th',
      cells: node.headers.map((h: string) => ({
        content: parseTableCellContent(h)
      }))
    };
  }

  // Transform rows
  const rows = node.rows.map((row: string[]) => ({
    rowType: 'tr' as const,
    cells: row.map((cell: string) => ({
      content: parseTableCellContent(cell)
    }))
  }));

  return createCompatNode<TableNode>({
    type: 'table',
    line: node.line,
    direction: node.direction,
    rows,
    ...(headers ? { headers } : {})
  });
}

/**
 * Parse table cell content for inline tokens
 */
function parseTableCellContent(cellText: string): InlineContent[] {
  // Return as plain text to avoid circular dependency with @artoon/parser
  // Higher-level consumers can re-parse inline content if needed
  if (!cellText) return [];
  return [{ type: 'plain', value: cellText } as PlainText];
}

/**
 * Transform compound node
 */
function transformCompoundNode(node: ParserCompoundNode): CompoundNode {
  return createCompatNode<CompoundNode>({
    type: 'compound',
    line: node.line,
    direction: node.direction,
    compoundType: node.compoundType,
    children: node.children.map(transformCompoundChild)
  });
}

/**
 * Transform compound child
 */
function transformCompoundChild(child: ParserNode & { componentType?: string }): CompoundChild {
  // Determine role based on child type
  let role: 'content' | 'caption' | 'summary' = 'content';

  // Check componentType for text nodes
  const compType = (child as any).textType || (child as any).componentType;
  if (compType === 'caption' || compType === 'figcaption') {
    role = 'caption';
  } else if (compType === 'summary') {
    role = 'summary';
  }

  return {
    role,
    node: transformNode(child) as ContentNode
  };
}

/**
 * Transform block node
 */
function transformBlockNode(node: ParserBlockNode): BlockNode {
  let content: ContentNode[] | string = '';

  if (node.blockName === 'code') {
    content = node.content as string;
  } else if (typeof node.content === 'string') {
    content = node.content;
  } else if (Array.isArray(node.content)) {
    content = transformChildren(node.content);
  }

  return createCompatNode<BlockNode>({
    type: 'block',
    line: node.line,
    direction: node.direction || 'ltr',
    blockName: node.blockName,
    isCode: node.blockName === 'code',
    content,
    ...(node.lang ? { language: node.lang } : {}),
    ...(node.fields && node.fields.length > 0 ? { fields: node.fields as MetaField[] } : {})
  });
}

/**
 * Transform media node
 */
function transformMediaNode(node: ParserMediaNode): MediaNode {
  return createCompatNode<MediaNode>({
    type: 'media',
    line: node.line,
    direction: node.direction,
    mediaType: node.mediaType,
    src: node.src,
    ...(node.alt ? { alt: node.alt } : {}),
    ...(node.title ? { title: node.title } : {}),
    ...(node.label ? { label: node.label } : {})
  });
}

/**
 * Transform link node
 */
function transformLinkNode(node: ParserLinkNode): LinkNode {
  return createCompatNode<LinkNode>({
    type: 'link',
    line: node.line,
    direction: node.direction,
    url: node.url,
    text: node.text,
    modifiers: node.modifiers || []
  });
}

/**
 * Transform code node
 */
function transformCodeNode(node: ParserCodeNode): CodeNode {
  return createCompatNode<CodeNode>({
    type: 'code',
    line: node.line,
    direction: node.direction,
    code: node.code,
    ...(node.lang ? { language: node.lang } : {})
  });
}

/**
 * Transform comment node
 */
function transformCommentNode(node: ParserCommentNode): CommentNode {
  return createCompatNode<CommentNode>({
    type: 'comment',
    line: node.line,
    direction: node.direction,
    content: node.content
  });
}

/**
 * Transform parsed content to inline content array
 * Supports both old format ({ text, inlines }) and new format (InlineContent[])
 */
function transformInlineContent(parsedContent: ParsedContent | readonly InlineContent[] | undefined | null): InlineContent[] {
  if (!parsedContent) return [];

  // Check if it's the old format (ParsedContent) which has 'text' and 'inlines'
  if ('text' in parsedContent && !Array.isArray(parsedContent)) {
    const { text, inlines } = parsedContent as ParsedContent;

    if (!inlines || inlines.length === 0) {
      return text ? [{ type: 'plain', value: text }] : [];
    }

    const result: InlineContent[] = [];
    let currentText = text;

    // Replace placeholders with inline components
    for (let i = 0; i < inlines.length; i++) {
      const placeholder = `{${i}}`;
      const index = currentText.indexOf(placeholder);

      if (index > 0) {
        result.push({ type: 'plain', value: currentText.slice(0, index) });
      }

      result.push(transformInlineToken(inlines[i]));

      currentText = currentText.slice(index + placeholder.length);
    }

    if (currentText) {
      result.push({ type: 'plain', value: currentText });
    }

    return result;
  }

  // New format: already InlineContent[]
  return (parsedContent as readonly InlineContent[]).map((item: InlineContent) => {
    if (item.type === 'plain') {
      return item as PlainText;
    }
    if (item.type === 'inline') {
      return item as InlineComponent;
    }
    // Fallback
    const fallbackItem = item as unknown as Record<string, unknown>;
    return { type: 'plain', value: String(fallbackItem.value || '') } as PlainText;
  });
}

/**
 * Transform inline token to inline component
 */
function transformInlineToken(token: ParserInlineToken): InlineComponent {
  const attributes: Record<string, string> = {};
  let value: string | undefined = undefined;

  // Map attributes based on component type
  const attrs = token.attributes || [];

  switch (token.componentType) {
    case 'a':
      if (attrs[0]) attributes.url = attrs[0];
      if (attrs[1]) attributes.text = attrs[1];
      break;
    case 'img':
      if (attrs[0]) attributes.path = attrs[0];
      if (attrs[1]) attributes.alt = attrs[1];
      if (attrs[2]) attributes.title = attrs[2];
      break;
    case 'audio':
    case 'video':
      if (attrs[0]) attributes.path = attrs[0];
      if (attrs[1]) attributes.title = attrs[1];
      break;
    case 'file':
      if (attrs[0]) attributes.path = attrs[0];
      if (attrs[1]) attributes.label = attrs[1];
      break;
    case 'abbr':
      if (attrs[0]) attributes.short = attrs[0];
      if (attrs[1]) attributes.full = attrs[1];
      break;
    case 'time':
      if (attrs[0]) attributes.datetime = attrs[0];
      if (attrs[1]) attributes.display = attrs[1];
      break;
    case 'c':
      if (attrs[0]) attributes.code = attrs[0];
      if (attrs[1]) attributes.lang = attrs[1];
      break;
    default:
      // Plain text with modifiers
      if (attrs[0]) value = attrs[0];
  }

  return {
    type: 'inline',
    attributes,
    ...(token.componentType ? { component: token.componentType as InlineComponentType } : {}),
    ...(token.modifiers && token.modifiers.length > 0 ? { modifiers: token.modifiers as Modifier[] } : {}),
    ...(value !== undefined ? { value } : {})
  };
}
