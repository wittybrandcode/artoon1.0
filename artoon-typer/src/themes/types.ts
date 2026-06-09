/**
 * Theme System Types
 * 
 * PROFESSIONAL DUAL-THEME SYSTEM:
 * - Editor Themes: Light/Dark mode for editor interface
 * - Preview Themes: Content presentation themes (Minimal, Blog, Documentation, Academic)
 * 
 * Based on Design Tokens and CSS Variables approach.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Design Tokens
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Design Tokens - Semantic design values
 */
export interface DesignTokens {
  // Colors
  colors: {
    // Semantic colors
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    
    // Text colors
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      disabled: string;
    };
    
    // Background colors
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      hover: string;
      active: string;
    };
    
    // Border colors
    border: {
      default: string;
      hover: string;
      focus: string;
    };
  };
  
  // Typography
  typography: {
    fontFamily: {
      heading: string;
      body: string;
      code: string;
    };
    
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  
  // Spacing
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  
  // Border radius
  radius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  
  // Shadows
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Component Mapping
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Component mapping configuration
 * Defines how ARTOON components are rendered in HTML
 */
export interface ComponentMapping {
  comment?: {
    tag: 'html-comment' | 'aside' | 'div';
    class?: string;
    attributes?: Record<string, string>;
  };
  
  quote?: {
    tag: 'blockquote' | 'q' | 'cite';
    class?: string;
  };
  
  // Add more component mappings as needed
}

// ═══════════════════════════════════════════════════════════════════════════
// EDITOR THEME (for editor interface)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Editor theme mode
 */
export type EditorMode = 'light' | 'dark';

/**
 * Editor theme preference (what user selected)
 */
export type EditorPreference = 'light' | 'dark' | 'system';

/**
 * Editor Theme - Controls editor interface appearance
 */
export interface EditorTheme {
  // Metadata
  id: string;
  name: string;
  nameAr: string;
  mode: EditorMode;
  
  // Design tokens for editor UI
  tokens: DesignTokens;
}

// ═══════════════════════════════════════════════════════════════════════════
// PREVIEW THEME (for content presentation)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Preview Theme - Controls how content is displayed
 */
export interface PreviewTheme {
  // Metadata
  id: string;
  name: string;
  nameAr: string;
  version: string;
  author?: string;
  description?: string;
  descriptionAr?: string;
  
  // Design tokens for content presentation
  tokens: DesignTokens;
  
  // Component mapping (optional)
  componentMapping?: ComponentMapping;
  
  // Custom CSS (optional)
  customCSS?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Theme Context
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Theme context value - DUAL SYSTEM
 */
export interface ThemeContextValue {
  // ─────────────────────────────────────────────────────────────────────────
  // EDITOR THEME (for editor interface)
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Current editor theme */
  editorTheme: EditorTheme;
  
  /** Current editor mode (resolved from preference) */
  editorMode: EditorMode;
  
  /** User's editor preference */
  editorPreference: EditorPreference;
  
  /** Set editor preference */
  setEditorPreference: (preference: EditorPreference) => void;
  
  /** Toggle editor between light and dark */
  toggleEditor: () => void;
  
  // ─────────────────────────────────────────────────────────────────────────
  // PREVIEW THEME (for content presentation)
  // ─────────────────────────────────────────────────────────────────────────
  
  /** Current preview theme */
  previewTheme: PreviewTheme;
  
  /** Available preview themes */
  previewThemes: PreviewTheme[];
  
  /** Set preview theme by ID */
  setPreviewTheme: (themeId: string) => void;
  
  /** Set custom preview theme */
  setCustomPreviewTheme: (theme: PreviewTheme) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// CSS Variables
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CSS Variables generated from Design Tokens
 */
export interface CSSVariables {
  // Colors
  '--color-primary': string;
  '--color-secondary': string;
  '--color-success': string;
  '--color-warning': string;
  '--color-error': string;
  
  '--color-text-primary': string;
  '--color-text-secondary': string;
  '--color-text-tertiary': string;
  '--color-text-disabled': string;
  
  '--color-bg-primary': string;
  '--color-bg-secondary': string;
  '--color-bg-tertiary': string;
  '--color-bg-hover': string;
  '--color-bg-active': string;
  
  '--color-border-default': string;
  '--color-border-hover': string;
  '--color-border-focus': string;
  
  // Typography
  '--font-heading': string;
  '--font-body': string;
  '--font-code': string;
  
  '--font-size-xs': string;
  '--font-size-sm': string;
  '--font-size-base': string;
  '--font-size-lg': string;
  '--font-size-xl': string;
  '--font-size-2xl': string;
  '--font-size-3xl': string;
  '--font-size-4xl': string;
  
  '--font-weight-normal': string;
  '--font-weight-medium': string;
  '--font-weight-semibold': string;
  '--font-weight-bold': string;
  
  '--line-height-tight': string;
  '--line-height-normal': string;
  '--line-height-relaxed': string;
  
  // Spacing
  '--spacing-xs': string;
  '--spacing-sm': string;
  '--spacing-md': string;
  '--spacing-lg': string;
  '--spacing-xl': string;
  '--spacing-2xl': string;
  '--spacing-3xl': string;
  
  // Radius
  '--radius-sm': string;
  '--radius-md': string;
  '--radius-lg': string;
  '--radius-full': string;
  
  // Shadows
  '--shadow-sm': string;
  '--shadow-md': string;
  '--shadow-lg': string;
  '--shadow-xl': string;
}

/**
 * Convert Design Tokens to CSS Variables
 */
export function tokensToCSSVariables(tokens: DesignTokens): CSSVariables {
  return {
    // Colors
    '--color-primary': tokens.colors.primary,
    '--color-secondary': tokens.colors.secondary,
    '--color-success': tokens.colors.success,
    '--color-warning': tokens.colors.warning,
    '--color-error': tokens.colors.error,
    
    '--color-text-primary': tokens.colors.text.primary,
    '--color-text-secondary': tokens.colors.text.secondary,
    '--color-text-tertiary': tokens.colors.text.tertiary,
    '--color-text-disabled': tokens.colors.text.disabled,
    
    '--color-bg-primary': tokens.colors.background.primary,
    '--color-bg-secondary': tokens.colors.background.secondary,
    '--color-bg-tertiary': tokens.colors.background.tertiary,
    '--color-bg-hover': tokens.colors.background.hover,
    '--color-bg-active': tokens.colors.background.active,
    
    '--color-border-default': tokens.colors.border.default,
    '--color-border-hover': tokens.colors.border.hover,
    '--color-border-focus': tokens.colors.border.focus,
    
    // Typography
    '--font-heading': tokens.typography.fontFamily.heading,
    '--font-body': tokens.typography.fontFamily.body,
    '--font-code': tokens.typography.fontFamily.code,
    
    '--font-size-xs': tokens.typography.fontSize.xs,
    '--font-size-sm': tokens.typography.fontSize.sm,
    '--font-size-base': tokens.typography.fontSize.base,
    '--font-size-lg': tokens.typography.fontSize.lg,
    '--font-size-xl': tokens.typography.fontSize.xl,
    '--font-size-2xl': tokens.typography.fontSize['2xl'],
    '--font-size-3xl': tokens.typography.fontSize['3xl'],
    '--font-size-4xl': tokens.typography.fontSize['4xl'],
    
    '--font-weight-normal': String(tokens.typography.fontWeight.normal),
    '--font-weight-medium': String(tokens.typography.fontWeight.medium),
    '--font-weight-semibold': String(tokens.typography.fontWeight.semibold),
    '--font-weight-bold': String(tokens.typography.fontWeight.bold),
    
    '--line-height-tight': String(tokens.typography.lineHeight.tight),
    '--line-height-normal': String(tokens.typography.lineHeight.normal),
    '--line-height-relaxed': String(tokens.typography.lineHeight.relaxed),
    
    // Spacing
    '--spacing-xs': tokens.spacing.xs,
    '--spacing-sm': tokens.spacing.sm,
    '--spacing-md': tokens.spacing.md,
    '--spacing-lg': tokens.spacing.lg,
    '--spacing-xl': tokens.spacing.xl,
    '--spacing-2xl': tokens.spacing['2xl'],
    '--spacing-3xl': tokens.spacing['3xl'],
    
    // Radius
    '--radius-sm': tokens.radius.sm,
    '--radius-md': tokens.radius.md,
    '--radius-lg': tokens.radius.lg,
    '--radius-full': tokens.radius.full,
    
    // Shadows
    '--shadow-sm': tokens.shadows.sm,
    '--shadow-md': tokens.shadows.md,
    '--shadow-lg': tokens.shadows.lg,
    '--shadow-xl': tokens.shadows.xl,
  };
}
