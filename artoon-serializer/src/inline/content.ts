// ARTOON Serializer - Inline Content

import { InlineContent, PlainText, InlineComponent, Modifier } from '@artoon/ast';

/**
 * Serialize inline content array to string
 */
export function serializeInlineContent(content: readonly InlineContent[]): string {
  return content.map(serializeInlineItem).join('');
}

/**
 * Serialize single inline item
 */
function serializeInlineItem(item: InlineContent): string {
  if (item.type === 'plain') {
    return (item as PlainText).value;
  }

  return serializeInlineComponent(item as InlineComponent);
}

/**
 * Serialize inline component [mod+type:: content]
 */
function serializeInlineComponent(comp: InlineComponent): string {
  const parts: string[] = [];

  // Modifiers
  if (comp.modifiers && comp.modifiers.length > 0) {
    parts.push(comp.modifiers.join('+'));
  }

  // Component type
  if (comp.component) {
    if (parts.length > 0) {
      parts.push('+' + comp.component);
    } else {
      parts.push(comp.component);
    }
  }

  // Build the bracket content
  const typeStr = parts.join('');
  const valueStr = serializeComponentValue(comp);

  return `[${typeStr}:: ${valueStr}]`;
}

/**
 * Serialize component value based on type
 */
function serializeComponentValue(comp: InlineComponent): string {
  const attrs = comp.attributes || {};

  // If just modifiers with value
  if (!comp.component && comp.value) {
    return comp.value;
  }

  switch (comp.component) {
    case 'a':
      // [a:: url; text]
      // According to Core Invariants 11-INLINE-COMPONENT-ATTRIBUTES.md
      // Links support only 2 attributes: url (required) and text (optional)
      // Support both formats: {url, text} and {href, value}
      const url = attrs.url || attrs.href || '';
      const text = attrs.text || comp.value || '';

      if (text) {
        return `${url}; ${text}`;
      }
      return url;

    case 'img':
      // [img:: path; alt; title]
      const imgParts = [attrs.path || attrs.src || ''];
      if (attrs.alt) imgParts.push(attrs.alt);
      if (attrs.title) imgParts.push(attrs.title);
      return imgParts.join('; ');

    case 'video':
    case 'audio':
      // [video:: path; title]
      const mediaParts = [attrs.path || attrs.src || ''];
      if (attrs.title) mediaParts.push(attrs.title);
      return mediaParts.join('; ');

    case 'file':
      // [file:: path; label]
      const fileParts = [attrs.path || attrs.src || ''];
      if (attrs.label) fileParts.push(attrs.label);
      return fileParts.join('; ');

    case 'time':
      // [time:: ISO; display]
      const timeParts = [attrs.datetime || ''];
      if (attrs.display) timeParts.push(attrs.display);
      return timeParts.join('; ');

    case 'abbr':
      // [abbr:: short; full]
      return `${attrs.short || ''}; ${attrs.full || ''}`;

    case 'c':
      // [c:: code; lang]
      const codeParts = [attrs.code || comp.value || ''];
      if (attrs.lang) codeParts.push(attrs.lang);
      return codeParts.join('; ');

    default:
      return comp.value || '';
  }
}
