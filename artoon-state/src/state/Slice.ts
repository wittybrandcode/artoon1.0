/**
 * Slice - A piece of document content with open depths
 */

import type { Slice } from '../types';
import { FragmentImpl } from './Fragment';

/**
 * Slice implementation
 */
export class SliceImpl implements Slice {
  readonly content: FragmentImpl;
  readonly openStart: number;
  readonly openEnd: number;

  constructor(
    content: FragmentImpl,
    openStart: number = 0,
    openEnd: number = 0
  ) {
    this.content = content;
    this.openStart = openStart;
    this.openEnd = openEnd;
  }

  /**
   * Total size of the slice
   */
  get size(): number {
    return this.content.size - this.openStart - this.openEnd;
  }

  /**
   * Empty slice singleton
   */
  static readonly empty = new SliceImpl(FragmentImpl.empty, 0, 0);

  /**
   * Create slice from content
   */
  static from(content: FragmentImpl | null): SliceImpl {
    if (!content || content.childCount === 0) {
      return SliceImpl.empty;
    }
    return new SliceImpl(content, 0, 0);
  }

  /**
   * Check if slice is empty
   */
  get isEmpty(): boolean {
    return this.content.childCount === 0;
  }

  /**
   * Check equality
   */
  eq(other: SliceImpl): boolean {
    return (
      this.content.eq(other.content) &&
      this.openStart === other.openStart &&
      this.openEnd === other.openEnd
    );
  }

  toJSON(): { content: any[]; openStart: number; openEnd: number } {
    return {
      content: this.content.toJSON(),
      openStart: this.openStart,
      openEnd: this.openEnd
    };
  }

  /**
   * Create slice from JSON
   */
  static fromJSON(json: { content: any[]; openStart: number; openEnd: number }): SliceImpl {
    return new SliceImpl(
      FragmentImpl.from(json.content),
      json.openStart,
      json.openEnd
    );
  }
}
