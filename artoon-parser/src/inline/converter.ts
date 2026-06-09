/**
 * ParsedContent to InlineContent[] Converter
 * 
 * This is the SINGLE source of truth for converting Parser's internal
 * ParsedContent format to AST's InlineContent[] format.
 * 
 * KEY CHANGE: Previously this conversion was done in artoon-typer's
 * ARTOONImporter. Now it's done here in the Parser, so all consumers
 * receive InlineContent[] directly.
 * 
 * @migration Part of Type Unification Plan - Phase 0
 */

import type {
  InlineContent,
  PlainText,
  InlineComponent,
  Modifier,
  InlineComponentType
} from '@artoon/ast';
import type { ParsedContent, InlineToken } from '../ast/types';

/**
 * Convert ParsedContent (internal format) to InlineContent[] (AST format).
 * 
 * @param parsed - Internal parsed content with text and inline tokens
 * @returns Array of InlineContent (PlainText | InlineComponent)
 * 
 * @example
 * // Input: { text: 'Hello {0} world', inlines: [{ index: 0, modifiers: ['s'], ... }] }
 * // Output: [
 * //   { type: 'plain', value: 'Hello ' },
 * //   { type: 'inline', modifiers: ['s'], ... },
 * //   { type: 'plain', value: ' world' }
 * // ]
 */
export function convertParsedToInline(parsed: ParsedContent): InlineContent[] {
  const { text, inlines } = parsed;

  // Handle empty content
  if (!text && inlines.length === 0) {
    return [];
  }

  // No inline formatting - return plain text
  if (inlines.length === 0) {
    return text ? [createPlainText(text)] : [];
  }

  const result: InlineContent[] = [];
  let lastIndex = 0;

  // Sort inlines by index to process in order
  const sortedInlines = [...inlines].sort((a, b) => a.index - b.index);

  for (const inline of sortedInlines) {
    const placeholderStart = findPlaceholderPosition(text, inline.index, lastIndex);

    // Add plain text before this inline
    if (placeholderStart > lastIndex) {
      const plainText = text.substring(lastIndex, placeholderStart);
      if (plainText) {
        result.push(createPlainText(plainText));
      }
    }

    // Add the inline component
    result.push(convertInlineToken(inline));

    // Update lastIndex (placeholder is {index})
    const placeholder = `{${inline.index}}`;
    lastIndex = placeholderStart + placeholder.length;
  }

  // Add remaining plain text
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex);
    if (remaining) {
      result.push(createPlainText(remaining));
    }
  }

  return result;
}

/**
 * Find the position of a placeholder in text.
 * Handles cases where the placeholder might not be at the expected position.
 */
function findPlaceholderPosition(text: string, index: number, startFrom: number): number {
  const placeholder = `{${index}}`;
  const position = text.indexOf(placeholder, startFrom);
  return position >= 0 ? position : startFrom;
}

/**
 * Create a PlainText node.
 */
function createPlainText(value: string): PlainText {
  return {
    type: 'plain',
    value
  };
}

/**
 * Convert a single InlineToken to InlineComponent.
 */
function convertInlineToken(token: InlineToken): InlineComponent {
  let value: string | undefined;

  // Add value based on component type
  if (token.attributes.length > 0) {
    // For links, the display text is the second attribute
    if (token.componentType === 'a' && token.attributes.length > 1) {
      value = token.attributes[1];
    } else {
      value = token.attributes[0];
    }
  }

  return {
    type: 'inline',
    attributes: parseAttributes(token.attributes, token.componentType),
    ...(token.componentType ? { component: token.componentType as InlineComponentType } : {}),
    ...(token.modifiers && token.modifiers.length > 0 ? { modifiers: token.modifiers as Modifier[] } : {}),
    ...(value !== undefined ? { value } : {})
  };
}

/**
 * Parse attributes array into Record<string, string>.
 * 
 * Attributes come in as an array where the meaning depends on component type:
 * - For links (a): [url, text]
 * - For images (img): [path, alt, title]
 * - For media (audio/video): [path, title]
 * - For abbr: [short, full]
 * - For time: [datetime, display]
 * - For code (c): [code, lang]
 * - For text with modifiers: [text]
 */
function parseAttributes(attrs: string[], componentType?: string | null): Record<string, string> {
  const result: Record<string, string> = {};

  if (attrs.length === 0) return result;

  // Map attributes based on component type
  switch (componentType) {
    case 'a':
      // Link: [url, text]
      if (attrs[0]) result.url = attrs[0];
      if (attrs[1]) result.text = attrs[1];
      break;

    case 'img':
      // Image: [path, alt, title]
      if (attrs[0]) result.path = attrs[0];
      if (attrs[1]) result.alt = attrs[1];
      if (attrs[2]) result.title = attrs[2];
      break;

    case 'audio':
    case 'video':
      // Media: [path, title]
      if (attrs[0]) result.path = attrs[0];
      if (attrs[1]) result.title = attrs[1];
      break;

    case 'file':
      // File: [path, label]
      if (attrs[0]) result.path = attrs[0];
      if (attrs[1]) result.label = attrs[1];
      break;

    case 'abbr':
      // Abbreviation: [short, full]
      if (attrs[0]) result.short = attrs[0];
      if (attrs[1]) result.full = attrs[1];
      break;

    case 'time':
      // Time: [datetime, display]
      if (attrs[0]) result.datetime = attrs[0];
      if (attrs[1]) result.display = attrs[1];
      break;

    case 'c':
      // Code: [code, lang]
      if (attrs[0]) result.code = attrs[0];
      if (attrs[1]) result.lang = attrs[1];
      break;

    default:
      // Text with modifiers or unknown: first is value
      if (attrs[0]) result.value = attrs[0];
      // Handle key=value pairs
      for (let i = 1; i < attrs.length; i++) {
        const attr = attrs[i];
        if (attr.includes('=')) {
          const eqIndex = attr.indexOf('=');
          const key = attr.substring(0, eqIndex);
          const value = attr.substring(eqIndex + 1);
          result[key] = value;
        }
      }
  }

  return result;
}

/**
 * Convert InlineContent[] back to ParsedContent.
 * Used for serialization (AST → ARTOON text).
 * 
 * @param content - Array of InlineContent
 * @returns ParsedContent with text and inlines
 */
export function convertInlineToParsed(content: InlineContent[]): ParsedContent {
  let text = '';
  const inlines: InlineToken[] = [];
  let inlineIndex = 0;

  for (const item of content) {
    if (item.type === 'plain') {
      text += item.value;
    } else {
      // Add placeholder
      text += `{${inlineIndex}}`;

      // Create inline token
      inlines.push({
        index: inlineIndex,
        modifiers: (item.modifiers || []) as Modifier[],
        componentType: item.component || null,
        attributes: extractAttributes(item),
        raw: '' // Will be reconstructed by serializer
      });

      inlineIndex++;
    }
  }

  return { text, inlines };
}

/**
 * Extract attributes from InlineComponent back to array format.
 */
function extractAttributes(component: InlineComponent): string[] {
  const attrs: string[] = [];

  // Value is first
  if (component.value) {
    attrs.push(component.value);
  } else if (component.attributes?.value) {
    attrs.push(component.attributes.value);
  }

  // Add other attributes
  if (component.attributes) {
    for (const [key, value] of Object.entries(component.attributes)) {
      if (key === 'value') continue; // Already added
      if (key === 'href' || key === 'src') {
        attrs.push(value);
      } else if (key === 'title') {
        attrs.push(value);
      } else if (!key.startsWith('attr')) {
        attrs.push(`${key}=${value}`);
      }
    }
  }

  return attrs;
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if content is plain text.
 */
export function isPlainTextContent(content: InlineContent): content is PlainText {
  return content.type === 'plain';
}

/**
 * Check if content is an inline component.
 */
export function isInlineComponentContent(content: InlineContent): content is InlineComponent {
  return content.type === 'inline';
}

/**
 * Check if ParsedContent has any inline formatting.
 */
export function hasInlineFormatting(parsed: ParsedContent): boolean {
  return parsed.inlines.length > 0;
}

/**
 * Get plain text from InlineContent[], stripping all formatting.
 */
export function getPlainTextFromContent(content: InlineContent[]): string {
  return content.map(item => {
    if (item.type === 'plain') {
      return item.value;
    } else {
      return item.value || '';
    }
  }).join('');
}
