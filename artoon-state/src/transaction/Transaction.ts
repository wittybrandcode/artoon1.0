/**
 * Transaction - A set of document changes
 */

import type { ContentNode, Modifier } from '@artoon/ast';
import type { Transaction, Step, Selection, Position } from '../types';
import { DocumentImpl } from '../state/Document';
import { SliceImpl } from '../state/Slice';
import { FragmentImpl } from '../state/Fragment';
import { TextSelectionImpl } from '../selection/Selection';
import { MappingImpl } from './Mapping';
import { ReplaceStep, AddMarkStep, RemoveMarkStep, SetAttrsStep } from './Step';

/**
 * Transaction implementation
 */
export class TransactionImpl implements Transaction {
  readonly steps: Step[] = [];
  readonly docs: DocumentImpl[] = [];
  private _mapping: MappingImpl;
  private _doc: DocumentImpl;
  private _selection: Selection;
  private _meta: Map<string, unknown> = new Map();
  private _selectionSet: boolean = false;
  readonly time: number;
  private _scrollIntoView: boolean = false;

  constructor(doc: DocumentImpl, selection: Selection) {
    this._doc = doc;
    this._selection = selection;
    this._mapping = MappingImpl.empty();
    this.time = Date.now();
    this.docs.push(doc);
  }

  get mapping(): MappingImpl {
    return this._mapping;
  }

  get doc(): DocumentImpl {
    return this._doc;
  }

  get selection(): Selection {
    return this._selection;
  }

  get meta(): Map<string, unknown> {
    return this._meta;
  }

  get selectionSet(): boolean {
    return this._selectionSet;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  step(step: Step): TransactionImpl {
    const result = step.apply(this._doc);

    if (result.failed) {
      throw new Error(`Step failed: ${result.failed}`);
    }

    if (result.doc) {
      this.steps.push(step);
      this.docs.push(result.doc as DocumentImpl);
      this._doc = result.doc as DocumentImpl;

      // Update mapping
      if (step instanceof ReplaceStep) {
        this._mapping.addRange(
          step.from,
          step.to,
          step.from,
          step.from + step.slice.size
        );
      }

      // Map selection through changes
      if (!this._selectionSet) {
        this._selection = this._selection.map(this._mapping);
      }
    }

    return this;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  insertText(text: string, from?: Position, to?: Position): TransactionImpl {
    const insertFrom = from ?? this._selection.from;
    const insertTo = to ?? this._selection.to;

    // Resolve position to find the containing text node
    const $from = this._doc.resolve(insertFrom);

    // Find the text node - it could be at current depth or parent
    let textNode: ContentNode | null = null;
    let textNodeDepth = -1;

    for (let d = $from.depth; d >= 0; d--) {
      const node = $from.node(d);
      if (node && node.nodeType === 'text') {
        textNode = node;
        textNodeDepth = d;
        break;
      }
    }

    // If we found a text node, modify its inline content
    if (textNode && textNodeDepth >= 0 && textNode.nodeType === 'text') {
      const nodeStart = $from.start(textNodeDepth);
      const nodeEnd = $from.end(textNodeDepth);

      // Calculate text offset within the text node
      // nodeStart is the position of the node open token
      // insertFrom is where we want to insert
      // textOffset is the character position within the text content
      const textOffset = Math.max(0, insertFrom - nodeStart - 1); // -1 for node open position

      // Get current inline content (cast to TextNode to access content)
      const textNodeTyped = textNode as { content: readonly any[] };
      const currentContent = textNodeTyped.content || [];

      // Calculate position within inline content
      let charPos = 0;
      let insertIndex = 0;
      let insertOffset = 0;

      for (let i = 0; i < currentContent.length; i++) {
        const item = currentContent[i];
        const itemLen = item.type === 'plain' ? item.value.length : (item.value?.length || 1);

        if (charPos + itemLen >= textOffset) {
          insertIndex = i;
          insertOffset = textOffset - charPos;
          break;
        }
        charPos += itemLen;
        insertIndex = i + 1;
      }

      // Build new content array with inserted text
      const newContent = [...currentContent];

      if (insertIndex < currentContent.length && currentContent[insertIndex].type === 'plain') {
        // Insert into existing plain text
        const item = currentContent[insertIndex];
        const itemValue = item.value || '';
        const before = itemValue.slice(0, insertOffset);
        const after = itemValue.slice(insertOffset);
        newContent[insertIndex] = { type: 'plain', value: before + text + after };
      } else if (insertIndex > 0 && currentContent[insertIndex - 1]?.type === 'plain') {
        // Append to previous plain text
        const item = currentContent[insertIndex - 1];
        const itemValue = item.value || '';
        newContent[insertIndex - 1] = { type: 'plain', value: itemValue + text };
      } else {
        // Insert new plain text item
        newContent.splice(insertIndex, 0, { type: 'plain', value: text });
      }

      // Create new text node with updated content
      const newTextNode = {
        ...textNode,
        content: newContent
      } as ContentNode;

      // Replace the entire text node
      // nodeStart is the node open position (e.g., 1 for first node)
      // nodeEnd is the node close position
      // We replace from nodeStart to nodeEnd (inclusive of the node boundaries)
      const slice = new SliceImpl(FragmentImpl.from(newTextNode), 0, 0);
      this.step(new ReplaceStep(nodeStart, nodeEnd, slice));

      // Update selection to be after inserted text
      // The new position is: nodeStart + 1 (node open) + textOffset + text.length
      const newPos = nodeStart + 1 + textOffset + text.length;
      return this.setSelection(TextSelectionImpl.create(this._doc, newPos, newPos));
    }

    // Fallback: create a new text node (for empty document or non-text context)
    const newTextNode: ContentNode = {
      type: 'text',
      nodeType: 'text',
      textType: 'p',
      direction: this.detectDirection(text),
      line: 1,
      content: [{ type: 'plain', value: text }]
    };

    const slice = new SliceImpl(FragmentImpl.from(newTextNode), 0, 0);
    return this.step(new ReplaceStep(insertFrom, insertTo, slice));
  }

  delete(from: Position, to: Position): TransactionImpl {
    if (from === to) return this;
    return this.step(new ReplaceStep(from, to, SliceImpl.empty));
  }

  replaceWith(
    from: Position,
    to: Position,
    content: ContentNode | ContentNode[]
  ): TransactionImpl {
    const nodes = Array.isArray(content) ? content : [content];
    const slice = new SliceImpl(FragmentImpl.from(nodes), 0, 0);
    return this.step(new ReplaceStep(from, to, slice));
  }

  replaceRangeWith(from: Position, to: Position, node: ContentNode): TransactionImpl {
    return this.replaceWith(from, to, node);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MARK OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  addMark(from: Position, to: Position, mark: Modifier): TransactionImpl {
    return this.step(new AddMarkStep(from, to, mark));
  }

  removeMark(from: Position, to: Position, mark: Modifier): TransactionImpl {
    return this.step(new RemoveMarkStep(from, to, mark));
  }

  toggleMark(mark: Modifier): TransactionImpl {
    const { from, to } = this._selection;

    // Check if mark is active in selection
    const hasMarkInSelection = this.hasMarkInRange(from, to, mark);

    if (hasMarkInSelection) {
      return this.removeMark(from, to, mark);
    } else {
      return this.addMark(from, to, mark);
    }
  }

  clearMarks(from: Position, to: Position): TransactionImpl {
    const allMarks: Modifier[] = ['s', 'e', 'u', 'd', 'mark', 'sub', 'sup'];
    for (const mark of allMarks) {
      this.removeMark(from, to, mark);
    }
    return this;
  }

  private hasMarkInRange(from: Position, to: Position, mark: Modifier): boolean {
    // Simplified check - would need to traverse inline content
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTION OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  setSelection(selection: Selection): TransactionImpl {
    this._selection = selection;
    this._selectionSet = true;
    return this;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NODE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  setNodeAttrs(pos: Position, attrs: Record<string, unknown>): TransactionImpl {
    return this.step(new SetAttrsStep(pos, attrs));
  }

  setBlockType(
    from: Position,
    to: Position,
    nodeType: string,
    attrs?: Record<string, unknown>
  ): TransactionImpl {
    // Find all block nodes in range and change their type
    let pos = from;
    while (pos < to) {
      const node = this._doc.nodeAt(pos);
      if (node && node.nodeType === 'text') {
        this.setNodeAttrs(pos, { textType: nodeType, ...attrs });
      }
      pos++;
    }
    return this;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════════════════════

  setMeta(key: string, value: unknown): TransactionImpl {
    this._meta.set(key, value);
    return this;
  }

  getMeta(key: string): unknown {
    return this._meta.get(key);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCROLLING
  // ═══════════════════════════════════════════════════════════════════════════

  scrollIntoView(): TransactionImpl {
    this._scrollIntoView = true;
    return this;
  }

  get shouldScrollIntoView(): boolean {
    return this._scrollIntoView;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private detectDirection(text: string): 'rtl' | 'ltr' {
    // Simple RTL detection based on first character
    const rtlChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return rtlChars.test(text.charAt(0)) ? 'rtl' : 'ltr';
  }
}
