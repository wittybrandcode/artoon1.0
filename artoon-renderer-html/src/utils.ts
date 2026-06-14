import { escapeHtml as coreEscapeHtml, sanitizeUrl as coreSanitizeUrl } from '@artoon/core';
export const escapeHtml = coreEscapeHtml;
export const sanitizeUrl = coreSanitizeUrl;
export function attr(name: string, value: string | undefined): string {
  if (value === undefined || value === '') return '';
  return ` ${name}="${escapeHtml(value)}"`;
}
export function attrs(attributes: Record<string, string | undefined>): string {
  return Object.entries(attributes).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => attr(k, v)).join('');
}
export function openTag(tag: string, attributes?: Record<string, string | undefined>, selfClosing = false): string {
  const attrStr = attributes ? attrs(attributes) : '';
  return selfClosing ? `<${tag}${attrStr} />` : `<${tag}${attrStr}>`;
}
export function closeTag(tag: string): string { return `</${tag}>`; }
export function wrap(tag: string, content: string, attributes?: Record<string, string | undefined>): string {
  return `${openTag(tag, attributes)}${content}${closeTag(tag)}`;
}
export function selfClose(tag: string, attributes?: Record<string, string | undefined>): string {
  return openTag(tag, attributes, true);
}
export function indent(text: string, level: number, size: number = 2): string {
  const spaces = ' '.repeat(level * size);
  return text.split('\n').map(line => line ? spaces + line : line).join('\n');
}
