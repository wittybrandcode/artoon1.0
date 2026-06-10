// ARTOON HTML Renderer Utilities

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitize URL to prevent XSS (javascript: urls)
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  // Prevent javascript:, data: (except images), and vbscript:
  if (trimmed.match(/^(javascript|vbscript):/i)) {
    return 'about:blank';
  }
  // Data URLs are risky but sometimes used for images.
  // For links we should probably block them too.
  if (trimmed.match(/^data:/i) && !trimmed.match(/^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/i)) {
    return 'about:blank';
  }
  return trimmed;
}

/**
 * Create HTML attribute string
 */
export function attr(name: string, value: string | undefined): string {
  if (value === undefined || value === '') return '';
  return ` ${name}="${escapeHtml(value)}"`;
}

/**
 * Create HTML attributes from object
 */
export function attrs(attributes: Record<string, string | undefined>): string {
  return Object.entries(attributes)
    .filter(([_, v]) => v !== undefined && v !== '')
    .map(([k, v]) => attr(k, v))
    .join('');
}

/**
 * Create opening tag
 */
export function openTag(
  tag: string, 
  attributes?: Record<string, string | undefined>,
  selfClosing = false
): string {
  const attrStr = attributes ? attrs(attributes) : '';
  return selfClosing ? `<${tag}${attrStr} />` : `<${tag}${attrStr}>`;
}

/**
 * Create closing tag
 */
export function closeTag(tag: string): string {
  return `</${tag}>`;
}

/**
 * Wrap content in tag
 */
export function wrap(
  tag: string, 
  content: string, 
  attributes?: Record<string, string | undefined>
): string {
  return `${openTag(tag, attributes)}${content}${closeTag(tag)}`;
}

/**
 * Create self-closing tag
 */
export function selfClose(
  tag: string, 
  attributes?: Record<string, string | undefined>
): string {
  return openTag(tag, attributes, true);
}

/**
 * Indent lines
 */
export function indent(text: string, level: number, size: number = 2): string {
  const spaces = ' '.repeat(level * size);
  return text.split('\n').map(line => line ? spaces + line : line).join('\n');
}
