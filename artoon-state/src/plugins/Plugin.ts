/**
 * Plugin - Extensibility system
 */

import type { Plugin, PluginKey, PluginSpec, EditorState, Transaction } from '../types';

/**
 * Plugin key implementation
 */
export class PluginKeyImpl<T = unknown> implements PluginKey<T> {
  private readonly key: string;

  constructor(name: string = 'plugin') {
    this.key = `${name}$${Math.random().toString(36).slice(2)}`;
  }

  getState(state: EditorState): T | undefined {
    for (const plugin of state.plugins) {
      if (plugin.key === this) {
        return plugin.getState(state) as T | undefined;
      }
    }
    return undefined;
  }

  toString(): string {
    return this.key;
  }
}

/**
 * Plugin implementation
 */
export class PluginImpl<T = unknown> implements Plugin<T> {
  readonly spec: PluginSpec<T>;
  readonly key: PluginKey<T>;
  private stateCache: WeakMap<EditorState, T> = new WeakMap();

  constructor(spec: PluginSpec<T>) {
    this.spec = spec;
    this.key = spec.key || new PluginKeyImpl<T>();
  }

  /**
   * Get plugin state from editor state
   */
  getState(state: EditorState): T | undefined {
    return this.stateCache.get(state);
  }

  /**
   * Initialize plugin state
   */
  initState(config: any, state: EditorState): T | undefined {
    if (this.spec.state) {
      const value = this.spec.state.init(config, state);
      this.stateCache.set(state, value);
      return value;
    }
    return undefined;
  }

  /**
   * Apply transaction to plugin state
   */
  applyState(
    tr: Transaction,
    oldState: EditorState,
    newState: EditorState
  ): T | undefined {
    if (this.spec.state) {
      const oldValue = this.stateCache.get(oldState);
      if (oldValue !== undefined) {
        const newValue = this.spec.state.apply(tr, oldValue, oldState, newState);
        this.stateCache.set(newState, newValue);
        return newValue;
      }
    }
    return undefined;
  }

  /**
   * Filter transaction
   */
  filterTransaction(tr: Transaction, state: EditorState): boolean {
    if (this.spec.filterTransaction) {
      return this.spec.filterTransaction(tr, state);
    }
    return true;
  }

  /**
   * Append transaction
   */
  appendTransaction(
    transactions: Transaction[],
    oldState: EditorState,
    newState: EditorState
  ): Transaction | null {
    if (this.spec.appendTransaction) {
      return this.spec.appendTransaction(transactions, oldState, newState);
    }
    return null;
  }
}

/**
 * Create a plugin
 */
export function createPlugin<T>(spec: PluginSpec<T>): PluginImpl<T> {
  return new PluginImpl(spec);
}

/**
 * Create a plugin key
 */
export function createPluginKey<T>(name?: string): PluginKeyImpl<T> {
  return new PluginKeyImpl<T>(name);
}
