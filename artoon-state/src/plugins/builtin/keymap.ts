/**
 * Keymap plugin - keyboard shortcut handling
 */

import { PluginImpl, PluginKeyImpl } from '../Plugin';
import type { Command, PluginSpec, Keymap } from '../../types';

/**
 * Keymap plugin key
 */
export const keymapPluginKey = new PluginKeyImpl<Keymap>('keymap');

/**
 * Keymap state
 */
interface KeymapState {
  keymap: Keymap;
}

/**
 * Create keymap plugin
 */
export function keymapPlugin(keymap: Keymap): PluginImpl<KeymapState> {
  const spec: PluginSpec<KeymapState> = {
    key: keymapPluginKey as any,
    
    state: {
      init() {
        return { keymap };
      },
      
      apply(_tr, value) {
        return value;
      }
    },
    
    props: {
      handleKeyDown(view: any, event: KeyboardEvent) {
        const key = keyName(event);
        const command = keymap[key];
        
        if (command) {
          const result = command(view.state, view.dispatch);
          if (result) {
            event.preventDefault();
            return true;
          }
        }
        
        return false;
      }
    }
  };
  
  return new PluginImpl(spec);
}

/**
 * Get key name from event
 */
function keyName(event: KeyboardEvent): string {
  const parts: string[] = [];
  
  if (event.ctrlKey) parts.push('Ctrl');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');
  if (event.metaKey) parts.push('Meta');
  
  // Get key
  let key = event.key;
  
  // Normalize key names
  if (key === ' ') key = 'Space';
  if (key.length === 1) key = key.toLowerCase();
  
  // Don't add modifier keys themselves
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    parts.push(key);
  }
  
  return parts.join('-');
}

/**
 * Combine multiple keymaps
 */
export function combineKeymaps(...keymaps: Keymap[]): Keymap {
  const combined: Keymap = {};
  
  for (const keymap of keymaps) {
    for (const [key, command] of Object.entries(keymap)) {
      if (combined[key]) {
        // Chain commands
        const existing = combined[key];
        combined[key] = (state, dispatch) => {
          return command(state, dispatch) || existing(state, dispatch);
        };
      } else {
        combined[key] = command;
      }
    }
  }
  
  return combined;
}
