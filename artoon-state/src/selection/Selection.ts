/**
 * Selection - Base selection class and implementations
 */

import type { ContentNode } from '@artoon/ast';
import type {
  Selection,
  SelectionJSON,
  TextSelection,
  NodeSelection,
  AllSelection,
  Position,
  Mapping,
  Slice,
  ResolvedPos
} from '../types';
import { DocumentImpl, nodeSize } from '../state/Document';
import { SliceImpl } from '../state/Slice';
import { ResolvedPosImpl, resolvePos } from '../state/ResolvedPos';

/**
 * Base selection implementation
 */
abstract class SelectionBase implements Selection {
  abstract readonly type: 'text' | 'node' | 'all';
  readonly anchor: Position;
  readonly head: Position;

  protected _doc: DocumentImpl;
  protected _$anchor: ResolvedPosImpl | null = null;
  protected _$head: ResolvedPosImpl | null = null;

  constructor(anchor: Position, head: Position, doc: DocumentImpl) {
    this.anchor = anchor;
    this.head = head;
    this._doc = doc;
  }

  get from(): Position {
    return Math.min(this.anchor, this.head);
  }

  get to(): Position {
    return Math.max(this.anchor, this.head);
  }

  get empty(): boolean {
    return this.from === this.to;
  }

  get $anchor(): ResolvedPos {
    if (!this._$anchor) {
      this._$anchor = resolvePos(this.anchor - 1, this._doc.ast.content as ContentNode[]);
    }
    return this._$anchor;
  }

  get $head(): ResolvedPos {
    if (!this._$head) {
      this._$head = resolvePos(this.head - 1, this._doc.ast.content as ContentNode[]);
    }
    return this._$head;
  }

  get $from(): ResolvedPos {
    return this.anchor <= this.head ? this.$anchor : this.$head;
  }

  get $to(): ResolvedPos {
    return this.anchor <= this.head ? this.$head : this.$anchor;
  }

  abstract map(mapping: Mapping): Selection;

  eq(other: Selection): boolean {
    return this.type === other.type &&
      this.anchor === other.anchor &&
      this.head === other.head;
  }

  content(): Slice {
    return this._doc.slice(this.from, this.to);
  }

  toJSON(): SelectionJSON {
    return {
      type: this.type,
      anchor: this.anchor,
      head: this.head
    };
  }
}

/**
 * Text selection - cursor or text range
 */
export class TextSelectionImpl extends SelectionBase implements TextSelection {
  readonly type = 'text' as const;

  constructor(anchor: Position, head: Position, doc: DocumentImpl) {
    super(anchor, head, doc);
  }

  /**
   * Create text selection at position (cursor)
   */
  static at(pos: Position, doc: DocumentImpl): TextSelectionImpl {
    return new TextSelectionImpl(pos, pos, doc);
  }

  /**
   * Create text selection between positions
   */
  static between(anchor: Position, head: Position, doc: DocumentImpl): TextSelectionImpl {
    return new TextSelectionImpl(anchor, head, doc);
  }

  /**
   * Create selection from resolved positions
   */
  static create(
    doc: DocumentImpl,
    anchor: Position,
    head: Position = anchor
  ): TextSelectionImpl {
    return new TextSelectionImpl(anchor, head, doc);
  }

  map(mapping: Mapping): TextSelectionImpl {
    const anchor = mapping.map(this.anchor);
    const head = mapping.map(this.head);
    return new TextSelectionImpl(anchor, head, this._doc);
  }

  /**
   * Update document reference (for after apply)
   */
  withDoc(doc: DocumentImpl): TextSelectionImpl {
    return new TextSelectionImpl(this.anchor, this.head, doc);
  }
}

/**
 * Node selection - entire node selected
 */
export class NodeSelectionImpl extends SelectionBase implements NodeSelection {
  readonly type = 'node' as const;
  readonly node: ContentNode;

  constructor(pos: Position, doc: DocumentImpl) {
    const node = doc.nodeAt(pos);
    if (!node) {
      throw new RangeError(`No node at position ${pos}`);
    }

    // Calculate end position based on node
    const end = pos + nodeSize(node);

    super(pos, end, doc);
    this.node = node;
  }

  /**
   * Create node selection
   */
  static create(doc: DocumentImpl, pos: Position): NodeSelectionImpl {
    return new NodeSelectionImpl(pos, doc);
  }

  /**
   * Check if node is selectable
   */
  static isSelectable(node: ContentNode): boolean {
    // Most block-level nodes are selectable
    // Support both new (type) and old (nodeType) formats
    const nodeType = node.type || (node as any).nodeType;
    return ['text', 'list', 'table', 'block', 'media', 'compound'].includes(nodeType);
  }

  map(mapping: Mapping): NodeSelectionImpl | TextSelectionImpl {
    const pos = mapping.map(this.anchor);
    const result = mapping.mapResult(this.anchor);

    if (result.deleted) {
      // Node was deleted, return text selection at mapped position
      return TextSelectionImpl.at(pos, this._doc);
    }

    return new NodeSelectionImpl(pos, this._doc);
  }

  /**
   * Update document reference
   */
  withDoc(doc: DocumentImpl): NodeSelectionImpl {
    return new NodeSelectionImpl(this.anchor, doc);
  }
}

/**
 * All selection - entire document selected
 */
export class AllSelectionImpl extends SelectionBase implements AllSelection {
  readonly type = 'all' as const;

  constructor(doc: DocumentImpl) {
    super(0, doc.size, doc);
  }

  /**
   * Create all selection
   */
  static create(doc: DocumentImpl): AllSelectionImpl {
    return new AllSelectionImpl(doc);
  }

  map(_mapping: Mapping): AllSelectionImpl {
    // All selection always covers entire document
    return new AllSelectionImpl(this._doc);
  }

  /**
   * Update document reference
   */
  withDoc(doc: DocumentImpl): AllSelectionImpl {
    return new AllSelectionImpl(doc);
  }
}

/**
 * Create selection from JSON
 */
export function selectionFromJSON(
  json: SelectionJSON,
  doc: DocumentImpl
): Selection {
  switch (json.type) {
    case 'text':
      return TextSelectionImpl.create(doc, json.anchor, json.head);
    case 'node':
      return NodeSelectionImpl.create(doc, json.anchor);
    case 'all':
      return AllSelectionImpl.create(doc);
    default:
      return TextSelectionImpl.at(json.anchor, doc);
  }
}
