/**
 * CustomBlockView Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomBlockView, createCustomBlockView } from '../../src/blocks/views/CustomBlockView';
import type { CustomBlock } from '../../src/types';

describe('CustomBlockView', () => {
  let block: CustomBlock;
  let onBlockChange: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    block = {
      id: 'custom-1',
      type: 'custom',
      direction: 'rtl',
      name: 'card',
      children: [
        { id: 'child-1', type: 't1', content: 'عنوان البطاقة' },
        { id: 'child-2', type: 'p', content: 'محتوى البطاقة' },
      ],
      fields: { color: 'blue' },
    };
    onBlockChange = vi.fn();
  });
  
  describe('creation', () => {
    it('should create view with block', () => {
      const view = new CustomBlockView({ block });
      expect(view).toBeDefined();
      expect(view.getName()).toBe('card');
    });
    
    it('should create view using factory function', () => {
      const view = createCustomBlockView({ block });
      expect(view).toBeDefined();
    });
  });
  
  describe('render', () => {
    it('should render custom block', () => {
      const view = new CustomBlockView({ block });
      const element = view.render();
      
      expect(element).toBeDefined();
      expect(element.tagName).toBe('DIV');
      expect(element.classList.contains('artoon-block')).toBe(true);
    });
    
    it('should render with custom class name', () => {
      const view = new CustomBlockView({ block });
      const element = view.render();
      
      const content = element.querySelector('.artoon-block__custom');
      expect(content?.classList.contains('artoon-custom-card')).toBe(true);
    });
    
    it('should render children', () => {
      const view = new CustomBlockView({ block });
      const element = view.render();
      
      const children = element.querySelectorAll('.artoon-custom-child');
      expect(children.length).toBe(2);
    });
    
    it('should render add button when not read-only', () => {
      const view = new CustomBlockView({ block, readOnly: false });
      const element = view.render();
      
      const addBtn = element.querySelector('.artoon-custom-add-btn');
      expect(addBtn).toBeDefined();
    });
    
    it('should not render add button when read-only', () => {
      const view = new CustomBlockView({ block, readOnly: true });
      const element = view.render();
      
      const addBtn = element.querySelector('.artoon-custom-add-btn');
      expect(addBtn).toBeNull();
    });
  });
  
  describe('getters', () => {
    it('should return name', () => {
      const view = new CustomBlockView({ block });
      expect(view.getName()).toBe('card');
    });
    
    it('should return children', () => {
      const view = new CustomBlockView({ block });
      expect(view.getChildren()).toHaveLength(2);
    });
    
    it('should return fields', () => {
      const view = new CustomBlockView({ block });
      expect(view.getFields()).toEqual({ color: 'blue' });
    });
  });
  
  describe('addChild', () => {
    it('should call onBlockChange when adding child', () => {
      const view = new CustomBlockView({ block, onBlockChange });
      view.render();
      
      view.addChild('p');
      
      expect(onBlockChange).toHaveBeenCalledWith(expect.objectContaining({
        children: expect.any(Array),
      }));
    });
  });
  
  describe('deleteChild', () => {
    it('should call onBlockChange when deleting child', () => {
      const view = new CustomBlockView({ block, onBlockChange });
      view.render();
      
      view.deleteChild(0);
      
      expect(onBlockChange).toHaveBeenCalledWith(expect.objectContaining({
        children: expect.any(Array),
      }));
    });
  });
  
  describe('updateChild', () => {
    it('should call onBlockChange when updating child', () => {
      const view = new CustomBlockView({ block, onBlockChange });
      view.render();
      
      view.updateChild(0, { content: 'عنوان جديد' });
      
      expect(onBlockChange).toHaveBeenCalledWith(expect.objectContaining({
        children: expect.any(Array),
      }));
    });
  });
  
  describe('setField', () => {
    it('should call onBlockChange when setting field', () => {
      const view = new CustomBlockView({ block, onBlockChange });
      view.render();
      
      view.setField('size', 'large');
      
      expect(onBlockChange).toHaveBeenCalledWith(expect.objectContaining({
        fields: expect.objectContaining({ size: 'large' }),
      }));
    });
  });
});
