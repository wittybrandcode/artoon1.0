// ARTOON HTML Renderer - Inline Content

import {
  InlineContent,
  PlainText,
  InlineComponent,
  Modifier,
  isPlainText,
  isInlineComponent
} from '@artoon/ast';
import { RenderOptions, HTML_MAPPING } from '../types.js';
import { escapeHtml, wrap, selfClose, attr } from '../utils.js';

/**
 * Render inline content array
 * Supports both AST types (array) and parser output ({ text, inlines })
 */
export function renderInlineContent(
  content: readonly InlineContent[] | { text: string; inlines: any[] },
  options: RenderOptions
): string {
  // Support parser output format: { text, inlines }
  if (content && typeof content === 'object' && 'text' in content) {
    const parsed = content as { text: string; inlines: any[] };

    // If no inlines, just return escaped text
    if (!parsed.inlines || parsed.inlines.length === 0) {
      return escapeHtml(parsed.text);
    }

    // Build result by replacing placeholders with rendered inlines
    let text = parsed.text;
    const inlines = parsed.inlines;

    // Sort inlines by index to process in order
    const sortedInlines = [...inlines].sort((a, b) => a.index - b.index);

    // Split text by placeholders and rebuild with rendered inlines
    const parts: string[] = [];
    let lastEnd = 0;

    for (const inline of sortedInlines) {
      const placeholder = `{${inline.index}}`;
      const placeholderIndex = text.indexOf(placeholder, lastEnd);

      if (placeholderIndex !== -1) {
        // Add text before placeholder (escaped)
        if (placeholderIndex > lastEnd) {
          parts.push(escapeHtml(text.substring(lastEnd, placeholderIndex)));
        }
        // Add rendered inline (not escaped - it's already HTML)
        parts.push(renderParserInline(inline, options));
        lastEnd = placeholderIndex + placeholder.length;
      }
    }

    // Add remaining text (escaped)
    if (lastEnd < text.length) {
      parts.push(escapeHtml(text.substring(lastEnd)));
    }

    return parts.join('');
  }

  // Support AST types format: array
  if (Array.isArray(content)) {
    return content.map(item => renderInlineItem(item, options)).join('');
  }

  return '';
}

/**
 * Render parser inline format
 */
function renderParserInline(inline: any, options: RenderOptions): string {
  const { type, modifiers = [], params = {}, componentType, attributes = [] } = inline;

  let html = '';

  // Get the component type
  const compType = type || componentType;

  // Get text from attributes array (parser format) or params
  const text = attributes[0] || params.text || '';

  switch (compType) {
    case 'a':
      const url = params.url || params.path || attributes[0] || '#';
      const linkText = attributes[1] || params.text || url;
      const linkTitle = attributes[2] || params.title;
      const linkAttrs: Record<string, string | undefined> = { href: url };
      if (linkTitle) {
        linkAttrs.title = linkTitle;
      }
      html = wrap('a', escapeHtml(linkText), linkAttrs);
      break;
    case 'img':
      html = selfClose('img', {
        src: params.path || params.src || attributes[0] || '',
        alt: params.alt || attributes[1] || ''
      });
      break;
    case 'c':
      const code = params.code || params.text || attributes[0] || '';
      const lang = params.lang || attributes[1];
      html = wrap('code', escapeHtml(code), lang ? { class: `language-${lang}` } : {});
      break;
    case 'time':
      const datetime = params.datetime || attributes[0] || '';
      const display = params.display || attributes[1] || datetime;
      html = wrap('time', escapeHtml(display), { datetime });
      break;
    case 'abbr':
      const short = params.short || params.abbr || attributes[0] || '';
      const full = params.full || params.title || attributes[1] || '';
      html = wrap('abbr', escapeHtml(short), { title: full });
      break;
    default:
      // Text with modifiers only (no component type)
      html = escapeHtml(text);
  }

  // Apply modifiers
  if (modifiers && modifiers.length > 0) {
    for (const mod of [...modifiers].reverse()) {
      const tag = (HTML_MAPPING.modifier as Record<string, string>)[mod];
      if (tag) {
        html = wrap(tag, html);
      }
    }
  }

  return html;
}

/**
 * Render single inline item
 */
function renderInlineItem(
  item: InlineContent,
  options: RenderOptions
): string {
  if (isPlainText(item)) {
    return renderPlainText(item);
  }

  if (isInlineComponent(item)) {
    return renderInlineComponent(item, options);
  }

  return '';
}

/**
 * Render plain text
 */
function renderPlainText(item: PlainText): string {
  return escapeHtml(item.value);
}

/**
 * Render inline component
 */
function renderInlineComponent(
  item: InlineComponent,
  options: RenderOptions
): string {
  const { component, modifiers, attributes, value } = item;

  // Text with modifiers only (no component type)
  if (!component && modifiers && modifiers.length > 0) {
    return wrapWithModifiers(escapeHtml(value || ''), modifiers);
  }

  // Component rendering
  let html = '';

  switch (component) {
    case 'a':
      html = renderLink(attributes, value);
      break;
    case 'img':
      html = renderImage(attributes);
      break;
    case 'audio':
      html = renderAudio(attributes);
      break;
    case 'video':
      html = renderVideo(attributes);
      break;
    case 'abbr':
      html = renderAbbr(attributes);
      break;
    case 'time':
      html = renderTime(attributes);
      break;
    case 'c':
      html = renderCode(attributes);
      break;
    default:
      // Plain text with modifiers
      html = escapeHtml(value || attributes.text || '');
  }

  // Apply modifiers if present
  if (modifiers && modifiers.length > 0) {
    html = wrapWithModifiers(html, modifiers);
  }

  return html;
}

/**
 * Wrap content with modifier tags
 */
function wrapWithModifiers(content: string, modifiers: readonly Modifier[]): string {
  let result = content;

  // Apply modifiers from inside out
  const reversedMods = [...modifiers].reverse();
  for (const mod of reversedMods) {
    const tag = HTML_MAPPING.modifier[mod as keyof typeof HTML_MAPPING.modifier];
    if (tag) {
      result = wrap(tag, result);
    }
  }

  return result;
}

/**
 * Render link
 */
function renderLink(
  attributes: Record<string, string>,
  value?: string
): string {
  const url = attributes.href || attributes.url || attributes.path || '#';
  const text = attributes.text || value || url;
  const title = attributes.title;

  const attrs: Record<string, string | undefined> = { href: url };
  if (title) {
    attrs.title = title;
  }

  return wrap('a', escapeHtml(text), attrs);
}

/**
 * Render image
 */
function renderImage(attributes: Record<string, string>): string {
  const src = attributes.path || attributes.src || '';
  const alt = attributes.alt || '';
  const title = attributes.title;

  return selfClose('img', { src, alt, title });
}

/**
 * Render audio
 */
function renderAudio(attributes: Record<string, string>): string {
  const src = attributes.path || attributes.src || '';
  const title = attributes.title;

  return wrap('audio', '', {
    src,
    controls: 'controls',
    title
  });
}

/**
 * Render video
 */
function renderVideo(attributes: Record<string, string>): string {
  const src = attributes.path || attributes.src || '';
  const title = attributes.title;

  return wrap('video', '', {
    src,
    controls: 'controls',
    title
  });
}

/**
 * Render abbreviation
 */
function renderAbbr(attributes: Record<string, string>): string {
  const short = attributes.short || '';
  const full = attributes.full || '';

  return wrap('abbr', escapeHtml(short), { title: full });
}

/**
 * Render time
 */
function renderTime(attributes: Record<string, string>): string {
  const datetime = attributes.datetime || '';
  const display = attributes.display || datetime;

  return wrap('time', escapeHtml(display), { datetime });
}

/**
 * Render inline code
 */
function renderCode(attributes: Record<string, string>): string {
  const code = attributes.code || '';
  const lang = attributes.lang;

  const attrs: Record<string, string | undefined> = {};
  if (lang) {
    attrs['class'] = `language-${lang}`;
  }

  return wrap('code', escapeHtml(code), attrs);
}
