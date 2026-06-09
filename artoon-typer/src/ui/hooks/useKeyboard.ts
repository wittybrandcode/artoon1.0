/**
 * useKeyboard Hook
 * 
 * React hook for keyboard shortcut management.
 */

import { useEffect, useMemo, useCallback } from 'react';
import { 
  KeyboardManager, 
  createKeyboardManager,
  type KeyboardShortcut,
  type KeyboardManagerOptions,
} from '../../core/KeyboardManager';
import type { EditorControllerInterface } from '../../types';

/**
 * useKeyboard options
 */
export interface UseKeyboardOptions {
  /** Editor controller */
  controller: EditorControllerInterface;
  /** Custom shortcuts to add */
  customShortcuts?: KeyboardShortcut[];
  /** Shortcuts to disable */
  disabledShortcuts?: string[];
  /** Whether keyboard handling is enabled */
  enabled?: boolean;
}

/**
 * useKeyboard return type
 */
export interface UseKeyboardReturn {
  /** Register a new shortcut */
  register: (shortcut: KeyboardShortcut) => void;
  /** Unregister a shortcut */
  unregister: (key: string) => void;
  /** Get all shortcuts */
  getShortcuts: () => KeyboardShortcut[];
  /** Enable/disable keyboard handling */
  setEnabled: (enabled: boolean) => void;
  /** Check if enabled */
  isEnabled: () => boolean;
}

/**
 * useKeyboard hook
 */
export function useKeyboard(options: UseKeyboardOptions): UseKeyboardReturn {
  const { controller, customShortcuts, disabledShortcuts, enabled = true } = options;
  
  // Create keyboard manager
  const keyboardManager = useMemo(() => {
    return createKeyboardManager({
      controller,
      customShortcuts,
      disabledShortcuts,
    });
  }, [controller, customShortcuts, disabledShortcuts]);
  
  // Update enabled state
  useEffect(() => {
    keyboardManager.setEnabled(enabled);
  }, [keyboardManager, enabled]);
  
  // Set up event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keyboardManager.handleKeyDown(event);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardManager]);
  
  // Memoized callbacks
  const register = useCallback((shortcut: KeyboardShortcut) => {
    keyboardManager.register(shortcut);
  }, [keyboardManager]);
  
  const unregister = useCallback((key: string) => {
    keyboardManager.unregister(key);
  }, [keyboardManager]);
  
  const getShortcuts = useCallback(() => {
    return keyboardManager.getShortcuts();
  }, [keyboardManager]);
  
  const setEnabled = useCallback((enabled: boolean) => {
    keyboardManager.setEnabled(enabled);
  }, [keyboardManager]);
  
  const isEnabled = useCallback(() => {
    return keyboardManager.isEnabled();
  }, [keyboardManager]);
  
  return {
    register,
    unregister,
    getShortcuts,
    setEnabled,
    isEnabled,
  };
}
