// ARTOON AST Builder
// Builds semantic tree from tokens
// v2.0 - Unified types with @artoon/ast

import { Direction, SEPARATOR_COMPONENTS } from '../types';
import { TextType } from '../ast/types';
import {
  Token, ASTNode, DocumentNode, TextNode, SeparatorNode,
  ListNode, ListItem, TableNode, CompoundNode, BlockNode,
  CommentNode, MediaNode, LinkNode, CodeNode, ParseError, ParseResult,
  ParsedContent, InlineContent, ListItemType
} from './types';
import { ContextStack, createContextStack, Context } from '../context';
import { parseInlineContent } from '../inline';
import { convertParsedToInline } from '../inline/converter';
import { isListContainer, isListItem, calculateDepthChange } from '../depth';
import {
  isTableComponent, isTableStart, isTableHeader, isTableRow,
  createTableState, parseTableHeader, parseTableRow, buildTableNode, TableState
} from '../table';
import {
  isCompoundComponent, isChildElement, createCompoundState,
  addCompoundChild, buildCompoundNode, shouldCloseCompound, CompoundState
} from '../compound';
import {
  isBlockStart, isBlockEnd, createBlockState, addBlockContent,
  parseMetaFieldAlt, addBlockField, buildBlockNode, BlockState,
  validateHiddenFieldUsage, validateMetaContent, isHiddenField
} from '../block';
import { ErrorCollector, createErrorCollector, structureError, warning } from '../errors';

// Re-export types
export * from './types';

/**
 * AST Builder state
 */
interface BuilderState {
  document: DocumentNode;
  contextStack: ContextStack;
  errors: ErrorCollector;
  currentBlock: BlockState | null;
  currentTable: TableState | null;
  currentCompound: CompoundState | null;
  currentList: ListNode | null;
  listStack: ListNode[];
}

/**
 * Create initial builder state
 */
function createBuilderState(): BuilderState {
  return {
    document: {
      type: 'document',
      children: []
    },
    contextStack: createContextStack(),
    errors: createErrorCollector(),
    currentBlock: null,
    currentTable: null,
    currentCompound: null,
    currentList: null,
    listStack: []
  };
}

/**
 * Build AST from tokens
 */
export function buildAST(tokens: Token[]): ParseResult {
  const state = createBuilderState();

  for (const token of tokens) {
    processToken(token, state);
  }

  // Close any unclosed contexts
  finalizeState(state);

  return {
    ast: state.document,
    errors: state.errors.getAll()
  };
}

/**
 * Process single token
 */
function processToken(token: Token, state: BuilderState): void {
  // Skip empty lines (but they might close contexts)
  if (!token.raw.trim()) {
    return;
  }

  // Handle block content
  if (state.currentBlock) {
    processBlockContent(token, state);
    return;
  }

  // Handle block start
  if (isBlockStart(token)) {
    startBlock(token, state);
    return;
  }

  // Handle block end (shouldn't happen if not in block)
  if (isBlockEnd(token)) {
    state.errors.add(structureError(
      token.line, 0,
      `Unexpected block end .<${token.blockName}>`,
      'Block end without matching start'
    ));
    return;
  }

  // Handle comments
  if (token.isComment) {
    addNode(state, {
      type: 'comment',
      line: token.line,
      direction: token.direction,
      content: token.content
    } as CommentNode);
    return;
  }

  // Handle compound child elements
  if (token.isChildElement && (state.currentCompound || state.currentList)) {
    processCompoundChild(token, state);
    return;
  }

  // Check if compound should close
  if (state.currentCompound && shouldCloseCompound(token)) {
    closeCompound(state);
  }

  // Handle table components
  if (state.currentTable && isTableComponent(token.componentType)) {
    processTableContent(token, state);
    return;
  }

  // Close table if non-table component
  if (state.currentTable && !isTableComponent(token.componentType)) {
    closeTable(state);
  }

  // Handle component types
  const type = token.componentType;

  // Separator components
  if (type && SEPARATOR_COMPONENTS.includes(type)) {
    processSeparator(token, state);
    return;
  }

  // Combined separators (br;hr;br) - create multiple separator nodes
  if (type && type.includes(';')) {
    const parts = type.split(';').map(p => p.trim());
    if (parts.every(p => SEPARATOR_COMPONENTS.includes(p))) {
      // Create a separator node for each part
      parts.forEach(part => {
        addNode(state, {
          type: 'separator',
          line: token.line,
          direction: token.direction,
          separatorType: part
        } as SeparatorNode);
      });
      return;
    }
  }

  // Table start
  if (isTableStart(type)) {
    startTable(token, state);
    return;
  }

  // Compound component start
  if (isCompoundComponent(type)) {
    startCompound(token, state);
    return;
  }

  // Phase 18: Flat list syntax — >.ul:: content (container type WITH content)
  // When a list container type (ul/ol/dl) has content, treat as a direct list item
  if (isListContainer(type) && token.separator === '::' && token.content) {
    // To utilize the robust recursive nesting built into processListItem, 
    // we convert this container token into an item token with the explicit list type.
    const implicitType = type as 'ul' | 'ol' | 'dl';
    const itemType = implicitType === 'dl' ? 'dt' : 'li';

    // Create a mock token for processListItem
    const itemToken = {
      ...token,
      componentType: itemType, // E.g., 'li'
    };

    // Override the current list type for this specific item if we're creating an implicit list
    // OR if we're nesting inside an existing list and want to set childListType

    // Process standard depth and AST building
    processListItem(itemToken, state);

    // processListItem placed our new item as the last element of the current list.
    // Let's attach the specific listType that the flat syntax requested to it.
    if (state.currentList && state.currentList.items.length > 0) {
      const lastItem = state.currentList.items[state.currentList.items.length - 1];
      lastItem.listType = implicitType;

      // If this item created a new context (implicit root or nested),
      // update the listType of that container to match what the user requested.
      if (state.currentList.items.length === 1) {
        state.currentList.listType = implicitType;
      }
    }

    return;
  }

  // List container (old syntax: >.ul:: without content)
  if (isListContainer(type)) {
    startList(token, state);
    return;
  }

  // List item
  if (isListItem(type)) {
    processListItem(token, state);
    return;
  }

  // Media components
  if (['img', 'video', 'audio', 'file'].includes(type || '')) {
    processMedia(token, state);
    return;
  }

  // Link component
  if (type === 'a') {
    processLink(token, state);
    return;
  }

  // Code component (inline)
  if (type === 'c') {
    processInlineCode(token, state);
    return;
  }

  // Text components (p, t1-t6, q, pre, time, abbr)
  processTextComponent(token, state);
}

/**
 * Process text component
 */
function processTextComponent(token: Token, state: BuilderState): void {
  // Close any open lists
  closeAllLists(state);

  const { result, errors } = parseInlineContent(token.content, token.line);
  errors.forEach(e => state.errors.addParseError(e));

  // Convert ParsedContent to InlineContent[]
  const content = convertParsedToInline(result);

  const node: TextNode = {
    type: 'text',
    line: token.line,
    direction: token.direction,
    textType: (token.componentType as any || 'p'),
    content
  };

  addNode(state, node);
}

/**
 * Process separator
 */
function processSeparator(token: Token, state: BuilderState): void {
  addNode(state, {
    type: 'separator',
    line: token.line,
    direction: token.direction,
    separatorType: token.componentType!
  } as SeparatorNode);
}

/**
 * Start block
 */
function startBlock(token: Token, state: BuilderState): void {
  state.currentBlock = createBlockState(
    token.blockName!,
    token.blockLang,
    token.line
  );

  state.contextStack.push({
    type: 'block',
    name: token.blockName!,
    direction: 'ltr',
    depth: 0,
    line: token.line
  });
}

/**
 * Process block content
 */
function processBlockContent(token: Token, state: BuilderState): void {
  if (!state.currentBlock) return;

  // Code blocks: store raw content (check BEFORE block end check!)
  // This prevents lines like ".<meta>" inside code blocks from being interpreted as block ends
  if (state.currentBlock.isCode) {
    // Only check for the CORRECT block end
    if (isBlockEnd(token) && token.blockName === state.currentBlock.name) {
      closeBlock(state);
      return;
    }
    // Everything else is raw content
    addBlockContent(state.currentBlock, token.raw);
    return;
  }

  // Check for block end (for non-code blocks)
  if (isBlockEnd(token)) {
    if (token.blockName === state.currentBlock.name) {
      closeBlock(state);
    } else {
      state.errors.add(structureError(
        token.line, 0,
        `Expected .<${state.currentBlock.name}> but got .<${token.blockName}>`,
        `Use .<${state.currentBlock.name}> to close the block`
      ));
    }
    return;
  }

  // Validate hidden field usage (only in META)
  const hiddenFieldError = validateHiddenFieldUsage(token, state.currentBlock);
  if (hiddenFieldError) {
    state.errors.addParseError(hiddenFieldError);
    // Still process the line as content
    addBlockContent(state.currentBlock, token.raw);
    return;
  }

  // Validate META content (only hidden fields allowed)
  const metaContentError = validateMetaContent(token, state.currentBlock);
  if (metaContentError) {
    state.errors.addParseError(metaContentError);
    // Still process the line as content
    addBlockContent(state.currentBlock, token.raw);
    return;
  }

  // All custom blocks: parse hidden fields (>.-:field: value)
  if (isHiddenField(token)) {
    const field = parseMetaFieldAlt(token);
    if (field) {
      addBlockField(state.currentBlock, field);
      return;
    }
  }

  // Other content: store as raw
  addBlockContent(state.currentBlock, token.raw);
}

/**
 * Close block
 */
function closeBlock(state: BuilderState): void {
  if (!state.currentBlock) return;

  const node = buildBlockNode(state.currentBlock);

  // Meta block goes to document.meta
  if (state.currentBlock.name === 'meta') {
    state.document.meta = node;
  } else {
    addNode(state, node);
  }

  state.contextStack.pop();
  state.currentBlock = null;
}

/**
 * Start table
 */
function startTable(token: Token, state: BuilderState): void {
  closeAllLists(state);

  state.currentTable = createTableState(token.direction, token.line);

  state.contextStack.push({
    type: 'table',
    name: 'table',
    direction: token.direction,
    depth: 0,
    line: token.line
  });
}

/**
 * Process table content
 */
function processTableContent(token: Token, state: BuilderState): void {
  if (!state.currentTable) return;

  if (isTableHeader(token.componentType)) {
    const result = parseTableHeader(token.content, state.currentTable);
    if (result.error) {
      state.errors.addParseError(result.error);
    }
  } else if (isTableRow(token.componentType)) {
    const result = parseTableRow(token.content, state.currentTable, token.line);
    if (result.error) {
      state.errors.addParseError(result.error);
    }
  }
}

/**
 * Close table
 */
function closeTable(state: BuilderState): void {
  if (!state.currentTable) return;

  const node = buildTableNode(state.currentTable);
  addNode(state, node);

  state.contextStack.closeUntilType('table');
  state.contextStack.pop();
  state.currentTable = null;
}

/**
 * Start compound
 */
function startCompound(token: Token, state: BuilderState): void {
  closeAllLists(state);

  state.currentCompound = createCompoundState(
    token.componentType as 'figure' | 'details',
    token.direction,
    token.line
  );

  // If details has inline content, it's the summary
  if (token.componentType === 'details' && token.content && token.content.trim()) {
    const { result, errors } = parseInlineContent(token.content, token.line);
    errors.forEach(e => state.errors.addParseError(e));

    // Convert ParsedContent to InlineContent[]
    const content = convertParsedToInline(result);

    const summaryNode: TextNode = {
      type: 'text',
      line: token.line,
      direction: token.direction,
      textType: 'summary',
      content
    };

    addCompoundChild(state.currentCompound, summaryNode);
  }

  state.contextStack.push({
    type: 'compound',
    name: token.componentType!,
    direction: token.direction,
    depth: 0,
    line: token.line
  });
}

/**
 * Process compound child
 */
function processCompoundChild(token: Token, state: BuilderState): void {
  if (!state.currentCompound) return;

  // Parse child content
  const { result, errors } = parseInlineContent(token.content, token.line);
  errors.forEach(e => state.errors.addParseError(e));

  // Convert ParsedContent to InlineContent[]
  const content = convertParsedToInline(result);

  // Create appropriate node based on child type
  const childType = token.componentType;
  let childNode: ASTNode;

  if (['img', 'video', 'audio'].includes(childType || '')) {
    const attrs = token.content.split(';').map(a => a.trim());
    childNode = {
      type: 'media',
      line: token.line,
      direction: token.direction,
      mediaType: childType as 'img' | 'video' | 'audio',
      src: attrs[0] || '',
      alt: attrs[1],
      title: attrs[2]
    } as MediaNode;
  } else {
    childNode = {
      type: 'text',
      line: token.line,
      direction: token.direction,
      textType: childType || 'p',
      content
    } as TextNode;
  }

  addCompoundChild(state.currentCompound, childNode);
}

/**
 * Close compound
 */
function closeCompound(state: BuilderState): void {
  if (!state.currentCompound) return;

  const node = buildCompoundNode(state.currentCompound);
  addNode(state, node);

  state.contextStack.closeUntilType('compound');
  state.contextStack.pop();
  state.currentCompound = null;
}

/**
 * Start list
 */
function startList(token: Token, state: BuilderState): void {
  const listNode: ListNode = {
    type: 'list',
    line: token.line,
    direction: token.direction,
    listType: token.componentType as 'ul' | 'ol' | 'dl',
    items: []
  };

  if (token.depth > 0 && state.currentList) {
    // Nested list - add items directly to parent's last item.children
    const lastItem = state.currentList.items[state.currentList.items.length - 1];
    if (lastItem) {
      // Initialize children array if needed
      if (!lastItem.children) {
        lastItem.children = [];
      }

      // Capture the child list type (if different from default / to override parent)
      // This allows mixing list types (e.g., numbered inside bulleted)
      lastItem.childListType = token.componentType as 'ul' | 'ol' | 'dl';
      // Note: We'll add items directly, not wrap in ListNode
    }
    state.listStack.push(state.currentList);
  }

  state.currentList = listNode;

  state.contextStack.push({
    type: 'list',
    name: token.componentType!,
    direction: token.direction,
    depth: token.depth,
    line: token.line
  });
}

/**
 * Process list item
 */
function processListItem(token: Token, state: BuilderState): void {
  // Handle depth changes
  const depthChange = calculateDepthChange(token, state.contextStack);

  if (depthChange.action === 'close') {
    // Close nested lists
    for (let i = 0; i < depthChange.closedContexts.length; i++) {
      if (state.listStack.length > 0) {
        state.currentList = state.listStack.pop()!;
      }
    }
  }

  // Create list if none exists
  if (!state.currentList) {
    // Implicit list creation
    const implicitType = token.componentType === 'dt' || token.componentType === 'dd' ? 'dl' : 'ul';
    state.currentList = {
      type: 'list',
      line: token.line,
      direction: token.direction,
      listType: implicitType,
      items: []
    };

    state.contextStack.push({
      type: 'list',
      name: implicitType,
      direction: token.direction,
      depth: token.depth,
      line: token.line
    });
  }

  // Check if we need to handle nested items
  const currentDepth = state.contextStack.getCurrentListDepth();

  if (token.depth > currentDepth && state.currentList.items.length > 0) {
    // Create nested items under last item
    const lastItem = state.currentList.items[state.currentList.items.length - 1];

    // Initialize children array if needed
    if (!lastItem.children) {
      lastItem.children = [];
    }

    // Push current list to stack
    state.listStack.push(state.currentList);

    // Create a virtual list to collect nested items
    // (we'll add items directly to lastItem.children)
    state.currentList = {
      type: 'list',
      line: token.line,
      direction: token.direction,
      listType: state.currentList.listType, // Inherit parent type
      items: lastItem.children as ListItem[] // Point to parent's children array
    };

    // Update context
    state.contextStack.push({
      type: 'list',
      name: state.currentList.listType,
      direction: token.direction,
      depth: token.depth,
      line: token.line
    });
  }

  // Parse content
  const { result, errors } = parseInlineContent(token.content, token.line);
  errors.forEach(e => state.errors.addParseError(e));

  // Convert ParsedContent to InlineContent[]
  const content = convertParsedToInline(result);

  // Create item (ListItem, not ListItemNode)
  const item: ListItem = {
    itemType: token.componentType as ListItemType,
    listType: state.currentList.listType,
    content
    // children will be added if there are nested items
  };

  state.currentList.items.push(item);
}

/**
 * Close all lists
 */
function closeAllLists(state: BuilderState): void {
  if (!state.currentList) return;

  // Pop all nested lists
  while (state.listStack.length > 0) {
    state.currentList = state.listStack.pop()!;
  }

  // Add root list to document
  addNode(state, state.currentList);

  state.contextStack.closeAllLists();
  state.currentList = null;
}

/**
 * Process media component
 */
function processMedia(token: Token, state: BuilderState): void {
  closeAllLists(state);

  const attrs = token.content.split(';').map(a => a.trim());

  const node: MediaNode = {
    type: 'media',
    line: token.line,
    direction: token.direction,
    mediaType: token.componentType as 'img' | 'video' | 'audio' | 'file',
    src: attrs[0] || ''
  };

  if (token.componentType === 'img') {
    node.alt = attrs[1];
    node.title = attrs[2];
  } else if (token.componentType === 'file') {
    node.label = attrs[1];
  } else {
    node.title = attrs[1];
  }

  addNode(state, node);
}

/**
 * Process link component
 */
function processLink(token: Token, state: BuilderState): void {
  closeAllLists(state);

  const attrs = token.content.split(';').map(a => a.trim());

  const node: LinkNode = {
    type: 'link',
    line: token.line,
    direction: token.direction,
    url: attrs[0] || '',
    text: attrs[1],
    modifiers: []
  };

  addNode(state, node);
}

/**
 * Process inline code
 */
function processInlineCode(token: Token, state: BuilderState): void {
  closeAllLists(state);

  const attrs = token.content.split(';').map(a => a.trim());

  const node: CodeNode = {
    type: 'code',
    line: token.line,
    direction: token.direction,
    code: attrs[0] || '',
    lang: attrs[1]
  };

  addNode(state, node);
}

/**
 * Add node to appropriate parent
 */
function addNode(state: BuilderState, node: ASTNode): void {
  state.document.children.push(node);
}

/**
 * Finalize state - close unclosed contexts
 */
function finalizeState(state: BuilderState): void {
  // Close unclosed block
  if (state.currentBlock) {
    state.errors.add(structureError(
      state.currentBlock.startLine, 0,
      `Block <${state.currentBlock.name}> not closed`,
      `Add .<${state.currentBlock.name}> to close the block`
    ));
    closeBlock(state);
  }

  // Close unclosed table
  if (state.currentTable) {
    closeTable(state);
  }

  // Close unclosed compound
  if (state.currentCompound) {
    state.errors.add(warning(
      state.currentCompound.startLine, 0,
      `Compound ${state.currentCompound.type} implicitly closed at end of document`
    ));
    closeCompound(state);
  }

  // Close unclosed lists
  closeAllLists(state);
}
