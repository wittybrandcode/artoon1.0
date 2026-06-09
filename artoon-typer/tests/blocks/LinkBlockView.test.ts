/**
 * LinkBlockView Tests (ARTOON-aligned)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinkBlockView, createLinkBlockView } from '../../src/blocks/views/LinkBlockView';
import type { LinkBlock } from '../../src/types';

describe('LinkBlockView', () => {
  let block: LinkBlock;
  let onBlockChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    block = {
      id: 'link-1',
      type: 'link-block',
      direction: 'rtl',
      url: 'https://example.com',
      text: 'زيارة الموقع',
      modifiers: [],
    };
    onBlockChange = vi.fn();
  });

  describe('creation', () => {
    it('should create view with block', () => {
      const view = new LinkBlockView({ block });
      expect(view).toBeDefined();
      expect(view.getUrl()).toBe('https://example.com');
      expect(view.getText()).toBe('زيارة الموقع');
    });

    it('should create view using factory function', () => {
      const view = createLinkBlockView({ block });
      expect(view).toBeDefined();
    });
  });

  describe('render', () => {
    it('should render link block', () => {
      const view = new LinkBlockView({ block });
      const element = view.render();

      expect(element).toBeDefined();
      expect(element.tagName).toBe('DIV');
      expect(element.classList.contains('artoon-block')).toBe(true);
    });

    it('should render with correct class', () => {
      const view = new LinkBlockView({ block });
      const element = view.render();

      const content = element.querySelector('.artoon-block__link');
      expect(content).toBeDefined();
    });

    it('should render read-only as actual link', () => {
      const view = new LinkBlockView({ block, readOnly: true });
      const element = view.render();

      const link = element.querySelector('a');
      expect(link).toBeDefined();
      expect(link?.href).toContain('example.com');
      expect(link?.textContent).toBe('زيارة الموقع');
    });

    it('should render editable with inputs', () => {
      const view = new LinkBlockView({ block, readOnly: false });
      const element = view.render();

      const inputs = element.querySelectorAll('input');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('getters', () => {
    it('should return url', () => {
      const view = new LinkBlockView({ block });
      expect(view.getUrl()).toBe('https://example.com');
    });

    it('should return text', () => {
      const view = new LinkBlockView({ block });
      expect(view.getText()).toBe('زيارة الموقع');
    });
  });
});
