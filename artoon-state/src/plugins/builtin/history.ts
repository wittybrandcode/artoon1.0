/**
 * History plugin - built-in undo/redo support
 */

import { PluginImpl, PluginKeyImpl } from '../Plugin';
import { HistoryManager, HistoryStateImpl, createHistory } from '../../history/History';
import type { EditorState, Transaction, PluginSpec } from '../../types';

/**
 * History plugin key
 */
export const historyPluginKey = new PluginKeyImpl<HistoryManager>('history');

/**
 * History plugin configuration
 */
export interface HistoryPluginConfig {
  /** Maximum undo depth */
  depth?: number;
  /** Time window for grouping changes (ms) */
  groupingDelay?: number;
}

/**
 * Create history plugin
 */
export function historyPlugin(config: HistoryPluginConfig = {}): PluginImpl<HistoryManager> {
  const spec: PluginSpec<HistoryManager> = {
    key: historyPluginKey,
    
    state: {
      init() {
        return createHistory(config);
      },
      
      apply(tr, history, oldState, newState) {
        const historyAction = tr.getMeta('history');
        
        if (historyAction === 'undo') {
          history.popUndo();
        } else if (historyAction === 'redo') {
          history.popRedo();
        } else if (tr.steps.length > 0 && !tr.getMeta('addToHistory') === false) {
          // Record transaction in history
          const inverseSteps = tr.steps.map((step, i) => 
            step.invert(tr.docs[i])
          ).reverse();
          
          history.record(tr.steps, inverseSteps, oldState.selection);
        }
        
        return history;
      }
    }
  };
  
  return new PluginImpl(spec);
}
