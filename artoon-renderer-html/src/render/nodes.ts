// ARTOON HTML Renderer - Node Rendering

import {
  ContentNode,
  TextNode,
  SeparatorNode,
  ListNode,
  ListItem,
  TableNode,
  TableRow,
  CompoundNode,
  BlockNode,
  MediaNode,
  LinkNode,
  CodeNode,
  CommentNode,
  InlineContent,
  isTextNode,
  isListNode,
  isTableNode,
  isCompoundNode,
  isBlockNode,
  isMediaNode,
  isLinkNode,
  isCodeNode,
  isSeparatorNode,
  isCommentNode
} from '@artoon/ast';
import { RenderOptions, HTML_MAPPING } from '../types.js';
import { wrap, selfClose, escapeHtml, indent } from '../utils.js';
import { renderInlineContent } from './inline.js';

type DirectionLike = 'rtl' | 'ltr' | undefined;

interface NodeLike {
  type?: string;
  nodeType?: string;
  componentType?: string;
  textType?: string;
  mediaType?: string;
  separatorType?: string;
  separators?: string[];
  listType?: string;
  compoundType?: string;
  headers?: unknown;
  rows?: unknown;
}

interface TextLikeContent {
  text?: string;
}

function resolveNodeType(node: ContentNode): string | undefined {
  const candidate = node as ContentNode & NodeLike;
  return candidate.nodeType || candidate.type;
}

function resolveDirection(node: { direction?: DirectionLike }): 'rtl' | 'ltr' {
  return node.direction === 'ltr' ? 'ltr' : 'rtl';
}

/**
 * Render a content node
 * Supports both AST types (nodeType/textType) and parser output (type/componentType)
 */
export function renderNode(
  node: ContentNode,
  options: RenderOptions,
  level: number = 0
): string {
  // Support both AST types and parser output
  const nodeType = resolveNodeType(node);

  if (nodeType === 'text') return renderTextNode(node as TextNode, options, level);
  if (nodeType === 'separator') return renderSeparatorNode(node as SeparatorNode, options, level);
  if (nodeType === 'list') return renderListNode(node as ListNode, options, level);
  if (nodeType === 'table') return renderTableNode(node as TableNode, options, level);
  if (nodeType === 'compound') return renderCompoundNode(node as CompoundNode, options, level);
  if (nodeType === 'block') return renderBlockNode(node as BlockNode, options, level);
  if (nodeType === 'media') return renderMediaNode(node as MediaNode, options, level);
  if (nodeType === 'link') return renderLinkNode(node as LinkNode, options, level);
  if (nodeType === 'code') return renderCodeNode(node as CodeNode, options, level);
  if (nodeType === 'comment') return renderCommentNode(node as CommentNode, options, level);

  return '';
}

/**
 * Render text node (p, h1-h6, blockquote, pre, time, abbr)
 * Supports both AST types (textType) and parser output (componentType)
 */
function renderTextNode(
  node: TextNode,
  options: RenderOptions,
  level: number
): string {
  // Support both AST types and parser output
  const typedNode = node as TextNode & NodeLike;
  const textType = typedNode.textType || typedNode.componentType;
  const tag = (HTML_MAPPING.text as Record<string, string>)[textType] || 'p';
  const content = renderInlineContent(node.content, options);
  const attrs = getDirectionAttrs(resolveDirection(node), options);

  // Special handling for time line component
  if (textType === 'time') {
    // Get raw content - support both formats
    let rawContent = '';
    if (Array.isArray(node.content)) {
      rawContent = node.content
        .map(c => c.type === 'plain' ? c.value : '')
        .join('');
    } else if (node.content && typeof node.content === 'object' && 'text' in node.content) {
      rawContent = ((node.content as TextLikeContent).text || '');
    }

    const parts = rawContent.split(';').map(p => p.trim());
    const datetime = parts[0] || '';
    const displayText = parts[1] || datetime;

    return wrap('time', escapeHtml(displayText), { ...attrs, datetime });
  }

  // Special handling for abbr line component
  if (textType === 'abbr') {
    // Get raw content - support both formats
    let rawContent = '';
    if (Array.isArray(node.content)) {
      rawContent = node.content
        .map(c => c.type === 'plain' ? c.value : '')
        .join('');
    } else if (node.content && typeof node.content === 'object' && 'text' in node.content) {
      rawContent = ((node.content as TextLikeContent).text || '');
    }

    const parts = rawContent.split(';').map(p => p.trim());
    const abbreviation = parts[0] || '';
    const title = parts[1] || '';

    return wrap('abbr', escapeHtml(abbreviation), { ...attrs, title });
  }

  return wrap(tag, content, attrs);
}

/**
 * Render separator node (br, hr, wbr)
 * Supports both AST types (separatorType/separators) and parser output (componentType)
 */
function renderSeparatorNode(
  node: SeparatorNode,
  options: RenderOptions,
  level: number
): string {
  // Support new format (separatorType), old format (separators), and parser output (componentType)
  const separatorType = (node as any).separatorType;
  const separators = (node as any).separators;
  const componentType = (node as any).componentType;

  // New format: single separatorType
  if (separatorType) {
    return selfClose((HTML_MAPPING.separator as Record<string, string>)[separatorType] || 'br');
  }

  // Old format: separators array
  if (separators && Array.isArray(separators)) {
    return separators
      .map((sep: string) => selfClose((HTML_MAPPING.separator as Record<string, string>)[sep] || 'br'))
      .join('');
  }

  // Parser output format: componentType
  if (componentType) {
    return selfClose((HTML_MAPPING.separator as Record<string, string>)[componentType] || 'br');
  }

  return selfClose('br');
}

/**
 * Render list node (ul, ol, dl)
 * Phase 18: Supports mixed-type items by grouping consecutive same-type items
 */
function renderListNode(
  node: ListNode,
  options: RenderOptions,
  level: number
): string {
  // Support both AST types and parser output
  const nodeListType = (node as any).listType || (node as any).componentType || 'ul';
  const attrs = getDirectionAttrs(node.direction, options);

  // Check if any item has its own listType (Phase 18 mixed-type support)
  const hasMixedTypes = node.items.some((item: any) => item.listType && item.listType !== nodeListType);

  if (!hasMixedTypes) {
    // All items same type — original behavior
    const tag = (HTML_MAPPING.list as Record<string, string>)[nodeListType] || 'ul';
    const items = node.items
      .map(item => renderListItem(item, nodeListType, options, level + 1))
      .join('\n');

    if (options.indent) {
      return wrap(tag, '\n' + items + '\n', attrs);
    }
    return wrap(tag, items, attrs);
  }

  // Mixed types — group consecutive same-type items into separate containers
  const groups: { type: string; items: ListItem[] }[] = [];
  for (const item of node.items) {
    const itemListType = (item as any).listType || nodeListType;
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.type === itemListType) {
      lastGroup.items.push(item);
    } else {
      groups.push({ type: itemListType, items: [item] });
    }
  }

  return groups.map(group => {
    const tag = (HTML_MAPPING.list as Record<string, string>)[group.type] || 'ul';
    const items = group.items
      .map(item => renderListItem(item, group.type, options, level + 1))
      .join('\n');

    if (options.indent) {
      return wrap(tag, '\n' + items + '\n', attrs);
    }
    return wrap(tag, items, attrs);
  }).join('\n');
}

/**
 * Render list item
 * Supports both AST types (itemType) and parser output
 */
function renderListItem(
  item: ListItem,
  listType: string,
  options: RenderOptions,
  level: number
): string {
  // Support both AST types and parser output
  const itemType = (item as any).itemType || 'li';
  const tag = (HTML_MAPPING.listItem as Record<string, string>)[itemType] || 'li';
  const content = renderInlineContent(item.content, options);

  let html = '';

  // Check for nested list
  const children = (item as any).children;
  if (children) {
    // New format: children is ListItem[] directly
    if (Array.isArray(children) && children.length > 0 && !children[0].items) {
      // Determine list type for nested list: use childListType if provided, else inherit parent's
      const nestedListType = (item as any).childListType || listType;

      // Create a virtual list node for rendering
      const nestedListNode = {
        type: 'list',
        nodeType: 'list',
        listType: nestedListType,
        items: children,
        direction: 'rtl' as const,
        line: 1
      };
      const nestedList = renderListNode(nestedListNode as any, options, level);
      html = wrap(tag, content + '\n' + nestedList);
    }
    // Old AST format: children is a list node directly
    else if (children.nodeType === 'list' || children.listType) {
      const nestedList = renderListNode(children as any, options, level);
      html = wrap(tag, content + '\n' + nestedList);
    }
    // Parser format: children is array with nested list items
    else if (Array.isArray(children) && children.length > 0 && children[0].items) {
      const nestedList = renderListNode(children[0] as any, options, level);
      html = wrap(tag, content + '\n' + nestedList);
    }
    else {
      html = wrap(tag, content);
    }
  } else {
    html = wrap(tag, content);
  }

  return options.indent ? indent(html, level, options.indentSize) : html;
}

/**
 * Render table node
 * Supports both AST types and parser output
 */
function renderTableNode(
  node: TableNode,
  options: RenderOptions,
  level: number
): string {
  const attrs = getDirectionAttrs(resolveDirection(node), options);
  if (options.includeAria) {
    attrs.role = 'table';
  }

  let content = '';

  // Parser format: headers as string[], rows as string[][]
  if (Array.isArray((node as any).headers) && typeof (node as any).headers[0] === 'string') {
    const headers = (node as any).headers as string[];
    const rows = (node as any).rows as string[][];

    // Headers
    if (headers && headers.length > 0) {
      const headerCells = headers.map(h => wrap('th', escapeHtml(h))).join('');
      const headerRow = wrap('tr', headerCells);
      content += options.indent
        ? `\n${indent('<thead>', level + 1, options.indentSize)}\n${indent(headerRow, level + 2, options.indentSize)}\n${indent('</thead>', level + 1, options.indentSize)}`
        : `<thead>${headerRow}</thead>`;
    }

    // Body
    if (rows && rows.length > 0) {
      const bodyRows = rows.map(row => {
        const cells = row.map(cell => wrap('td', escapeHtml(cell))).join('');
        return wrap('tr', cells);
      }).join('\n');

      content += options.indent
        ? `\n${indent('<tbody>', level + 1, options.indentSize)}\n${indent(bodyRows, level + 2, options.indentSize)}\n${indent('</tbody>', level + 1, options.indentSize)}\n`
        : `<tbody>${bodyRows}</tbody>`;
    }

    return wrap('table', content, attrs);
  }

  // AST format: headers as TableRow, rows as TableRow[]
  // Headers
  if (node.headers) {
    const headerRow = renderTableRow(node.headers, options, level + 2);
    content += options.indent
      ? `\n${indent('<thead>', level + 1, options.indentSize)}\n${headerRow}\n${indent('</thead>', level + 1, options.indentSize)}`
      : `<thead>${headerRow}</thead>`;
  }

  // Body
  const rows = node.rows
    .map(row => renderTableRow(row, options, level + 2))
    .join('\n');

  content += options.indent
    ? `\n${indent('<tbody>', level + 1, options.indentSize)}\n${rows}\n${indent('</tbody>', level + 1, options.indentSize)}\n`
    : `<tbody>${rows}</tbody>`;

  return wrap('table', content, attrs);
}

/**
 * Render table row
 * Supports both AST types (rowType) and parser output (isHeader)
 */
function renderTableRow(
  row: TableRow,
  options: RenderOptions,
  level: number
): string {
  // Support both AST types and parser output
  const isHeader = (row as any).rowType === 'th' || (row as any).isHeader;
  const cellTag = isHeader ? 'th' : 'td';

  const cells = row.cells
    .map(cell => {
      const content = renderInlineContent(cell.content, options);
      return wrap(cellTag, content);
    })
    .join('');

  const html = wrap('tr', cells);
  return options.indent ? indent(html, level, options.indentSize) : html;
}

/**
 * Render compound node (figure, details)
 * Supports both AST types (compoundType) and parser output (componentType)
 */
function renderCompoundNode(
  node: CompoundNode,
  options: RenderOptions,
  level: number
): string {
  // Support both AST types and parser output
  const compoundType = (node as any).compoundType || (node as any).componentType;
  const tag = (HTML_MAPPING.compound as Record<string, string>)[compoundType] || 'div';
  const attrs = getDirectionAttrs(resolveDirection(node), options);
  if (options.includeAria && compoundType === 'figure') {
    attrs.role = 'figure';
  }

  let content = '';

  // Support both AST format ({ role, node }) and parser format (direct children)
  for (const child of node.children) {
    // Parser format: direct node
    if ((child as any).type) {
      const childNode = child as any;
      const childType = childNode.componentType || childNode.type;

      if (childType === 'caption' || childType === 'figcaption') {
        // figcaption for figure
        const childContent = renderInlineContent(childNode.content, options);
        content += wrap('figcaption', childContent);
      } else if (childType === 'summary') {
        // summary for details
        const childContent = renderInlineContent(childNode.content, options);
        content += wrap('summary', childContent);
      } else {
        // Regular content
        content += renderNode(childNode as ContentNode, options, level + 1);
      }
      continue;
    }

    // AST format: { role, node }
    const childNode = (child as any).node as ContentNode;
    if (!childNode) continue;

    if ((child as any).role === 'caption') {
      // figcaption for figure
      const captionTag = 'figcaption';
      if ('nodeType' in childNode && childNode.nodeType === 'text') {
        const textNode = childNode as TextNode;
        const childContent = renderInlineContent(textNode.content, options);
        content += wrap(captionTag, childContent);
      } else {
        content += wrap(captionTag, renderNode(childNode, options, level + 1));
      }
    } else if ((child as any).role === 'summary') {
      // summary for details
      if ('nodeType' in childNode && childNode.nodeType === 'text') {
        const textNode = childNode as TextNode;
        const childContent = renderInlineContent(textNode.content, options);
        content += wrap('summary', childContent);
      } else {
        content += wrap('summary', renderNode(childNode, options, level + 1));
      }
    } else {
      // Regular content
      if ('nodeType' in childNode) {
        content += renderNode(childNode, options, level + 1);
      }
    }
  }

  return wrap(tag, content, attrs);
}

/**
 * Render block node (code, meta, figure, details, custom)
 */
function renderBlockNode(
  node: BlockNode,
  options: RenderOptions,
  level: number
): string {
  // Code block
  if (node.isCode || node.blockName === 'code') {
    const langClass = node.language ? `language-${node.language}` : undefined;
    const code = typeof node.content === 'string' ? escapeHtml(node.content) : '';

    return wrap('pre', wrap('code', code, { class: langClass }));
  }

  // Meta block - handle based on metaHandling option
  if (node.blockName === 'meta') {
    return renderMetaBlock(node, options, level);
  }

  // Figure block - render as <figure> with <figcaption>
  if (node.blockName === 'figure') {
    return renderFigureBlock(node, options, level);
  }

  // Details block - render as <details> with <summary>
  if (node.blockName === 'details') {
    return renderDetailsBlock(node, options, level);
  }

  // All other blocks are custom blocks
  return renderCustomBlock(node, options, level);
}

/**
 * Render custom block with flexible tag mapping
 */
function renderCustomBlock(
  node: BlockNode,
  options: RenderOptions,
  level: number
): string {
  // Find custom mapping
  const mapping = options.customBlocks?.find(
    m => m.name === node.blockName
  );

  const tag = mapping?.tag || options.defaultCustomBlockTag || 'div';
  const className = mapping?.className || `custom-block custom-block--${node.blockName}`;
  const attrs = getDirectionAttrs(node.direction, options);
  attrs['class'] = className;

  // Add custom attributes from mapping
  if (mapping?.attributes) {
    Object.assign(attrs, mapping.attributes);
  }

  // Hidden fields inside blocks
  let fieldsHtml = '';
  if (node.fields && node.fields.length > 0) {
    for (const field of node.fields) {
      // Check for field-specific mapping
      const fieldMapping = options.customBlocks?.find(
        m => m.name === `${node.blockName}-${field.name}`
      );

      const fieldTag = fieldMapping?.tag || 'div';
      const fieldClass = fieldMapping?.className || field.name;
      const fieldAttrs: Record<string, string> = {
        class: fieldClass,
        'data-field': field.name,
        hidden: 'hidden'
      };

      if (fieldMapping?.attributes) {
        Object.assign(fieldAttrs, fieldMapping.attributes);
      }

      fieldsHtml += wrap(fieldTag, escapeHtml(field.value), fieldAttrs);
    }
  }

  // Handle string content
  if (typeof node.content === 'string') {
    return wrap(tag, fieldsHtml + escapeHtml(node.content), attrs);
  }

  // Handle array content (ContentNode[])
  const contentNodes = Array.isArray(node.content) ? (node.content as ContentNode[]) : [];
  const content = contentNodes
    .map(child => renderNode(child, options, level + 1))
    .join('\n');

  return wrap(tag, fieldsHtml + content, attrs);
}

/**
 * Render meta block based on metaHandling option
 */
function renderMetaBlock(
  node: BlockNode,
  options: RenderOptions,
  level: number
): string {
  const mode = options.metaHandling || 'hide';

  if (!node.fields || node.fields.length === 0) {
    return ''; // No fields, nothing to render
  }

  switch (mode) {
    case 'hide':
      // Hide completely - return empty string
      return '';

    case 'tags':
      // Render as <meta> tags
      return node.fields
        .map(field => selfClose('meta', {
          name: field.name,
          content: field.value
        }))
        .join('\n');

    case 'comment':
      // Render as HTML comment
      const fieldsText = node.fields
        .map(field => `${field.name}: ${field.value}`)
        .join(', ');
      return `<!-- META: ${fieldsText} -->`;

    default:
      return '';
  }
}

/**
 * Render figure block as <figure> with <figcaption>
 */
function renderFigureBlock(
  node: BlockNode,
  options: RenderOptions,
  level: number
): string {
  const attrs = getDirectionAttrs(resolveDirection(node), options);
  if (options.includeAria) {
    attrs.role = 'figure';
  }

  let content = '';
  const contentNodes = Array.isArray(node.content) ? (node.content as ContentNode[]) : [];

  // First node should be media (img/video/audio)
  if (contentNodes.length > 0) {
    const mediaNode = contentNodes[0];
    content += renderNode(mediaNode, options, level + 1);

    // Second node (if exists) is caption
    if (contentNodes.length > 1) {
      const captionNode = contentNodes[1];
      if (isTextNode(captionNode)) {
        const captionContent = renderInlineContent(captionNode.content, options);
        content += wrap('figcaption', captionContent);
      }
    }
  }

  return wrap('figure', content, attrs);
}

/**
 * Render details block as <details> with <summary>
 */
function renderDetailsBlock(
  node: BlockNode,
  options: RenderOptions,
  level: number
): string {
  const attrs = getDirectionAttrs(resolveDirection(node), options);
  if (options.includeAria) {
    attrs.role = 'group';
  }

  let content = '';
  const contentNodes = Array.isArray(node.content) ? (node.content as ContentNode[]) : [];

  // First node should be summary
  if (contentNodes.length > 0) {
    const summaryNode = contentNodes[0];
    if (isTextNode(summaryNode)) {
      const summaryContent = renderInlineContent(summaryNode.content, options);
      content += wrap('summary', summaryContent);
    }

    // Rest are content
    for (let i = 1; i < contentNodes.length; i++) {
      content += renderNode(contentNodes[i], options, level + 1);
    }
  }

  return wrap('details', content, attrs);
}

/**
 * Render media node
 * Supports both AST types (mediaType) and parser output (componentType)
 */
function renderMediaNode(
  node: MediaNode,
  options: RenderOptions,
  level: number
): string {
  const attrs = getDirectionAttrs(resolveDirection(node), options);

  // Support both AST types and parser output
  const mediaType = (node as MediaNode & NodeLike).mediaType || (node as MediaNode & NodeLike).componentType;

  switch (mediaType) {
    case 'img':
      return selfClose('img', {
        ...attrs,
        src: node.src,
        alt: node.alt || '',
        title: node.title,
        'aria-label': options.includeAria ? (node.alt || node.title || 'Image') : undefined
      });

    case 'audio':
      return wrap('audio', '', {
        ...attrs,
        src: node.src,
        controls: 'controls',
        title: node.title,
        'aria-label': options.includeAria ? (node.title || 'Audio') : undefined
      });

    case 'video':
      return wrap('video', '', {
        ...attrs,
        src: node.src,
        controls: 'controls',
        title: node.title,
        'aria-label': options.includeAria ? (node.title || 'Video') : undefined
      });

    case 'file':
      return wrap('a', escapeHtml(node.label || node.src), {
        ...attrs,
        href: node.src,
        download: 'download',
        'aria-label': options.includeAria ? (node.label || 'Download file') : undefined
      });

    default:
      return '';
  }
}

/**
 * Render link node
 */
function renderLinkNode(
  node: LinkNode,
  options: RenderOptions,
  level: number
): string {
  const attrs = getDirectionAttrs(resolveDirection(node), options);
  attrs.href = node.url;
  if (options.includeAria) {
    attrs['aria-label'] = node.text || node.url;
  }

  let content = escapeHtml(node.text || node.url);

  // Apply modifiers
  for (const mod of [...node.modifiers].reverse()) {
    const tag = HTML_MAPPING.modifier[mod];
    if (tag) {
      content = wrap(tag, content);
    }
  }

  return wrap('a', content, attrs);
}

/**
 * Render inline code node
 */
function renderCodeNode(
  node: CodeNode,
  options: RenderOptions,
  level: number
): string {
  const langClass = node.language ? `language-${node.language}` : undefined;
  return wrap('code', escapeHtml(node.code), { class: langClass });
}

/**
 * Render comment node
 * Supports multiple display modes:
 * - hidden: HTML comment <!-- -->
 * - editor-only: visible in editor, hidden in production
 * - visible: always visible
 * - collapsible: expandable details element
 */
function renderCommentNode(
  node: CommentNode,
  options: RenderOptions,
  level: number
): string {
  if (!options.includeComments) return '';

  const mode = options.commentDisplay || 'hidden';
  const tag = options.commentTag || 'div';
  const content = escapeHtml(node.content);

  switch (mode) {
    case 'hidden':
      return `<!-- ${content} -->`;

    case 'editor-only':
      return wrap(tag, content, { class: 'comment editor-only' });

    case 'visible':
      return wrap(tag, content, { class: 'comment visible' });

    case 'collapsible':
      return `<details class="comment"><summary>تعليق</summary>${content}</details>`;

    default:
      return `<!-- ${content} -->`;
  }
}

/**
 * Get direction attributes
 */
function getDirectionAttrs(
  direction: 'rtl' | 'ltr',
  options: RenderOptions
): Record<string, string | undefined> {
  if (!options.includeDirection) return {};

  // Only add dir if different from default
  if (direction === options.defaultDirection) return {};

  return { dir: direction };
}
