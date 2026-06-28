import { sanitizeUrl, escapeHtml } from "../core/utils";
/**
 * InlineRenderer
 * 
 * Renders InlineContent[] to HTML for display in the editor.
 */

import type {
  InlineContent,
  PlainText,
  InlineComponent,
  Modifier,
} from '@artoon/ast';

/**
 * Render options
 */
export interface RenderOptions {
  /** Escape HTML entities */
  escapeHtml?: boolean;
  /** Add data attributes for editing */
  addDataAttributes?: boolean;
  /** Custom class prefix */
  classPrefix?: string;
}

const DEFAULT_OPTIONS: RenderOptions = {
  escapeHtml: true,
  addDataAttributes: false,
  classPrefix: 'artoon-',
};

/**
 * InlineRenderer - converts InlineContent to HTML
 */
export class InlineRenderer {
  private options: RenderOptions;

  constructor(options: RenderOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Render InlineContent[] to HTML string
   */
  render(content: readonly InlineContent[] | undefined): string {
    if (!content || content.length === 0) {
      return '';
    }

    return content.map(item => this.renderItem(item)).join('');
  }

  /**
   * Render a single InlineContent item
   */
  private renderItem(item: InlineContent): string {
    if (item.type === 'plain') {
      return this.renderPlainText(item as PlainText);
    }

    const inline = item as InlineComponent;

    if (inline.component) {
      return this.renderComponent(inline);
    }

    if (inline.modifiers && inline.modifiers.length > 0) {
      return this.renderWithModifiers(inline);
    }

    // Fallback: just render the value
    return this.escape(inline.value || '');
  }

  /**
   * Render plain text
   */
  private renderPlainText(item: PlainText): string {
    return this.escape(item.value);
  }

  /**
   * Render inline component (link, code, image, etc.)
   */
  private renderComponent(item: InlineComponent): string {
    const { component, attributes, value, modifiers } = item;

    let html = '';

    switch (component) {
      case 'a':
        html = this.renderLink(attributes, value);
        break;

      case 'c':
        html = this.renderCode(attributes, value);
        break;

      case 'img':
        html = this.renderImage(attributes);
        break;

      case 'video':
        html = this.renderVideo(attributes);
        break;

      case 'audio':
        html = this.renderAudio(attributes);
        break;

      case 'time':
        html = this.renderTime(attributes);
        break;

      case 'abbr':
        html = this.renderAbbr(attributes);
        break;

      case 'file':
        html = this.renderFile(attributes);
        break;

      default:
        html = this.escape(value || '');
    }

    // Apply modifiers if any
    if (modifiers && modifiers.length > 0) {
      html = this.wrapWithModifiers(html, modifiers);
    }

    return html;
  }

  /**
   * Render text with modifiers (bold, italic, etc.)
   */
  private renderWithModifiers(item: InlineComponent): string {
    const text = this.escape(item.value || '');
    return this.wrapWithModifiers(text, item.modifiers || []);
  }

  /**
   * Wrap content with modifier tags
   */
  private wrapWithModifiers(html: string, modifiers: readonly Modifier[]): string {
    // Apply modifiers from inside out
    for (const mod of [...modifiers].reverse()) {
      html = this.wrapWithModifier(html, mod);
    }
    return html;
  }

  /**
   * Wrap content with a single modifier tag
   */
  private wrapWithModifier(html: string, modifier: Modifier): string {
    const tagMap: Record<Modifier, string> = {
      's': 'strong',
      'e': 'em',
      'u': 'u',
      'd': 'del',
      'mark': 'mark',
      'sub': 'sub',
      'sup': 'sup',
    };

    const tag = tagMap[modifier];
    if (!tag) return html;

    const className = this.options.addDataAttributes
      ? ` class="${this.options.classPrefix}${modifier}"`
      : '';

    return `<${tag}${className}>${html}</${tag}>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Component Renderers
  // ═══════════════════════════════════════════════════════════════════════════

  private renderLink(attrs: Record<string, string>, value?: string): string {
    const url = sanitizeUrl(attrs.url || attrs.href || '');
    const text = value || attrs.text || url;
    const title = attrs.title ? ` title="${this.escapeAttr(attrs.title)}"` : '';

    return `<a href="${url}"${title}>${this.escape(text)}</a>`;
  }

  private renderCode(attrs: Record<string, string>, value?: string): string {
    const code = value || attrs.code || '';
    const lang = attrs.lang || attrs.language;
    const langClass = lang ? ` class="language-${this.escapeAttr(lang)}"` : '';

    return `<code${langClass}>${this.escape(code)}</code>`;
  }

  private renderImage(attrs: Record<string, string>): string {
    const src = sanitizeUrl(attrs.src || attrs.path || '');
    const alt = this.escapeAttr(attrs.alt || '');
    const title = attrs.title ? ` title="${this.escapeAttr(attrs.title)}"` : '';
    const width = attrs.width ? ` width="${this.escapeAttr(attrs.width)}"` : '';
    const height = attrs.height ? ` height="${this.escapeAttr(attrs.height)}"` : '';

    return `<img src="${src}" alt="${alt}"${title}${width}${height} />`;
  }

  private renderVideo(attrs: Record<string, string>): string {
    const src = sanitizeUrl(attrs.src || '');
    const controls = ' controls';
    const width = attrs.width ? ` width="${this.escapeAttr(attrs.width)}"` : '';
    const height = attrs.height ? ` height="${this.escapeAttr(attrs.height)}"` : '';

    return `<video src="${src}"${controls}${width}${height}></video>`;
  }

  private renderAudio(attrs: Record<string, string>): string {
    const src = sanitizeUrl(attrs.src || '');
    const controls = ' controls';

    return `<audio src="${src}"${controls}></audio>`;
  }

  private renderTime(attrs: Record<string, string>): string {
    const datetime = this.escapeAttr(attrs.datetime || '');
    const display = attrs.display || attrs.value || datetime;

    return `<time datetime="${datetime}">${this.escape(display)}</time>`;
  }

  private renderAbbr(attrs: Record<string, string>): string {
    const short = attrs.short || attrs.value || '';
    const full = this.escapeAttr(attrs.full || attrs.title || '');

    return `<abbr title="${full}">${this.escape(short)}</abbr>`;
  }

  private renderFile(attrs: Record<string, string>): string {
    const src = sanitizeUrl(attrs.src || '');
    const label = attrs.label || attrs.name || 'Download';

    return `<a href="${src}" download>${this.escape(label)}</a>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Utilities
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Escape HTML entities in text
   */
  private escape(text: string): string {
    if (!this.options.escapeHtml) return text;

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Escape HTML attribute value
   */
  private escapeAttr(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

/**
 * Create a new InlineRenderer instance
 */
export function createInlineRenderer(options?: RenderOptions): InlineRenderer {
  return new InlineRenderer(options);
}

/**
 * Render InlineContent[] to HTML (convenience function)
 */
export function renderInlineContent(
  content: readonly InlineContent[] | undefined,
  options?: RenderOptions
): string {
  return new InlineRenderer(options).render(content);
}
