/**
 * History tests
 */

import { DocumentImpl } from '../../src/state/Document';
import { TextSelectionImpl } from '../../src/selection/Selection';
import {
  HistoryItemImpl,
  HistoryStateImpl,
  HistoryManager,
  createHistory
} from '../../src/history/History';
import { ReplaceStep } from '../../src/transaction/Step';
import { SliceImpl } from '../../src/state/Slice';

function createDoc(content: string[]): DocumentImpl {
  return DocumentImpl.create({
    version: '1.0',
    content: content.map((text, i) => ({
      type: 'text',
      nodeType: 'text',
      textType: 'p',
      direction: 'rtl',
      line: i + 1,
      content: [{ type: 'plain', value: text }]
    }))
  });
}

describe('HistoryItemImpl', () => {
  const doc = createDoc(['نص']);
  const selection = TextSelectionImpl.at(1, doc);
  const step = new ReplaceStep(1, 1, SliceImpl.empty);

  it('should create history item', () => {
    const item = new HistoryItemImpl([step], [step], selection);
    expect(item.steps).toEqual([step]);
    expect(item.inverseSteps).toEqual([step]);
    expect(item.selection).toBe(selection);
    expect(item.timestamp).toBeGreaterThan(0);
  });

  it('should accept custom timestamp', () => {
    const ts = 1234567890;
    const item = new HistoryItemImpl([step], [step], selection, ts);
    expect(item.timestamp).toBe(ts);
  });
});

describe('HistoryStateImpl', () => {
  it('should create empty state', () => {
    const state = HistoryStateImpl.empty();
    expect(state.undoStack).toEqual([]);
    expect(state.redoStack).toEqual([]);
    expect(state.canUndo).toBe(false);
    expect(state.canRedo).toBe(false);
    expect(state.undoDepth).toBe(0);
    expect(state.redoDepth).toBe(0);
  });

  it('should create with stacks', () => {
    const doc = createDoc(['نص']);
    const selection = TextSelectionImpl.at(1, doc);
    const step = new ReplaceStep(1, 1, SliceImpl.empty);
    const item = new HistoryItemImpl([step], [step], selection);
    const state = new HistoryStateImpl([item], []);
    expect(state.canUndo).toBe(true);
    expect(state.undoDepth).toBe(1);
  });
});

describe('HistoryManager', () => {
  const doc = createDoc(['نص']);
  const selection = TextSelectionImpl.at(1, doc);
  const step = new ReplaceStep(1, 1, SliceImpl.empty);

  describe('creation', () => {
    it('should create with default config', () => {
      const hm = new HistoryManager();
      expect(hm.getState()).toBeDefined();
      expect(hm.getState().canUndo).toBe(false);
    });

    it('should create with custom config', () => {
      const hm = new HistoryManager({ depth: 5, groupingDelay: 100 });
      expect(hm.getState()).toBeDefined();
    });

    it('should create via factory', () => {
      const hm = createHistory({ depth: 10 });
      expect(hm.getState()).toBeDefined();
    });
  });

  describe('recording', () => {
    it('should record steps', () => {
      const hm = new HistoryManager();
      hm.record([step], [step], selection);
      expect(hm.getState().canUndo).toBe(true);
      expect(hm.getState().undoDepth).toBe(1);
    });

    it('should not record empty steps', () => {
      const hm = new HistoryManager();
      hm.record([], [], selection);
      expect(hm.getState().canUndo).toBe(false);
    });

    it('should clear redo stack on new record', () => {
      const hm = new HistoryManager();
      hm.record([step], [step], selection);
      hm.popUndo();
      expect(hm.getState().canRedo).toBe(true);
      hm.record([step], [step], selection);
      expect(hm.getState().canRedo).toBe(false);
    });

    it('should group close changes', async () => {
      const hm = new HistoryManager({ groupingDelay: 500 });
      hm.record([step], [step], selection);
      hm.record([step], [step], selection);
      expect(hm.getState().undoDepth).toBe(1);
    });

    it('should not group distant changes', async () => {
      const hm = new HistoryManager({ groupingDelay: 0 });
      hm.record([step], [step], selection);
      // Wait for grouping window to pass
      await new Promise(r => setTimeout(r, 10));
      hm.record([step], [step], selection);
      expect(hm.getState().undoDepth).toBe(2);
    });

    it('should trim to max depth', () => {
      const hm = new HistoryManager({ depth: 3, groupingDelay: 0 });
      for (let i = 0; i < 5; i++) {
        hm.record([step], [step], selection);
        // Small delay to prevent grouping since groupingDelay=0 still allows immediate grouping
        if (i < 4) hm.breakGroup();
      }
      expect(hm.getState().undoDepth).toBe(3);
    });
  });

  describe('undo', () => {
    it('should pop undo item', () => {
      const hm = new HistoryManager();
      hm.record([step], [step], selection);
      const result = hm.popUndo();
      expect(result).not.toBeNull();
      expect(result!.item.steps).toEqual([step]);
      expect(hm.getState().canRedo).toBe(true);
    });

    it('should return null when nothing to undo', () => {
      const hm = new HistoryManager();
      const result = hm.popUndo();
      expect(result).toBeNull();
    });
  });

  describe('redo', () => {
    it('should pop redo item', () => {
      const hm = new HistoryManager();
      hm.record([step], [step], selection);
      hm.popUndo();
      const result = hm.popRedo();
      expect(result).not.toBeNull();
      expect(hm.getState().canUndo).toBe(true);
    });

    it('should return null when nothing to redo', () => {
      const hm = new HistoryManager();
      const result = hm.popRedo();
      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all history', () => {
      const hm = new HistoryManager();
      hm.record([step], [step], selection);
      hm.clear();
      expect(hm.getState().canUndo).toBe(false);
      expect(hm.getState().canRedo).toBe(false);
    });
  });

  describe('breakGroup', () => {
    it('should force new group on next record', async () => {
      const hm = new HistoryManager({ groupingDelay: 5000 });
      hm.record([step], [step], selection);
      hm.breakGroup();
      hm.record([step], [step], selection);
      expect(hm.getState().undoDepth).toBe(2);
    });
  });
});
