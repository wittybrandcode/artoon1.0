/**
 * History - Undo/Redo system
 */

import type { Step, Selection, HistoryState, HistoryItem, Transaction } from '../types';

/**
 * History item implementation
 */
export class HistoryItemImpl implements HistoryItem {
  readonly steps: Step[];
  readonly inverseSteps: Step[];
  readonly selection: Selection;
  readonly timestamp: number;

  constructor(
    steps: Step[],
    inverseSteps: Step[],
    selection: Selection,
    timestamp: number = Date.now()
  ) {
    this.steps = steps;
    this.inverseSteps = inverseSteps;
    this.selection = selection;
    this.timestamp = timestamp;
  }
}

/**
 * History state implementation
 */
export class HistoryStateImpl implements HistoryState {
  readonly undoStack: HistoryItemImpl[];
  readonly redoStack: HistoryItemImpl[];

  constructor(
    undoStack: HistoryItemImpl[] = [],
    redoStack: HistoryItemImpl[] = []
  ) {
    this.undoStack = undoStack;
    this.redoStack = redoStack;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  get undoDepth(): number {
    return this.undoStack.length;
  }

  get redoDepth(): number {
    return this.redoStack.length;
  }

  /**
   * Create empty history
   */
  static empty(): HistoryStateImpl {
    return new HistoryStateImpl([], []);
  }
}

/**
 * History configuration
 */
export interface HistoryConfig {
  /** Maximum undo depth */
  depth?: number;
  /** Time window for grouping changes (ms) */
  groupingDelay?: number;
}

const DEFAULT_CONFIG: Required<HistoryConfig> = {
  depth: 100,
  groupingDelay: 500
};

/**
 * History manager
 */
export class HistoryManager {
  private config: Required<HistoryConfig>;
  private state: HistoryStateImpl;
  private lastTimestamp: number = 0;

  constructor(config: HistoryConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = HistoryStateImpl.empty();
  }

  /**
   * Get current history state
   */
  getState(): HistoryStateImpl {
    return this.state;
  }

  /**
   * Record a transaction in history
   */
  record(
    steps: Step[],
    inverseSteps: Step[],
    selection: Selection
  ): HistoryStateImpl {
    if (steps.length === 0) {
      return this.state;
    }

    const now = Date.now();
    const shouldGroup = now - this.lastTimestamp < this.config.groupingDelay;
    this.lastTimestamp = now;

    let newUndoStack: HistoryItemImpl[];

    if (shouldGroup && this.state.undoStack.length > 0) {
      // Group with previous item
      const lastItem = this.state.undoStack[this.state.undoStack.length - 1];
      const groupedItem = new HistoryItemImpl(
        [...lastItem.steps, ...steps],
        [...inverseSteps, ...lastItem.inverseSteps],
        lastItem.selection, // Keep original selection
        lastItem.timestamp
      );
      newUndoStack = [
        ...this.state.undoStack.slice(0, -1),
        groupedItem
      ];
    } else {
      // Create new item
      const item = new HistoryItemImpl(steps, inverseSteps, selection, now);
      newUndoStack = [...this.state.undoStack, item];
    }

    // Trim to max depth
    if (newUndoStack.length > this.config.depth) {
      newUndoStack = newUndoStack.slice(-this.config.depth);
    }

    // Clear redo stack on new changes
    this.state = new HistoryStateImpl(newUndoStack, []);
    return this.state;
  }

  /**
   * Pop item for undo
   */
  popUndo(): { item: HistoryItemImpl; state: HistoryStateImpl } | null {
    if (!this.state.canUndo) {
      return null;
    }

    const item = this.state.undoStack[this.state.undoStack.length - 1];
    const newUndoStack = this.state.undoStack.slice(0, -1);
    const newRedoStack = [...this.state.redoStack, item];

    this.state = new HistoryStateImpl(newUndoStack, newRedoStack);
    return { item, state: this.state };
  }

  /**
   * Pop item for redo
   */
  popRedo(): { item: HistoryItemImpl; state: HistoryStateImpl } | null {
    if (!this.state.canRedo) {
      return null;
    }

    const item = this.state.redoStack[this.state.redoStack.length - 1];
    const newRedoStack = this.state.redoStack.slice(0, -1);
    const newUndoStack = [...this.state.undoStack, item];

    this.state = new HistoryStateImpl(newUndoStack, newRedoStack);
    return { item, state: this.state };
  }

  /**
   * Clear all history
   */
  clear(): HistoryStateImpl {
    this.state = HistoryStateImpl.empty();
    this.lastTimestamp = 0;
    return this.state;
  }

  /**
   * Force a new group (break grouping)
   */
  breakGroup(): void {
    this.lastTimestamp = 0;
  }
}

/**
 * Create history manager
 */
export function createHistory(config?: HistoryConfig): HistoryManager {
  return new HistoryManager(config);
}
