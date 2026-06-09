// ARTOON HTML Renderer - Main Entry Point

import { ARTOONDocument } from '@artoon/ast';
import { RenderOptions, DEFAULT_OPTIONS } from './types.js';
import { renderDocument } from './render/document.js';

export interface StateLikeDocument {
  toAST?: () => unknown;
  ast?: unknown;
}

export interface RenderStateInput {
  doc?: StateLikeDocument;
  toJSON?: () => { doc?: unknown };
}

// Export types
export * from './types.js';

// Export render functions
export { renderDocument, renderNode, renderInlineContent } from './render/index.js';

// Export utilities
export { escapeHtml, wrap, selfClose, attr, attrs } from './utils.js';

/**
 * Render ARTOON document to HTML string
 */
export function render(
  doc: ARTOONDocument,
  options?: Partial<RenderOptions>
): string {
  return renderDocument(doc, options);
}

/**
 * Render document from state kernel shape (EditorState-like).
 */
export function renderState(
  state: RenderStateInput,
  options?: Partial<RenderOptions>
): string {
  return renderDocument(resolveStateDocument(state), options);
}

/**
 * Render ARTOON document to full HTML document
 */
export function renderFull(
  doc: ARTOONDocument,
  options?: Partial<RenderOptions>
): string {
  return renderDocument(doc, { ...options, fullDocument: true });
}

/**
 * Create a renderer instance with preset options
 */
export function createRenderer(defaultOptions: Partial<RenderOptions> = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...defaultOptions };
  
  return {
    render: (doc: ARTOONDocument, options?: Partial<RenderOptions>) => 
      renderDocument(doc, { ...opts, ...options }),

    renderState: (state: RenderStateInput, options?: Partial<RenderOptions>) =>
      renderDocument(resolveStateDocument(state), { ...opts, ...options }),
    
    renderFull: (doc: ARTOONDocument, options?: Partial<RenderOptions>) => 
      renderDocument(doc, { ...opts, ...options, fullDocument: true }),
    
    options: opts
  };
}

/**
 * Renderer version
 */
export const VERSION = '1.0.0';

function resolveStateDocument(state: RenderStateInput): ARTOONDocument {
  const doc = state?.doc;
  if (doc?.toAST) {
    const ast = doc.toAST();
    if (isArtoonDocument(ast)) return ast;
  }
  if (isArtoonDocument(doc?.ast)) {
    return doc.ast;
  }

  const jsonDoc = state?.toJSON?.().doc;
  if (isArtoonDocument(jsonDoc)) {
    return jsonDoc;
  }

  throw new Error('Invalid state input: expected state.doc.toAST() or state.toJSON().doc');
}

function isArtoonDocument(value: unknown): value is ARTOONDocument {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { version?: unknown; content?: unknown };
  return typeof candidate.version === 'string' && Array.isArray(candidate.content);
}
