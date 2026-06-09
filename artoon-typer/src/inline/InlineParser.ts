/**
 * InlineParser
 * 
 * Parses HTML to InlineContent[] for the editor.
 * Used when converting DOM content back to ARTOON format.
 */

import type {
  InlineContent,
  PlainText,
  InlineComponent,
  Modifier,
} from '@artoon/ast';

/**
 * Parser options
 */
export interface ParseOptions {
  /** Normalize whitespace */
  normalizeWhitespace?: boolean;
  /** Merge adjacent items with same formatting */
  mergeAdjacent?: boolean;
}

const DEFAULT_OPTIONS: ParseOptions = {
  normalizeWhitespace: false,
  mergeAdjacent: true,
};

/**
 * Map HTML tags to ARTOON modifiers
 */
const TAG_TO_MODIFIER: Record<string, Modifier> = {
  'STRONG': 's',
  'B': 's',
  'EM': 'e',
  'I': 'e',
  'U': 'u',
  'DEL': 'd',
  'S': 'd',
  'STRIKE': 'd',
  'MARK': 'mark',
  'SUB': 'sub',
  'SUP': 'sup',
};

/**
 * InlineParser - converts HTML to InlineContent[]
 */
export class InlineParser {
  private options: ParseOptions;

  constructor(options: ParseOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Parse HTML string to InlineContent[]
   */
  parse(html: string): readonly InlineContent[] {
    if (!html || html.trim() === '') {
      return [];
    }

    // Create a temporary container
    const container = this.createContainer(html);

    // Walk the DOM and collect content
    const result: InlineContent[] = [];
    this.walkNodes(container, result, []);

    // Normalize if needed
    if (this.options.mergeAdjacent) {
      return this.normalize(result);
    }

    return result;
  }

  /**
   * Parse from DOM element
   */
  parseElement(element: Element): readonly InlineContent[] {
    const result: InlineContent[] = [];
    this.walkNodes(element, result, []);

    if (this.options.mergeAdjacent) {
      return this.normalize(result);
    }

    return result;
  }

  /**
   * Create container element from HTML string
   */
  private createContainer(html: string): Element {
    // Use DOMParser if available (browser)
    if (typeof DOMParser !== 'undefined') {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body;
    }

    // Fallback for Node.js (testing)
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
  }

  /**
   * Walk DOM nodes recursively
   */
  private walkNodes(
    node: Node,
    result: InlineContent[],
    activeModifiers: Modifier[]
  ): void {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];

      if (child.nodeType === Node.TEXT_NODE) {
        this.handleTextNode(child, result, activeModifiers);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        this.handleElementNode(child as Element, result, activeModifiers);
      }
    }
  }

  /**
   * Handle text node
   */
  private handleTextNode(
    node: Node,
    result: InlineContent[],
    activeModifiers: Modifier[]
  ): void {
    let text = node.textContent || '';

    if (this.options.normalizeWhitespace) {
      text = text.replace(/\s+/g, ' ');
    }

    if (!text) return;

    if (activeModifiers.length > 0) {
      result.push({
        type: 'inline',
        modifiers: [...activeModifiers],
        attributes: {},
        value: text,
      } as InlineComponent);
    } else {
      result.push({ type: 'plain', value: text } as PlainText);
    }
  }

  /**
   * Handle element node
   */
  private handleElementNode(
    element: Element,
    result: InlineContent[],
    activeModifiers: Modifier[]
  ): void {
    const tagName = element.tagName.toUpperCase();

    // Check if it's a modifier tag
    const modifier = TAG_TO_MODIFIER[tagName];
    if (modifier) {
      this.walkNodes(element, result, [...activeModifiers, modifier]);
      return;
    }

    // Handle special elements
    switch (tagName) {
      case 'A':
        this.handleLink(element, result, activeModifiers);
        break;

      case 'CODE':
        this.handleCode(element, result, activeModifiers);
        break;

      case 'IMG':
        this.handleImage(element, result);
        break;

      case 'VIDEO':
        this.handleVideo(element, result);
        break;

      case 'AUDIO':
        this.handleAudio(element, result);
        break;

      case 'TIME':
        this.handleTime(element, result);
        break;

      case 'ABBR':
        this.handleAbbr(element, result);
        break;

      case 'BR':
        result.push({ type: 'plain', value: '\n' } as PlainText);
        break;

      case 'SPAN':
      case 'DIV':
      case 'P':
        // Pass through container elements
        this.walkNodes(element, result, activeModifiers);
        break;

      default:
        // Unknown element - just get text content
        this.walkNodes(element, result, activeModifiers);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Component Handlers
  // ═══════════════════════════════════════════════════════════════════════════

  private handleLink(
    element: Element,
    result: InlineContent[],
    activeModifiers: Modifier[]
  ): void {
    const url = element.getAttribute('href') || '';
    const text = element.textContent || '';
    const title = element.getAttribute('title') || undefined;

    const attributes: Record<string, string> = { url };
    if (text && text !== url) attributes.text = text;
    if (title) attributes.title = title;

    const item: any = {
      type: 'inline',
      component: 'a',
      attributes,
    };

    // Apply active modifiers to link
    if (activeModifiers.length > 0) {
      item.modifiers = [...activeModifiers];
    }

    result.push(item as InlineComponent);
  }

  private handleCode(
    element: Element,
    result: InlineContent[],
    activeModifiers: Modifier[]
  ): void {
    const code = element.textContent || '';
    const className = element.getAttribute('class') || '';

    const attributes: Record<string, string> = { code };

    // Extract language from class
    const langMatch = className.match(/language-(\w+)/);
    if (langMatch) {
      attributes.lang = langMatch[1];
    }

    const item: any = {
      type: 'inline',
      component: 'c',
      attributes,
    };

    // Apply active modifiers
    if (activeModifiers.length > 0) {
      item.modifiers = [...activeModifiers];
    }

    result.push(item as InlineComponent);
  }

  private handleImage(element: Element, result: InlineContent[]): void {
    const src = element.getAttribute('src') || '';
    const alt = element.getAttribute('alt') || '';
    const title = element.getAttribute('title') || undefined;
    const width = element.getAttribute('width') || undefined;
    const height = element.getAttribute('height') || undefined;

    const attributes: Record<string, string> = { src, alt };
    if (title) attributes.title = title;
    if (width) attributes.width = width;
    if (height) attributes.height = height;

    const item: any = {
      type: 'inline',
      component: 'img',
      attributes,
    };

    result.push(item as InlineComponent);
  }

  private handleVideo(element: Element, result: InlineContent[]): void {
    const src = element.getAttribute('src') || '';
    const width = element.getAttribute('width') || undefined;
    const height = element.getAttribute('height') || undefined;

    const attributes: Record<string, string> = { src };
    if (width) attributes.width = width;
    if (height) attributes.height = height;

    const item: any = {
      type: 'inline',
      component: 'video',
      attributes,
    };

    result.push(item as InlineComponent);
  }

  private handleAudio(element: Element, result: InlineContent[]): void {
    const src = element.getAttribute('src') || '';

    result.push({
      type: 'inline',
      component: 'audio',
      attributes: { src },
    } as InlineComponent);
  }

  private handleTime(element: Element, result: InlineContent[]): void {
    const datetime = element.getAttribute('datetime') || '';
    const display = element.textContent || datetime;

    result.push({
      type: 'inline',
      component: 'time',
      attributes: { datetime, display },
    } as InlineComponent);
  }

  private handleAbbr(element: Element, result: InlineContent[]): void {
    const short = element.textContent || '';
    const full = element.getAttribute('title') || '';

    result.push({
      type: 'inline',
      component: 'abbr',
      attributes: { short, full },
    } as InlineComponent);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Normalization
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Normalize content by merging adjacent items with same formatting
   */
  private normalize(content: InlineContent[] | readonly InlineContent[]): InlineContent[] {
    if (content.length === 0) return [];

    const result: InlineContent[] = [];

    for (const item of content) {
      const last = result[result.length - 1];

      if (last && this.canMerge(last, item)) {
        this.merge(last, item);
      } else {
        result.push(this.clone(item));
      }
    }

    // Remove empty items
    return result.filter(item => {
      if (item.type === 'plain') {
        return (item as PlainText).value !== '';
      }
      if (item.type === 'inline') {
        const inline = item as InlineComponent;
        return inline.component || (inline.value && inline.value !== '');
      }
      return true;
    });
  }

  /**
   * Check if two items can be merged
   */
  private canMerge(a: InlineContent, b: InlineContent): boolean {
    if (a.type !== b.type) return false;

    if (a.type === 'plain' && b.type === 'plain') {
      return true;
    }

    if (a.type === 'inline' && b.type === 'inline') {
      const aInline = a as InlineComponent;
      const bInline = b as InlineComponent;

      // Can't merge components
      if (aInline.component || bInline.component) return false;

      // Check if modifiers match
      const aModifiers = aInline.modifiers || [];
      const bModifiers = bInline.modifiers || [];

      if (aModifiers.length !== bModifiers.length) return false;

      return aModifiers.every((m, i) => m === bModifiers[i]);
    }

    return false;
  }

  /**
   * Merge item b into item a
   */
  private merge(a: InlineContent, b: InlineContent): void {
    if (a.type === 'plain' && b.type === 'plain') {
      (a as any).value += (b as PlainText).value;
    } else if (a.type === 'inline' && b.type === 'inline') {
      const aInline = a as any;
      const bInline = b as InlineComponent;
      aInline.value = (aInline.value || '') + (bInline.value || '');
    }
  }

  /**
   * Clone an InlineContent item
   */
  private clone(item: InlineContent): InlineContent {
    if (item.type === 'plain') {
      return { type: 'plain', value: (item as PlainText).value };
    }

    const inline = item as InlineComponent;
    const cloned: any = {
      type: 'inline',
      attributes: { ...inline.attributes },
    };

    if (inline.component) cloned.component = inline.component;
    if (inline.modifiers) cloned.modifiers = [...inline.modifiers];
    if (inline.value !== undefined) cloned.value = inline.value;

    return cloned as InlineComponent;
  }
}

/**
 * Create a new InlineParser instance
 */
export function createInlineParser(options?: ParseOptions): InlineParser {
  return new InlineParser(options);
}

/**
 * Parse HTML to InlineContent[] (convenience function)
 */
export function parseHtmlToInline(
  html: string,
  options?: ParseOptions
): readonly InlineContent[] {
  return new InlineParser(options).parse(html);
}
