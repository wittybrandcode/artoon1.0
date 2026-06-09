/**
 * DividerBlockView Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DividerBlockView, createDividerBlockView } from '../../src/blocks/views/DividerBlockView';
import type { DividerBlock } from '../../src/types';

// Helper to create a test block
function createTestBlock(): DividerBlock {
  return {
    id: 'test-divider-1',
    type: 'divider',
    direction: 'rtl',
  };
}

describe('DividerBlockView', () => {
  let view: DividerBlockView;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (view) {
      view.destroy();
    }
    container.remove();
  });

  describe('creation', () => {
    it('should create a view', () => {
      const block = createTestBlock();
      view = createDividerBlockView({ block });
      
      expect(view).toBeInstanceOf(DividerBlockView);
      expect(view.id).toBe('test-divider-1');
    });

    it('should render element', () => {
      const block = createTestBlock();
      view = createDividerBlockView({ block });
      
      const element = view.render();
      
      expect(element).toBeInstanceOf(HTMLElement);
    });
  });

  describe('hr element', () => {
    it('should render hr element', () => {
      const block = createTestBlock();
      view = createDividerBlockView({ block });
      
      const element = view.render();
      const hr = element.querySelector('hr');
      
      expect(hr).not.toBeNull();
    });

    it('should have hr class', () => {
      const block = createTestBlock();
      view = createDividerBlockView({ block });
      
      const element = view.render();
      const hr = element.querySelector('hr');
      
      expect(hr?.classList.contains('artoon-divider-block__hr')).toBe(true);
    });
  });

  describe('focusable', () => {
    it('should be focusable', () => {
      const block = createTestBlock();
      view = createDividerBlockView({ block });
      
      const element = view.render();
      
      expect(element.tabIndex).toBe(0);
    });
  });

  describe('keyboard', () => {
    it('should emit remove on backspace', () => {
      const onEvent = vi.fn();
      const block = createTestBlock();
      view = createDividerBlockView({ block, onEvent });
      const element = view.render();
      container.appendChild(element);
      
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
      
      expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({
        type: 'remove',
        blockId: 'test-divider-1',
      }));
    });

    it('should emit remove on delete', () => {
      const onEvent = vi.fn();
      const block = createTestBlock();
      view = createDividerBlockView({ block, onEvent });
      const element = view.render();
      container.appendChild(element);
      
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
      
      expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({
        type: 'remove',
      }));
    });
  });

  describe('CSS classes', () => {
    it('should have divider block class', () => {
      const block = createTestBlock();
      view = createDividerBlockView({ block });
      
      const element = view.render();
      
      expect(element.classList.contains('artoon-divider-block')).toBe(true);
    });

    it('should have base block class', () => {
      const block = createTestBlock();
      view = createDividerBlockView({ block });
      
      const element = view.render();
      
      expect(element.classList.contains('artoon-block')).toBe(true);
    });
  });

  describe('focus', () => {
    it('should add focused class', () => {
      const block = createTestBlock();
      view = createDividerBlockView({ block });
      const element = view.render();
      
      view.focus();
      
      expect(element.classList.contains('artoon-block--focused')).toBe(true);
    });
  });

  describe('update', () => {
    it('should update direction', () => {
      const block = createTestBlock();
      view = createDividerBlockView({ block });
      const element = view.render();
      
      const newBlock: DividerBlock = { ...block, direction: 'ltr' };
      view.update(newBlock);
      
      expect(element.dir).toBe('ltr');
    });
  });
});
