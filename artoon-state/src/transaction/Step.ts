/**
 * Step - Atomic document changes
 */

import type { ContentNode, Modifier } from '@artoon/ast';
import type { Step, StepResult, StepJSON, Position, Mapping } from '../types';
import { DocumentImpl } from '../state/Document';
import { SliceImpl } from '../state/Slice';
import { FragmentImpl } from '../state/Fragment';
import { MappingImpl } from './Mapping';

/**
 * Base step class
 */
export abstract class StepBase implements Step {
  abstract readonly type: string;
  
  abstract apply(doc: DocumentImpl): StepResult;
  abstract invert(doc: DocumentImpl): Step;
  abstract map(mapping: Mapping): Step | null;
  abstract toJSON(): StepJSON;
  
  merge(_other: Step): Step | null {
    return null;
  }
}

/**
 * Replace step - replaces content in a range
 */
export class ReplaceStep extends StepBase {
  readonly type = 'replace';
  readonly from: Position;
  readonly to: Position;
  readonly slice: SliceImpl;

  constructor(from: Position, to: Position, slice: SliceImpl) {
    super();
    this.from = from;
    this.to = to;
    this.slice = slice;
  }

  apply(doc: DocumentImpl): StepResult {
    try {
      const newDoc = doc.replace(this.from, this.to, this.slice);
      return { doc: newDoc, failed: null };
    } catch (e) {
      return { doc: null, failed: (e as Error).message };
    }
  }

  invert(doc: DocumentImpl): ReplaceStep {
    // Get the content that will be replaced
    const replaced = doc.slice(this.from, this.to);
    return new ReplaceStep(this.from, this.from + this.slice.size, replaced);
  }

  map(mapping: Mapping): ReplaceStep | null {
    const from = mapping.map(this.from, 1);
    const to = mapping.map(this.to, -1);
    
    if (from > to) {
      return null; // Range collapsed
    }
    
    return new ReplaceStep(from, to, this.slice);
  }

  merge(other: Step): Step | null {
    if (!(other instanceof ReplaceStep)) return null;
    
    // Can merge if other starts where this ends
    if (other.from === this.from + this.slice.size && this.to === this.from) {
      // Consecutive insertions
      const combined = this.slice.content.append(other.slice.content);
      return new ReplaceStep(
        this.from,
        this.from,
        new SliceImpl(combined, this.slice.openStart, other.slice.openEnd)
      );
    }
    
    return null;
  }

  toJSON(): StepJSON {
    return {
      type: 'replace',
      from: this.from,
      to: this.to,
      slice: this.slice.toJSON()
    };
  }

  static fromJSON(json: any): ReplaceStep {
    return new ReplaceStep(
      json.from,
      json.to,
      SliceImpl.fromJSON(json.slice)
    );
  }
}

/**
 * Add mark step - adds formatting to a range
 */
export class AddMarkStep extends StepBase {
  readonly type = 'addMark';
  readonly from: Position;
  readonly to: Position;
  readonly mark: Modifier;

  constructor(from: Position, to: Position, mark: Modifier) {
    super();
    this.from = from;
    this.to = to;
    this.mark = mark;
  }

  apply(doc: DocumentImpl): StepResult {
    // Mark application requires modifying inline content
    // This is a simplified implementation
    try {
      // For now, return doc unchanged - full implementation needs inline content modification
      return { doc, failed: null };
    } catch (e) {
      return { doc: null, failed: (e as Error).message };
    }
  }

  invert(_doc: DocumentImpl): RemoveMarkStep {
    return new RemoveMarkStep(this.from, this.to, this.mark);
  }

  map(mapping: Mapping): AddMarkStep | null {
    const from = mapping.map(this.from, 1);
    const to = mapping.map(this.to, -1);
    
    if (from >= to) return null;
    
    return new AddMarkStep(from, to, this.mark);
  }

  toJSON(): StepJSON {
    return {
      type: 'addMark',
      from: this.from,
      to: this.to,
      mark: this.mark
    };
  }

  static fromJSON(json: any): AddMarkStep {
    return new AddMarkStep(json.from, json.to, json.mark);
  }
}

/**
 * Remove mark step - removes formatting from a range
 */
export class RemoveMarkStep extends StepBase {
  readonly type = 'removeMark';
  readonly from: Position;
  readonly to: Position;
  readonly mark: Modifier;

  constructor(from: Position, to: Position, mark: Modifier) {
    super();
    this.from = from;
    this.to = to;
    this.mark = mark;
  }

  apply(doc: DocumentImpl): StepResult {
    try {
      return { doc, failed: null };
    } catch (e) {
      return { doc: null, failed: (e as Error).message };
    }
  }

  invert(_doc: DocumentImpl): AddMarkStep {
    return new AddMarkStep(this.from, this.to, this.mark);
  }

  map(mapping: Mapping): RemoveMarkStep | null {
    const from = mapping.map(this.from, 1);
    const to = mapping.map(this.to, -1);
    
    if (from >= to) return null;
    
    return new RemoveMarkStep(from, to, this.mark);
  }

  toJSON(): StepJSON {
    return {
      type: 'removeMark',
      from: this.from,
      to: this.to,
      mark: this.mark
    };
  }

  static fromJSON(json: any): RemoveMarkStep {
    return new RemoveMarkStep(json.from, json.to, json.mark);
  }
}

/**
 * Set node attributes step
 */
export class SetAttrsStep extends StepBase {
  readonly type = 'setAttrs';
  readonly pos: Position;
  readonly attrs: Record<string, unknown>;
  private oldAttrs: Record<string, unknown> | null = null;

  constructor(pos: Position, attrs: Record<string, unknown>) {
    super();
    this.pos = pos;
    this.attrs = attrs;
  }

  apply(doc: DocumentImpl): StepResult {
    try {
      const node = doc.nodeAt(this.pos);
      if (!node) {
        return { doc: null, failed: `No node at position ${this.pos}` };
      }
      
      // Store old attrs for invert
      this.oldAttrs = { ...(node as any) };
      
      // Create new node with updated attrs
      const newNode = { ...node, ...this.attrs } as ContentNode;
      const newDoc = doc.replaceWith(this.pos, this.pos + 1, newNode);
      
      return { doc: newDoc, failed: null };
    } catch (e) {
      return { doc: null, failed: (e as Error).message };
    }
  }

  invert(_doc: DocumentImpl): SetAttrsStep {
    return new SetAttrsStep(this.pos, this.oldAttrs || {});
  }

  map(mapping: Mapping): SetAttrsStep | null {
    const result = mapping.mapResult(this.pos);
    if (result.deleted) return null;
    return new SetAttrsStep(result.pos, this.attrs);
  }

  toJSON(): StepJSON {
    return {
      type: 'setAttrs',
      pos: this.pos,
      attrs: this.attrs
    };
  }

  static fromJSON(json: any): SetAttrsStep {
    return new SetAttrsStep(json.pos, json.attrs);
  }
}

/**
 * Create step from JSON
 */
export function stepFromJSON(json: StepJSON): Step {
  switch (json.type) {
    case 'replace':
      return ReplaceStep.fromJSON(json);
    case 'addMark':
      return AddMarkStep.fromJSON(json);
    case 'removeMark':
      return RemoveMarkStep.fromJSON(json);
    case 'setAttrs':
      return SetAttrsStep.fromJSON(json);
    default:
      throw new Error(`Unknown step type: ${json.type}`);
  }
}
