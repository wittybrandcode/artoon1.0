// ARTOON HTML Renderer - Document Rendering

import { ARTOONDocument, ContentNode, DocumentMeta } from '@artoon/ast';
import { RenderOptions, DEFAULT_OPTIONS } from '../types.js';
import { escapeHtml } from '../utils.js';
import { renderNode } from './nodes.js';

interface BlockMetaLike {
  type: 'block';
  blockName?: string;
}

interface ParserLikeDocument {
  version?: string;
  meta?: unknown;
  children?: ReadonlyArray<ContentNode>;
  content?: ReadonlyArray<ContentNode>;
}

/**
 * Render ARTOON document to HTML
 */
export function renderDocument(
  doc: ARTOONDocument | ParserLikeDocument,
  options: Partial<RenderOptions> = {}
): string {
  const opts: RenderOptions = { ...DEFAULT_OPTIONS, ...options };
  
  const parts: string[] = [];
  const parserLike = doc as ParserLikeDocument;
  
  // Handle META block if present (from parser output)
  if (isBlockMeta(parserLike.meta)) {
    const metaHtml = renderNode(parserLike.meta as unknown as ContentNode, opts, 0);
    if (metaHtml) {
      parts.push(metaHtml);
    }
  }
  
  // Support both 'content' (AST type) and 'children' (parser output)
  const nodes = parserLike.content || parserLike.children || [];
  
  // Render content
  const content = nodes
    .map((node: ContentNode) => renderNode(node, opts, 0))
    .filter((html: string) => html !== '')
    .join(opts.indent ? '\n\n' : '');
  
  if (content) {
    parts.push(content);
  }
  
  const finalContent = parts.join(opts.indent ? '\n\n' : '');
  
  // Full document wrapper
  if (opts.fullDocument) {
    // Extract DocumentMeta if available
    const documentMeta = (parserLike.meta && typeof parserLike.meta === 'object' && !isBlockMeta(parserLike.meta))
      ? parserLike.meta as DocumentMeta
      : undefined;
    return renderFullDocument(finalContent, documentMeta, opts);
  }
  
  return finalContent;
}

/**
 * Render full HTML document
 */
function renderFullDocument(
  content: string,
  meta: DocumentMeta | undefined,
  options: RenderOptions
): string {
  const title = options.title || meta?.title || 'ARTOON Document';
  const lang = meta?.lang || (options.defaultDirection === 'rtl' ? 'ar' : 'en');
  const dir = meta?.dir || options.defaultDirection || 'rtl';
  
  const head = renderHead(title, meta, options);
  const body = renderBody(content, dir);
  
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
${head}
${body}
</html>`;
}

/**
 * Render head section
 */
function renderHead(
  title: string,
  meta: DocumentMeta | undefined,
  options: RenderOptions
): string {
  const lines: string[] = [
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `  <title>${escapeHtml(title)}</title>`
  ];
  
  // Meta tags
  if (meta) {
    if (meta.description) {
      lines.push(`  <meta name="description" content="${escapeHtml(meta.description)}">`);
    }
    if (meta.author) {
      lines.push(`  <meta name="author" content="${escapeHtml(meta.author)}">`);
    }
    if (meta.tags && meta.tags.length > 0) {
      lines.push(`  <meta name="keywords" content="${escapeHtml(meta.tags.join(', '))}">`);
    }
  }

  const structuredData = renderStructuredData(meta, options);
  if (structuredData) {
    lines.push(`  <script type="application/ld+json">${safeJsonLd(structuredData)}</script>`);
  }
  
  // Default styles for RTL support
  lines.push('  <style>');
  lines.push('    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; margin: 2rem; }');
  lines.push('    [dir="rtl"] { text-align: right; }');
  lines.push('    [dir="ltr"] { text-align: left; }');
  lines.push('    pre { background: #f5f5f5; padding: 1rem; overflow-x: auto; }');
  lines.push('    code { font-family: monospace; }');
  lines.push('    table { border-collapse: collapse; width: 100%; }');
  lines.push('    th, td { border: 1px solid #ddd; padding: 0.5rem; }');
  lines.push('    th { background: #f0f0f0; }');
  lines.push('    blockquote { border-inline-start: 4px solid #ddd; margin: 1rem 0; padding-inline-start: 1rem; }');
  lines.push('    figure { margin: 1rem 0; }');
  lines.push('    figcaption { font-style: italic; color: #666; }');
  lines.push('  </style>');
  
  lines.push('</head>');
  
  return lines.join('\n');
}

/**
 * Render body section
 */
function renderBody(content: string, dir: string): string {
  return `<body dir="${dir}">
${content}
</body>`;
}

function renderStructuredData(
  meta: DocumentMeta | undefined,
  options: RenderOptions
): Record<string, unknown> | null {
  if (!options.structuredData) return null;

  const configured = typeof options.structuredData === 'object' ? options.structuredData : {};
  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': configured.type || 'Article'
  };

  if (meta?.title) payload.headline = meta.title;
  if (meta?.description) payload.description = meta.description;
  if (meta?.author) payload.author = meta.author;
  if (meta?.date) payload.datePublished = meta.date;
  if (meta?.lang) payload.inLanguage = meta.lang;
  if (meta?.tags?.length) payload.keywords = meta.tags.join(', ');

  if (configured.extra) {
    Object.assign(payload, configured.extra);
  }

  return payload;
}

function isBlockMeta(value: unknown): value is BlockMetaLike {
  return Boolean(value && typeof value === 'object' && (value as { type?: unknown }).type === 'block');
}

function safeJsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
