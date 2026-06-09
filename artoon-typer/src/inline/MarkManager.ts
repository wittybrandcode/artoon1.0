/**
 * MarkManager
 * 
 * Manages inline formatting marks (bold, italic, etc.)
 * Handles applying, removing, and toggling marks on InlineContent.
 */

import type {
  InlineContent,
  PlainText,
  InlineComponent,
  Modifier,
} from '@artoon/ast';
import type { MarkType } from '../types';
import { MARK_TO_MODIFIER, MODIFIER_TO_MARK } from '../types';

/**
 * Flattened character with its modifiers
 * Exported for use with flattenContent/rebuildContent API
 */
export interface FlatChar {
  char: string;
  modifiers: Modifier[];
  component?: InlineComponent;
}

/**
 * MarkManager - handles inline formatting
 */
export class MarkManager {

  /**
   * Apply a mark to a range
   */
  applyMark(
    content: readonly InlineContent[],
    from: number,
    to: number,
    mark: MarkType
  ): readonly InlineContent[] {
    const modifier = MARK_TO_MODIFIER[mark];
    if (!modifier) return content;

    const flat = this.flatten(content);
    const result = this.applyModifierToFlat(flat, from, to, modifier);
    return this.rebuild(result);
  }

  /**
   * Remove a mark from a range
   */
  removeMark(
    content: readonly InlineContent[],
    from: number,
    to: number,
    mark: MarkType
  ): readonly InlineContent[] {
    const modifier = MARK_TO_MODIFIER[mark];
    if (!modifier) return content;

    const flat = this.flatten(content);
    const result = this.removeModifierFromFlat(flat, from, to, modifier);
    return this.rebuild(result);
  }

  /**
   * Toggle a mark (apply if not present, remove if present)
   */
  toggleMark(
    content: readonly InlineContent[],
    from: number,
    to: number,
    mark: MarkType
  ): readonly InlineContent[] {
    if (this.hasMarkInRange(content, from, to, mark)) {
      return this.removeMark(content, from, to, mark);
    } else {
      return this.applyMark(content, from, to, mark);
    }
  }

  /**
   * Check if a mark is present in the entire range
   */
  hasMarkInRange(
    content: readonly InlineContent[],
    from: number,
    to: number,
    mark: MarkType
  ): boolean {
    const modifier = MARK_TO_MODIFIER[mark];
    if (!modifier) return false;

    const flat = this.flatten(content);

    // Check if all characters in range have the modifier
    for (let i = from; i < to && i < flat.length; i++) {
      const char = flat[i];
      if (!char.modifiers.includes(modifier)) {
        return false;
      }
    }

    return from < to && from < flat.length;
  }

  /**
   * Check if a mark is present anywhere in the range
   */
  hasMarkAnywhere(
    content: readonly InlineContent[],
    from: number,
    to: number,
    mark: MarkType
  ): boolean {
    const modifier = MARK_TO_MODIFIER[mark];
    if (!modifier) return false;

    const flat = this.flatten(content);

    for (let i = from; i < to && i < flat.length; i++) {
      if (flat[i].modifiers.includes(modifier)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get active marks at a position
   */
  getActiveMarks(content: readonly InlineContent[], position: number): MarkType[] {
    const flat = this.flatten(content);

    if (position < 0 || position >= flat.length) {
      return [];
    }

    const modifiers = flat[position].modifiers;
    return modifiers
      .map(mod => MODIFIER_TO_MARK[mod])
      .filter((mark): mark is MarkType => mark !== undefined);
  }

  /**
   * Get all marks in a range
   */
  getMarksInRange(
    content: readonly InlineContent[],
    from: number,
    to: number
  ): MarkType[] {
    const flat = this.flatten(content);
    const allModifiers = new Set<Modifier>();

    for (let i = from; i < to && i < flat.length; i++) {
      for (const mod of flat[i].modifiers) {
        allModifiers.add(mod);
      }
    }

    return Array.from(allModifiers)
      .map(mod => MODIFIER_TO_MARK[mod])
      .filter((mark): mark is MarkType => mark !== undefined);
  }

  /**
   * Get total text length
   */
  getLength(content: readonly InlineContent[]): number {
    return this.flatten(content).length;
  }

  /**
   * Get plain text content
   */
  getPlainText(content: readonly InlineContent[]): string {
    return content.map(item => {
      if (item.type === 'plain') {
        return item.value;
      }
      return (item as InlineComponent).value || '';
    }).join('');
  }

  /**
   * Flatten content to character array (PUBLIC API)
   * Converts InlineContent[] to FlatChar[] for manipulation
   */
  flattenContent(content: readonly InlineContent[]): FlatChar[] {
    return this.flatten(content);
  }

  /**
   * Rebuild content from character array (PUBLIC API)
   * Converts FlatChar[] back to InlineContent[]
   */
  rebuildContent(flat: FlatChar[]): readonly InlineContent[] {
    return this.rebuild(flat);
  }

  /**
   * Insert text at position
   */
  insertText(
    content: readonly InlineContent[],
    position: number,
    text: string,
    inheritMarks: boolean = true
  ): readonly InlineContent[] {
    if (!text) return content;

    const flat = this.flatten(content);

    // Get modifiers to inherit
    let modifiers: Modifier[] = [];
    if (inheritMarks && position > 0 && position <= flat.length) {
      modifiers = [...flat[Math.min(position - 1, flat.length - 1)].modifiers];
    }

    // Insert new characters
    const newChars: FlatChar[] = text.split('').map(char => ({
      char,
      modifiers: [...modifiers],
    }));

    flat.splice(position, 0, ...newChars);

    return this.rebuild(flat);
  }

  /**
   * Delete text in range
   */
  deleteRange(
    content: readonly InlineContent[],
    from: number,
    to: number
  ): readonly InlineContent[] {
    const flat = this.flatten(content);
    flat.splice(from, to - from);
    return this.rebuild(flat);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Private Methods
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Flatten InlineContent[] to FlatChar[]
   */
  private flatten(content: readonly InlineContent[]): FlatChar[] {
    const result: FlatChar[] = [];

    for (const item of content) {
      if (item.type === 'plain') {
        for (const char of item.value) {
          result.push({ char, modifiers: [] });
        }
      } else {
        const inline = item as InlineComponent;
        const text = inline.value || '';
        const modifiers = inline.modifiers || [];

        if (inline.component) {
          // Components are treated as single unit
          result.push({
            char: '\uFFFC', // Object replacement character
            modifiers: [...modifiers],
            component: inline,
          });
        } else {
          // Text with modifiers
          for (const char of text) {
            result.push({ char, modifiers: [...modifiers] });
          }
        }
      }
    }

    return result;
  }

  /**
   * Rebuild InlineContent[] from FlatChar[]
   */
  private rebuild(flat: FlatChar[]): readonly InlineContent[] {
    if (flat.length === 0) return [];

    const result: InlineContent[] = [];
    let current: FlatChar[] = [];
    let currentModifiers: string = '';

    const flush = () => {
      if (current.length === 0) return;

      // Check if it's a component
      if (current.length === 1 && current[0].component) {
        result.push(current[0].component);
      } else {
        const text = current.map(c => c.char).join('');
        const mods = current[0].modifiers;

        if (mods.length === 0) {
          result.push({ type: 'plain', value: text });
        } else {
          result.push({
            type: 'inline',
            modifiers: mods,
            attributes: {},
            value: text,
          });
        }
      }

      current = [];
    };

    for (const char of flat) {
      const modsKey = char.modifiers.sort().join(',');
      const isComponent = !!char.component;

      if (isComponent) {
        flush();
        current = [char];
        flush();
      } else if (modsKey !== currentModifiers) {
        flush();
        current = [char];
        currentModifiers = modsKey;
      } else {
        current.push(char);
      }
    }

    flush();

    return result;
  }

  /**
   * Apply modifier to flat characters in range
   */
  private applyModifierToFlat(
    flat: FlatChar[],
    from: number,
    to: number,
    modifier: Modifier
  ): FlatChar[] {
    for (let i = from; i < to && i < flat.length; i++) {
      if (!flat[i].modifiers.includes(modifier)) {
        flat[i].modifiers.push(modifier);
      }
    }
    return flat;
  }

  /**
   * Remove modifier from flat characters in range
   */
  private removeModifierFromFlat(
    flat: FlatChar[],
    from: number,
    to: number,
    modifier: Modifier
  ): FlatChar[] {
    for (let i = from; i < to && i < flat.length; i++) {
      const idx = flat[i].modifiers.indexOf(modifier);
      if (idx !== -1) {
        flat[i].modifiers.splice(idx, 1);
      }
    }
    return flat;
  }
}

/**
 * Create a new MarkManager instance
 */
export function createMarkManager(): MarkManager {
  return new MarkManager();
}
