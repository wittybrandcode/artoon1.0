/**
 * EditorState - The main immutable editor state
 */

import type { ARTOONDocument } from '@artoon/ast';
import type { 
  EditorState, 
  EditorStateConfig, 
  EditorStateJSON,
  Selection,
  Transaction,
  Plugin,
  PluginKey,
  HistoryState
} from '../types';
import { DocumentImpl } from './Document';
import { TextSelectionImpl, selectionFromJSON } from '../selection/Selection';
import { findSelectionAtStart } from '../selection/helpers';
import { TransactionImpl } from '../transaction/Transaction';
import { HistoryStateImpl, HistoryManager, createHistory } from '../history/History';
import { PluginImpl } from '../plugins/Plugin';

/**
 * EditorState implementation
 */
export class EditorStateImpl implements EditorState {
  readonly doc: DocumentImpl;
  readonly selection: Selection;
  readonly plugins: PluginImpl[];
  
  private _history: HistoryManager;
  private _pluginStates: Map<PluginKey, unknown> = new Map();

  private constructor(
    doc: DocumentImpl,
    selection: Selection,
    plugins: PluginImpl[],
    history: HistoryManager
  ) {
    this.doc = doc;
    this.selection = selection;
    this.plugins = plugins;
    this._history = history;
  }

  /**
   * Create new editor state
   */
  static create(config: EditorStateConfig = {}): EditorStateImpl {
    // Create document
    let doc: DocumentImpl;
    if (config.doc) {
      if (config.doc instanceof DocumentImpl) {
        doc = config.doc;
      } else {
        doc = DocumentImpl.create(config.doc as ARTOONDocument);
      }
    } else {
      doc = DocumentImpl.create({
        version: '2.0',
        content: [{
          type: 'text',
          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 1,
          content: []
        }]
      });
    }

    // Create selection
    let selection: Selection;
    if (config.selection) {
      selection = config.selection;
    } else {
      selection = findSelectionAtStart(doc);
    }

    // Setup plugins
    const plugins = (config.plugins || []) as PluginImpl[];
    
    // Create history
    const history = createHistory();

    const state = new EditorStateImpl(doc, selection, plugins, history);

    // Initialize plugin states
    for (const plugin of plugins) {
      const value = plugin.initState(config, state);
      if (value !== undefined) {
        state._pluginStates.set(plugin.key, value);
      }
    }

    return state;
  }

  /**
   * Get history state
   */
  get history(): HistoryState {
    return this._history.getState();
  }

  /**
   * Create a new transaction
   */
  get tr(): TransactionImpl {
    return new TransactionImpl(this.doc, this.selection);
  }

  /**
   * Apply transaction, returning new state
   */
  apply(tr: Transaction): EditorStateImpl {
    // Filter transaction through plugins
    for (const plugin of this.plugins) {
      if (!plugin.filterTransaction(tr, this)) {
        return this;
      }
    }

    // Get new document and selection
    const newDoc = (tr as TransactionImpl).doc;
    let newSelection = tr.selection;

    // Update selection to use new document
    if (newSelection instanceof TextSelectionImpl) {
      newSelection = newSelection.withDoc(newDoc);
    }

    // Create new state
    const newState = new EditorStateImpl(
      newDoc,
      newSelection,
      this.plugins,
      this._history
    );

    // Apply plugin states
    for (const plugin of this.plugins) {
      const newValue = plugin.applyState(tr, this, newState);
      if (newValue !== undefined) {
        newState._pluginStates.set(plugin.key, newValue);
      }
    }

    // Record in history (if not undo/redo)
    const historyAction = tr.getMeta('history');
    if (!historyAction && (tr as TransactionImpl).steps.length > 0) {
      const inverseSteps = (tr as TransactionImpl).steps.map((step, i) => 
        step.invert((tr as TransactionImpl).docs[i])
      ).reverse();
      
      this._history.record(
        (tr as TransactionImpl).steps,
        inverseSteps,
        this.selection
      );
    }

    // Handle undo/redo
    if (historyAction === 'undo') {
      const result = this._history.popUndo();
      if (result) {
        // Apply inverse steps
        let undoDoc: DocumentImpl = this.doc;
        for (const step of result.item.inverseSteps) {
          const stepResult = step.apply(undoDoc);
          if (stepResult.doc) {
            undoDoc = stepResult.doc as DocumentImpl;
          }
        }
        return new EditorStateImpl(
          undoDoc,
          result.item.selection,
          this.plugins,
          this._history
        );
      }
    } else if (historyAction === 'redo') {
      const result = this._history.popRedo();
      if (result) {
        // Apply original steps
        let redoDoc: DocumentImpl = this.doc;
        for (const step of result.item.steps) {
          const stepResult = step.apply(redoDoc);
          if (stepResult.doc) {
            redoDoc = stepResult.doc as DocumentImpl;
          }
        }
        return new EditorStateImpl(
          redoDoc,
          findSelectionAtStart(redoDoc),
          this.plugins,
          this._history
        );
      }
    }

    // Append transactions from plugins
    for (const plugin of this.plugins) {
      const appendedTr = plugin.appendTransaction([tr], this, newState);
      if (appendedTr) {
        return newState.apply(appendedTr);
      }
    }

    return newState;
  }

  /**
   * Get plugin state
   */
  getPluginState<T>(key: PluginKey<T>): T | undefined {
    return this._pluginStates.get(key) as T | undefined;
  }

  /**
   * Convert to JSON
   */
  toJSON(): EditorStateJSON {
    return {
      doc: this.doc.toJSON(),
      selection: this.selection.toJSON()
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(
    json: EditorStateJSON,
    config: Partial<EditorStateConfig> = {}
  ): EditorStateImpl {
    const doc = DocumentImpl.fromJSON(json.doc as ARTOONDocument);
    const selection = selectionFromJSON(json.selection, doc);
    
    return EditorStateImpl.create({
      ...config,
      doc,
      selection
    });
  }

  /**
   * Reconfigure with new plugins
   */
  reconfigure(config: Partial<EditorStateConfig>): EditorStateImpl {
    return EditorStateImpl.create({
      doc: this.doc.ast,
      selection: this.selection,
      plugins: config.plugins || this.plugins
    });
  }
}
