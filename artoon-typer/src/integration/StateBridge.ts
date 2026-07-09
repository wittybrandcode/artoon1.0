/**
 * StateBridge
 *
 * Bridge between ARTOON-TYPER Block[] and @artoon/state EditorState.
 * Uses artoon-state transaction-based history as the canonical state engine.
 *
 * Phase 4: Unify State Management
 */

import type {
  Block,
  TextBlock,
  ListBlock,
  CodeBlock,
  TableBlock,
  MediaBlock,
  DividerBlock,
  Direction,
  ListItem,
} from '../types';
import { generateId, deepClone } from '../core/utils';

import type {
  ARTOONDocument,
  ContentNode,
  TextNode,
  ListNode,
  BlockNode,
  TableNode,
  MediaNode,
  SeparatorNode,
  InlineContent,
  PlainText,
  InlineComponent,
} from '@artoon/ast';

import {
  EditorStateImpl,
  TextSelectionImpl,
  nodeSize as astNodeSize,
} from '@artoon/state';
import type {
  EditorState,
  EditorStateConfig,
  Selection as StateSelection,
} from '@artoon/state';

// ═══════════════════════════════════════════════════════════════════════════
// Block[] ↔ ARTOONDocument
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert Block[] to ARTOONDocument (AST)
 */
export function blocksToAST(blocks: Block[]): ARTOONDocument {
  const content: ContentNode[] = blocks.map(block => blockToContentNode(block));
  return {
    version: '2.0',
    content,
  };
}

/**
 * Convert ARTOONDocument (AST) to Block[]
 */
export function astToBlocks(doc: ARTOONDocument): Block[] {
  if (!doc.content || !Array.isArray(doc.content)) return [];
  return doc.content.map((node, index) => contentNodeToBlock(node, index));
}

// ═══════════════════════════════════════════════════════════════════════════
// Block[] ↔ EditorState
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert Block[] to EditorState
 */
export function blocksToEditorState(
  blocks: Block[],
  config?: Partial<EditorStateConfig>
): EditorState {
  const ast = blocksToAST(blocks);
  return EditorStateImpl.create({
    doc: ast,
    ...config,
  });
}

/**
 * Convert EditorState to Block[]
 */
export function editorStateToBlocks(state: EditorState): Block[] {
  const ast = (state.doc as any).ast || (state.doc as any).toAST?.();
  return astToBlocks(ast);
}

// ═══════════════════════════════════════════════════════════════════════════
// Transaction helpers for Block operations
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a transaction that adds a block at a given index.
 * Returns the new EditorState after applying the transaction.
 */
export function addBlockToState(
  state: EditorState,
  block: Block,
  index?: number
): EditorState {
  const blocks = editorStateToBlocks(state);
  const insertIndex = Math.max(0, Math.min(index ?? blocks.length, blocks.length));
  blocks.splice(insertIndex, 0, block);
  return replaceAllBlocksInState(state, blocks);
}

/**
 * Create a transaction that removes a block by index.
 */
export function removeBlockFromState(
  state: EditorState,
  blockIndex: number
): EditorState {
  const blocks = editorStateToBlocks(state);
  if (blockIndex < 0 || blockIndex >= blocks.length) return state;
  blocks.splice(blockIndex, 1);
  return replaceAllBlocksInState(state, blocks);
}

/**
 * Create a transaction that updates a block by index.
 */
export function updateBlockInState(
  state: EditorState,
  blockIndex: number,
  block: Block
): EditorState {
  const blocks = editorStateToBlocks(state);
  if (blockIndex < 0 || blockIndex >= blocks.length) return state;
  blocks[blockIndex] = block;
  return replaceAllBlocksInState(state, blocks);
}

/**
 * Create a transaction that moves a block from one index to another.
 */
export function moveBlockInState(
  state: EditorState,
  fromIndex: number,
  toIndex: number
): EditorState {
  const blocks = editorStateToBlocks(state);
  if (fromIndex < 0 || fromIndex >= blocks.length) return state;

  const clampedTarget = Math.max(0, Math.min(toIndex, blocks.length));
  if (fromIndex === clampedTarget || fromIndex === clampedTarget - 1) return state;

  const [moved] = blocks.splice(fromIndex, 1);
  const insertIndex = clampedTarget > fromIndex ? clampedTarget - 1 : clampedTarget;
  blocks.splice(Math.max(0, Math.min(insertIndex, blocks.length)), 0, moved);

  return replaceAllBlocksInState(state, blocks);
}

function replaceAllBlocksInState(state: EditorState, blocks: Block[]): EditorState {
  const nextNodes = blocks.map(b => blockToContentNode(b));
  const currentNodes = state.doc.content.toArray();
  const tr = state.tr;

  if (currentNodes.length === 0) {
    (tr as any).replaceWith(1, 1, nextNodes);
    return state.apply(tr);
  }

  const isIdenticalNode = (a: any, b: any): boolean => {
    if (!a || !b) return false;
    if (a.blockId && b.blockId && a.blockId !== b.blockId) return false;

    // Deep compare contents recursively instead of stringify to avoid memory churn
    const deepEqual = (x: any, y: any): boolean => {
      if (x === y) return true;
      if (typeof x !== 'object' || x === null || typeof y !== 'object' || y === null) return false;

      const keysX = Object.keys(x);
      const keysY = Object.keys(y);
      if (keysX.length !== keysY.length) return false;

      for (const key of keysX) {
        if (!keysY.includes(key) || !deepEqual(x[key], y[key])) return false;
      }
      return true;
    };

    return deepEqual(a, b);
  };

  let startMatch = 0;
  while (
    startMatch < currentNodes.length &&
    startMatch < nextNodes.length &&
    isIdenticalNode(currentNodes[startMatch], nextNodes[startMatch])
  ) {
    startMatch++;
  }

  let endMatch = 0;
  while (
    endMatch < currentNodes.length - startMatch &&
    endMatch < nextNodes.length - startMatch &&
    isIdenticalNode(currentNodes[currentNodes.length - 1 - endMatch], nextNodes[nextNodes.length - 1 - endMatch])
  ) {
    endMatch++;
  }

  // Special case: Document ends up matching completely, do nothing
  if (startMatch + endMatch >= currentNodes.length && startMatch + endMatch >= nextNodes.length) {
    return state; // No change needed
  }

  let from = 1;
  for (let i = 0; i < startMatch; i++) {
    from += nodeSize(currentNodes[i]);
  }

  let to = from;
  for (let i = startMatch; i < currentNodes.length - endMatch; i++) {
    to += nodeSize(currentNodes[i]);
  }

  const replacementNodes = nextNodes.slice(startMatch, nextNodes.length - endMatch);

  (tr as any).replaceWith(from, to, replacementNodes);
  return state.apply(tr);
}

// ═══════════════════════════════════════════════════════════════════════════
// Block ↔ ContentNode conversion helpers
// ═══════════════════════════════════════════════════════════════════════════

function blockToContentNode(block: Block): ContentNode {
  switch (block.type) {
    case 'paragraph':
    case 'heading1':
    case 'heading2':
    case 'heading3':
    case 'heading4':
    case 'heading5':
    case 'heading6':
    case 'quote':
      return textBlockToNode(block as TextBlock);

    case 'bullet-list':
    case 'numbered-list':
    case 'definition-list':
      return listBlockToNode(block as ListBlock);

    case 'code':
      return codeBlockToNode(block as CodeBlock);

    case 'table':
      return tableBlockToNode(block as TableBlock);

    case 'image':
    case 'video':
    case 'audio':
      return mediaBlockToNode(block as MediaBlock);

    case 'divider':
      return dividerBlockToNode(block as DividerBlock);

    default:
      return {
        type: 'text',
        nodeType: 'text',
        textType: 'p',
        line: 0,
        direction: (block as any).direction || 'rtl',
        content: [],
        blockId: block.id,
      } as TextNode;
  }
}

function textBlockToNode(block: TextBlock): TextNode {
  const textTypeMap: Record<string, TextNode['textType']> = {
    paragraph: 'p',
    heading1: 't1',
    heading2: 't2',
    heading3: 't3',
    heading4: 't4',
    heading5: 't5',
    heading6: 't6',
    quote: 'q',
  };

  return {
    type: 'text',
    nodeType: 'text',
    textType: textTypeMap[block.type] || 'p',
    line: 0,
    direction: block.direction,
    content: block.content,
    blockId: block.id,
  } as any;
}

function listBlockToNode(block: ListBlock | any): ListNode {
  const convertItems = (items: readonly ListItem[]): any[] => {
    return items.map(item => ({
      id: item.id,
      itemType: item.itemType || ('li' as const),
      listType: item.listType,
      childListType: item.childListType,
      content: item.content,
      children: item.children ? convertItems(item.children) : undefined,
    }));
  };

  const fallbackListType = block.type === 'numbered-list' ? 'ol' : block.type === 'definition-list' ? 'dl' : 'ul';
  const firstItemListType = block.items[0]?.listType;
  const resolvedListType =
    firstItemListType === 'ol' ? 'ol' :
      firstItemListType === 'dl' ? 'dl' :
        firstItemListType === 'ul' ? 'ul' :
          fallbackListType;

  return {
    type: 'list',
    nodeType: 'list',
    listType: resolvedListType,
    line: 0,
    direction: block.direction,
    items: convertItems(block.items),
    blockId: block.id,
  } as any;
}

function codeBlockToNode(block: CodeBlock): BlockNode {
  return {
    type: 'block',
    nodeType: 'block',
    blockName: 'code',
    isCode: true,
    language: block.language,
    line: 0,
    direction: block.direction,
    content: block.code,
    blockId: block.id,
  } as any;
}

function tableBlockToNode(block: TableBlock): TableNode {
  const rows = block.rows.map(row => ({
    rowType: row.isHeader ? ('th' as const) : ('tr' as const),
    cells: row.cells.map(cell => ({
      content: cell.content,
    })),
  }));

  return {
    type: 'table',
    nodeType: 'table',
    line: 0,
    direction: block.direction,
    headers: block.hasHeader && rows.length > 0 ? rows[0] : undefined,
    rows: block.hasHeader ? rows.slice(1) : rows,
    blockId: block.id,
  } as any;
}

function mediaBlockToNode(block: MediaBlock): MediaNode {
  const mediaTypeMap: Record<string, MediaNode['mediaType']> = {
    image: 'img',
    video: 'video',
    audio: 'audio',
  };

  return {
    type: 'media',
    nodeType: 'media',
    mediaType: mediaTypeMap[block.type] || 'img',
    src: block.src,
    alt: block.alt,
    line: 0,
    direction: block.direction,
    blockId: block.id,
  } as any;
}

function dividerBlockToNode(block: DividerBlock): SeparatorNode {
  return {
    type: 'separator',
    nodeType: 'separator',
    separatorType: 'hr',
    line: 0,
    direction: block.direction,
    blockId: block.id,
  } as any;
}

// ═══════════════════════════════════════════════════════════════════════════
// ContentNode → Block conversion
// ═══════════════════════════════════════════════════════════════════════════

function contentNodeToBlock(node: ContentNode, index: number): Block {
  switch (node.nodeType) {
    case 'text':
      return textNodeToBlock(node as TextNode);
    case 'list':
      return listNodeToBlock(node as ListNode);
    case 'block':
      return blockNodeToBlock(node as BlockNode);
    case 'table':
      return tableNodeToBlock(node as TableNode);
    case 'media':
      return mediaNodeToBlock(node as MediaNode);
    case 'separator':
      return separatorNodeToBlock(node as SeparatorNode);
    default:
      return {
        id: generateId('p'),
        type: 'paragraph',
        direction: 'rtl',
        content: [],
      };
  }
}

function textNodeToBlock(node: TextNode): TextBlock {
  const typeMap: Record<TextNode['textType'], TextBlock['type']> = {
    p: 'paragraph',
    t1: 'heading1',
    t2: 'heading2',
    t3: 'heading3',
    t4: 'heading4',
    t5: 'heading5',
    t6: 'heading6',
    q: 'quote',
    pre: 'paragraph',
    time: 'paragraph',
    abbr: 'paragraph',
  };

  return {
    id: getNodeBlockId(node, node.textType),
    type: typeMap[node.textType] || 'paragraph',
    direction: node.direction,
    content: node.content,
  };
}

function listNodeToBlock(node: ListNode): ListBlock {
  const convertItems = (items: readonly any[]): any[] => {
    return items.map(item => ({
      id: item.id || generateId('li'),
      itemType: item.itemType,
      listType: item.listType || node.listType,
      childListType: item.childListType,
      content: item.content,
      children: item.children && item.children.length > 0
        ? convertItems(item.children)
        : undefined,
    }));
  };

  const type = node.listType === 'ol' ? 'numbered-list' : node.listType === 'dl' ? 'definition-list' : 'bullet-list';
  return {
    id: getNodeBlockId(node, node.listType),
    type: type as any,
    direction: node.direction,
    items: convertItems(node.items),
  };
}

function blockNodeToBlock(node: BlockNode): CodeBlock {
  return {
    id: getNodeBlockId(node, 'code'),
    type: 'code',
    direction: node.direction,
    language: node.language || '',
    code: typeof node.content === 'string' ? node.content : '',
  };
}

function tableNodeToBlock(node: TableNode): TableBlock {
  const rows: any[] = [];

  if (node.headers) {
    rows.push({
      id: generateId('tr'),
      isHeader: true,
      cells: node.headers.cells.map((cell: any) => ({
        id: generateId('td'),
        content: cell.content,
      })),
    });
  }

  for (const row of node.rows) {
    rows.push({
      id: generateId('tr'),
      isHeader: row.rowType === 'th',
      cells: row.cells.map((cell: any) => ({
        id: generateId('td'),
        content: cell.content,
      })),
    });
  }

  return {
    id: getNodeBlockId(node, 'table'),
    type: 'table',
    direction: node.direction,
    rows,
    hasHeader: !!node.headers,
  };
}

function mediaNodeToBlock(node: MediaNode): MediaBlock {
  const typeMap: Record<MediaNode['mediaType'], MediaBlock['type']> = {
    img: 'image',
    video: 'video',
    audio: 'audio',
    file: 'image',
  };

  return {
    id: getNodeBlockId(node, node.mediaType),
    type: typeMap[node.mediaType] || 'image',
    direction: node.direction,
    src: node.src,
    alt: node.alt,
  };
}

function separatorNodeToBlock(node: SeparatorNode): DividerBlock {
  return {
    id: getNodeBlockId(node, 'hr'),
    type: 'divider',
    direction: node.direction,
  };
}

function getNodeBlockId(node: unknown, prefix: string): string {
  const value = (node as any)?.blockId;
  return typeof value === 'string' && value.length > 0 ? value : generateId(prefix);
}

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

function nodeSize(node: ContentNode): number {
  try {
    return astNodeSize(node);
  } catch {
    // Fallback simplified size calculation
    return 2;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Selection Bridge: typer SelectionState ↔ @artoon/state Selection
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert a block-relative offset to a document-absolute position.
 *
 * Position model (matches @artoon/state):
 *   pos 0 = doc open
 *   pos 1 = first node open
 *   pos 1 + nodeSize(node0) = after first node
 *   ...
 *
 * Block offset is 0-indexed within the block's inline content.
 * For a text block with "abc" (3 chars), offset 2 → doc pos = nodeStart + 1 + 2
 */
export function blockOffsetToDocPos(
  blocks: Block[],
  blockId: string,
  offset: number
): number {
  const nodes = blocks.map(b => blockToContentNode(b));
  let pos = 1; // skip doc open

  for (let i = 0; i < blocks.length; i++) {
    const size = nodeSize(nodes[i]);
    if (blocks[i].id === blockId) {
      // Found the block: nodeOpen(1) + offset within content
      return pos + 1 + offset;
    }
    pos += size;
  }

  // Fallback: end of document
  return pos;
}

/**
 * Convert a document-absolute position to a block-relative offset.
 *
 * Returns { blockId, offset } where offset is 0-indexed within the block's
 * inline content. Returns null if position is outside block content.
 */
export function docPosToBlockOffset(
  blocks: Block[],
  docPos: number
): { blockId: string; offset: number } | null {
  const nodes = blocks.map(b => blockToContentNode(b));
  let pos = 1; // skip doc open

  for (let i = 0; i < blocks.length; i++) {
    const size = nodeSize(nodes[i]);
    const nodeOpen = pos;
    const nodeClose = pos + size;

    if (docPos > nodeOpen && docPos < nodeClose) {
      // Position is inside this node
      // offset = docPos - (nodeOpen + 1)  where +1 is the node open token
      const offset = docPos - nodeOpen - 1;
      return {
        blockId: blocks[i].id,
        offset: Math.max(0, offset),
      };
    }

    pos += size;
  }

  return null;
}

/**
 * Convert typer SelectionState → @artoon/state TextSelection
 */
export function typerSelectionToStateSelection(
  state: EditorState,
  blocks: Block[],
  sel: { blockId: string; anchorOffset: number; focusOffset: number }
): StateSelection | null {
  try {
    const anchor = blockOffsetToDocPos(blocks, sel.blockId, sel.anchorOffset);
    const head = blockOffsetToDocPos(blocks, sel.blockId, sel.focusOffset);
    const doc = (state as any).doc || (state as any)._doc;
    if (doc) {
      return TextSelectionImpl.create(doc, anchor, head);
    }
  } catch {
    // Fall through
  }
  return null;
}

/**
 * Convert @artoon/state Selection → typer SelectionState
 */
export function stateSelectionToTyperSelection(
  blocks: Block[],
  stateSel: StateSelection
): { blockId: string; anchorOffset: number; focusOffset: number; isCollapsed: boolean } | null {
  try {
    const from = stateSel.from;
    const to = stateSel.to;
    const resolved = docPosToBlockOffset(blocks, from);
    if (!resolved) return null;

    // If from and to are in the same block
    const resolvedTo = docPosToBlockOffset(blocks, to);
    if (resolvedTo && resolvedTo.blockId === resolved.blockId) {
      return {
        blockId: resolved.blockId,
        anchorOffset: resolved.offset,
        focusOffset: resolvedTo.offset,
        isCollapsed: from === to,
      };
    }

    // Selection spans multiple blocks — return start block info
    return {
      blockId: resolved.blockId,
      anchorOffset: resolved.offset,
      focusOffset: resolved.offset,
      isCollapsed: false,
    };
  } catch {
    return null;
  }
}

/**
 * Apply a typer SelectionState to the EditorState as a transaction.
 * Returns a new EditorState with the selection updated.
 */
export function setSelectionInState(
  state: EditorState,
  blocks: Block[],
  sel: { blockId: string; anchorOffset: number; focusOffset: number }
): EditorState {
  const stateSel = typerSelectionToStateSelection(state, blocks, sel);
  if (!stateSel) return state;

  try {
    const tr = state.tr;
    (tr as any).setSelection(stateSel);
    return state.apply(tr);
  } catch {
    return state;
  }
}
