/**
 * Theme Provider - DUAL SYSTEM
 * 
 * React context provider for DUAL theme management:
 * 1. Editor Theme: Light/Dark mode for editor interface
 * 2. Preview Theme: Content presentation themes (Minimal, Blog, Documentation, Academic)
 * 
 * Handles theme switching, system preference detection, and CSS variable injection.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { 
  EditorTheme, 
  EditorMode, 
  EditorPreference,
  PreviewTheme,
  ThemeContextValue,
  CSSVariables 
} from './types';
import { tokensToCSSVariables } from './types';
import { getEditorTheme } from './editor';
import { previewThemes, defaultPreviewTheme } from './preview';

// ═══════════════════════════════════════════════════════════════════════════
// Context
// ═══════════════════════════════════════════════════════════════════════════

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════
// Provider Props
// ═══════════════════════════════════════════════════════════════════════════

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default editor preference */
  defaultEditorPreference?: EditorPreference;
  /** Default preview theme ID */
  defaultPreviewThemeId?: string;
  /** Storage key for persisting editor preference */
  editorStorageKey?: string;
  /** Storage key for persisting preview theme */
  previewStorageKey?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect system theme preference
 */
function getSystemPreference(): EditorMode {
  if (typeof window === 'undefined') return 'light';
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches ? 'dark' : 'light';
}

/**
 * Apply CSS variables to document root (for editor)
 */
function applyEditorCSSVariables(variables: CSSVariables): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply CSS variables
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * Load preference from storage
 */
function loadFromStorage<T>(storageKey: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn(`Failed to load from storage (${storageKey}):`, error);
    return defaultValue;
  }
}

/**
 * Save to storage
 */
function saveToStorage<T>(storageKey: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save to storage (${storageKey}):`, error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Provider Component
// ═══════════════════════════════════════════════════════════════════════════

export function ThemeProvider({
  children,
  defaultEditorPreference = 'system',
  defaultPreviewThemeId = 'minimal',
  editorStorageKey = 'artoon-editor-preference',
  previewStorageKey = 'artoon-preview-theme',
}: ThemeProviderProps) {
  
  // ─────────────────────────────────────────────────────────────────────────
  // EDITOR THEME STATE
  // ─────────────────────────────────────────────────────────────────────────
  
  // Load initial editor preference from storage or use default
  const [editorPreference, setEditorPreferenceState] = useState<EditorPreference>(() => {
    return loadFromStorage(editorStorageKey, defaultEditorPreference);
  });
  
  // Track system preference
  const [systemPreference, setSystemPreference] = useState<EditorMode>(getSystemPreference);
  
  // Resolve actual editor mode from preference
  const editorMode = useMemo<EditorMode>(() => {
    if (editorPreference === 'system') {
      return systemPreference;
    }
    return editorPreference;
  }, [editorPreference, systemPreference]);
  
  // Get active editor theme
  const editorTheme = useMemo<EditorTheme>(() => {
    return getEditorTheme(editorMode);
  }, [editorMode]);
  
  // Set editor preference and save to storage
  const setEditorPreference = useCallback((newPreference: EditorPreference) => {
    setEditorPreferenceState(newPreference);
    saveToStorage(editorStorageKey, newPreference);
  }, [editorStorageKey]);
  
  // Toggle editor between light and dark
  const toggleEditor = useCallback(() => {
    setEditorPreference(editorMode === 'light' ? 'dark' : 'light');
  }, [editorMode, setEditorPreference]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // PREVIEW THEME STATE
  // ─────────────────────────────────────────────────────────────────────────
  
  // Load initial preview theme from storage or use default
  const [previewThemeId, setPreviewThemeIdState] = useState<string>(() => {
    return loadFromStorage(previewStorageKey, defaultPreviewThemeId);
  });
  
  // Custom preview theme (if set by user)
  const [customPreviewTheme, setCustomPreviewTheme] = useState<PreviewTheme | null>(null);
  
  // Get active preview theme
  const previewTheme = useMemo<PreviewTheme>(() => {
    if (customPreviewTheme) return customPreviewTheme;
    
    const theme = previewThemes.find(t => t.id === previewThemeId);
    return theme || defaultPreviewTheme;
  }, [previewThemeId, customPreviewTheme]);
  
  // Set preview theme by ID
  const setPreviewTheme = useCallback((themeId: string) => {
    setPreviewThemeIdState(themeId);
    setCustomPreviewTheme(null); // Clear custom theme
    saveToStorage(previewStorageKey, themeId);
  }, [previewStorageKey]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // SYSTEM PREFERENCE LISTENER
  // ─────────────────────────────────────────────────────────────────────────
  
  // Listen to system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);
  
  // ─────────────────────────────────────────────────────────────────────────
  // APPLY EDITOR THEME CSS VARIABLES
  // ─────────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    const variables = tokensToCSSVariables(editorTheme.tokens);
    applyEditorCSSVariables(variables);
    
    // Add theme attributes to body
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-editor-theme', editorTheme.id);
      document.body.setAttribute('data-editor-mode', editorMode);
    }
  }, [editorTheme, editorMode]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────────────────────────────────────
  
  const value = useMemo<ThemeContextValue>(() => ({
    // Editor theme
    editorTheme,
    editorMode,
    editorPreference,
    setEditorPreference,
    toggleEditor,
    
    // Preview theme
    previewTheme,
    previewThemes,
    setPreviewTheme,
    setCustomPreviewTheme,
  }), [
    editorTheme,
    editorMode,
    editorPreference,
    setEditorPreference,
    toggleEditor,
    previewTheme,
    setPreviewTheme,
  ]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Use theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}
