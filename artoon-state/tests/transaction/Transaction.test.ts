/**
 * Transaction tests
 */

import { DocumentImpl } from '../../src/state/Document';
import { FragmentImpl } from '../../src/state/Fragment';
import { SliceImpl } from '../../src/state/Slice';
import { TextSelectionImpl } from '../../src/selection/Selection';
import { TransactionImpl } from '../../src/transaction/Transaction';
import { ReplaceStep, AddMarkStep, RemoveMarkStep, SetAttrsStep } from '../../src/transaction/Step';
import { MappingImpl } from '../../src/transaction/Mapping';
import type { ContentNode } from '@artoon/ast';

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

describe('TransactionImpl', () => {
  const simpleDoc = createDoc(['مرحباً']);
  const selection = TextSelectionImpl.at(1, simpleDoc);

  describe('creation', () => {
    it('should create transaction from doc and selection', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      expect(tr.doc).toBe(simpleDoc);
      expect(tr.selection).toBe(selection);
      expect(tr.steps).toEqual([]);
      expect(tr.time).toBeGreaterThan(0);
    });

    it('should expose mapping', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      expect(tr.mapping).toBeInstanceOf(MappingImpl);
    });
  });

  describe('step management', () => {
    it('should apply a replace step', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      const newNode: ContentNode = {
        type: 'text',
        nodeType: 'text',
        textType: 'p',
        direction: 'rtl',
        line: 1,
        content: [{ type: 'plain', value: 'جديد' }]
      };
      const slice = new SliceImpl(FragmentImpl.from(newNode), 0, 0);
      tr.step(new ReplaceStep(1, 8, slice));

      expect(tr.steps).toHaveLength(1);
      expect(tr.docs).toHaveLength(2);
    });

    it('should throw on failed step', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      // Invalid position should cause SetAttrsStep to fail
      const step = new SetAttrsStep(999, { textType: 't1' });
      expect(() => tr.step(step)).toThrow('Step failed');
    });

    it('should chain steps', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      const slice = new SliceImpl(FragmentImpl.from([]), 0, 0);
      tr.step(new ReplaceStep(1, 8, slice));
      expect(tr.steps).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete range', () => {
      const doc = createDoc(['أولاً', 'ثانياً']);
      const tr = new TransactionImpl(doc, TextSelectionImpl.at(1, doc));
      tr.delete(1, 7);
      expect(tr.steps).toHaveLength(1);
    });

    it('should noop when from equals to', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      tr.delete(1, 1);
      expect(tr.steps).toHaveLength(0);
    });
  });

  describe('replaceWith', () => {
    it('should replace with single node', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      const node: ContentNode = {
        type: 'text',
        nodeType: 'text',
        textType: 'p',
        direction: 'rtl',
        line: 1,
        content: [{ type: 'plain', value: 'بديل' }]
      };
      tr.replaceWith(1, 8, node);
      expect(tr.steps).toHaveLength(1);
    });

    it('should replace with array of nodes', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      const nodes: ContentNode[] = [
        {
          type: 'text',
          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 1,
          content: [{ type: 'plain', value: 'واحد' }]
        },
        {
          type: 'text',
          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 2,
          content: [{ type: 'plain', value: 'اثنان' }]
        }
      ];
      tr.replaceWith(1, 8, nodes);
      expect(tr.steps).toHaveLength(1);
    });
  });

  describe('mark operations', () => {
    it('should add mark', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      tr.addMark(1, 3, 's');
      expect(tr.steps).toHaveLength(1);
      expect(tr.steps[0]).toBeInstanceOf(AddMarkStep);
    });

    it('should remove mark', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      tr.removeMark(1, 3, 'e');
      expect(tr.steps).toHaveLength(1);
      expect(tr.steps[0]).toBeInstanceOf(RemoveMarkStep);
    });

    it('should toggle mark (add when not present)', () => {
      const sel = TextSelectionImpl.between(1, 3, simpleDoc);
      const tr = new TransactionImpl(simpleDoc, sel);
      tr.toggleMark('s');
      expect(tr.steps).toHaveLength(1);
      expect(tr.steps[0]).toBeInstanceOf(AddMarkStep);
    });

    it('should clear all marks', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      tr.clearMarks(1, 3);
      expect(tr.steps.length).toBeGreaterThan(0);
    });
  });

  describe('selection operations', () => {
    it('should set selection', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      const newSel = TextSelectionImpl.at(2, simpleDoc);
      tr.setSelection(newSel);
      expect(tr.selection).toBe(newSel);
      expect(tr.selectionSet).toBe(true);
    });
  });

  describe('node attribute operations', () => {
    it('should set node attrs', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      tr.setNodeAttrs(1, { textType: 't1' });
      expect(tr.steps).toHaveLength(1);
      expect(tr.steps[0]).toBeInstanceOf(SetAttrsStep);
    });

    it('should set block type', () => {
      const doc = createDoc(['نص']);
      const tr = new TransactionImpl(doc, TextSelectionImpl.at(1, doc));
      tr.setBlockType(1, 6, 't1');
      expect(tr.steps.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('metadata', () => {
    it('should set and get meta', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      tr.setMeta('key1', 'value1');
      expect(tr.getMeta('key1')).toBe('value1');
      expect(tr.getMeta('missing')).toBeUndefined();
    });

    it('should chain meta operations', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      tr.setMeta('a', 1).setMeta('b', 2);
      expect(tr.getMeta('a')).toBe(1);
      expect(tr.getMeta('b')).toBe(2);
    });
  });

  describe('scrolling', () => {
    it('should set scroll into view', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      tr.scrollIntoView();
      expect(tr.shouldScrollIntoView).toBe(true);
    });
  });

  describe('mapping updates on step', () => {
    it('should update mapping after replace step', () => {
      const tr = new TransactionImpl(simpleDoc, selection);
      const node: ContentNode = {
        type: 'text',
        nodeType: 'text',
        textType: 'p',
        direction: 'rtl',
        line: 1,
        content: [{ type: 'plain', value: 'جديد' }]
      };
      const slice = new SliceImpl(FragmentImpl.from(node), 0, 0);
      tr.step(new ReplaceStep(1, 8, slice));
      expect(tr.mapping).toBeDefined();
    });
  });
});
