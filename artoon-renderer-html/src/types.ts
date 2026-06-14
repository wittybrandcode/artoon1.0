// ARTOON HTML Renderer Types

/**
 * META block handling mode
 */
export type MetaHandlingMode =
  | 'hide'      // Hide completely (default)
  | 'tags'      // Render as <meta> tags
  | 'comment';  // Render as HTML comment

/**
 * Comment display mode
 */
export type CommentDisplayMode = 
  | 'hidden'        // <!-- comment --> (default)
  | 'editor-only'   // <div class="comment editor-only">
  | 'visible'       // <div class="comment visible">
  | 'collapsible';  // <details class="comment">

/**
 * Custom block mapping
 */
export interface CustomBlockMapping {
  /** Block name */
  name: string;
  /** HTML tag to use */
  tag: string;
  /** CSS class (default: block name) */
  className?: string;
  /** Additional attributes */
  attributes?: Record<string, string>;
}

export interface StructuredDataOptions {
  /**
   * Schema.org type for generated JSON-LD.
   * @default 'Article'
   */
  type?: string;

  /**
   * Additional custom properties merged into generated JSON-LD.
   */
  extra?: Record<string, unknown>;
}

/**
 * Render options
 */
export interface RenderOptions {
  /** Include document wrapper (html, head, body) */
  fullDocument?: boolean;
  
  /** Document title (for full document) */
  title?: string;
  
  /** Include direction attributes */
  includeDirection?: boolean;
  
  /** Default direction */
  defaultDirection?: 'rtl' | 'ltr';
  
  /** Indent output */
  indent?: boolean;
  
  /** Indent size (spaces) */
  indentSize?: number;
  
  /** Include comments in output */
  includeComments?: boolean;
  
  /** 
   * How to display comments
   * @default 'hidden'
   */
  commentDisplay?: CommentDisplayMode;
  
  /**
   * HTML tag for visible comments
   * @default 'div'
   */
  commentTag?: 'div' | 'aside' | 'span' | 'section';
  
  /**
   * How to handle META blocks
   * @default 'hide'
   */
  metaHandling?: MetaHandlingMode;
  
  /**
   * Custom block mappings
   * @example
   * customBlocks: [
   *   { name: 'card', tag: 'article', className: 'card' },
   *   { name: 'note', tag: 'aside', className: 'note' }
   * ]
   */
  customBlocks?: CustomBlockMapping[];
  
  /**
   * Default tag for unmapped custom blocks
   * @default 'div'
   */
  defaultCustomBlockTag?: string;
  
  /** CSS class prefix */
  classPrefix?: string;
  
  /** Add semantic classes */
  addSemanticClasses?: boolean;

  /**
   * Add accessibility-oriented ARIA attributes where applicable.
   * @default true
   */
  includeAria?: boolean;

  /**
   * Emit JSON-LD in full document mode.
   * - false: disabled
   * - true: use defaults
   * - object: use custom options
   * @default false
   */
  structuredData?: boolean | StructuredDataOptions;
}

/**
 * Default render options
 */
export const DEFAULT_OPTIONS: RenderOptions = {
  fullDocument: false,
  includeDirection: true,
  defaultDirection: 'rtl',
  indent: true,
  indentSize: 2,
  includeComments: false,
  commentDisplay: 'hidden',
  commentTag: 'div',
  metaHandling: 'hide',
  customBlocks: [],
  defaultCustomBlockTag: 'div',
  classPrefix: 'artoon-',
  addSemanticClasses: false,
  includeAria: false,
  structuredData: false
};

/**
 * HTML element mapping
 */
export const HTML_MAPPING = {
  // Text components
  text: {
    p: 'p',
    t1: 'h1',
    t2: 'h2',
    t3: 'h3',
    t4: 'h4',
    t5: 'h5',
    t6: 'h6',
    q: 'blockquote',
    pre: 'pre',
    time: 'time',
    abbr: 'abbr'
  },
  
  // List components
  list: {
    ul: 'ul',
    ol: 'ol',
    dl: 'dl'
  },
  
  // List items
  listItem: {
    li: 'li',
    dt: 'dt',
    dd: 'dd'
  },
  
  // Modifiers
  modifier: {
    s: 'strong',
    e: 'em',
    u: 'u',
    d: 'del',
    mark: 'mark',
    sub: 'sub',
    sup: 'sup'
  },
  
  // Inline components
  inline: {
    a: 'a',
    img: 'img',
    audio: 'audio',
    video: 'video',
    abbr: 'abbr',
    time: 'time',
    c: 'code'
  },
  
  // Separators
  separator: {
    br: 'br',
    hr: 'hr',
    wbr: 'wbr'
  },
  
  // Compound
  compound: {
    figure: 'figure',
    details: 'details'
  }
} as const;
