/**
 * TimeBlockView Tests
 */

import { TimeBlockView, createTimeBlockView } from '../../src/blocks/views/TimeBlockView';
import type { TimeBlock } from '../../src/types';

describe('TimeBlockView', () => {
  const createBlock = (overrides?: Partial<TimeBlock>): TimeBlock => ({
    id: 'test-time-1',
    type: 'time-block',
    direction: 'rtl',
    datetime: '2026-01-16',
    displayText: '',
    ...overrides,
  });
  
  describe('render', () => {
    test('renders time block', () => {
      const block = createBlock();
      const view = createTimeBlockView({ block });
      const element = view.render();
      
      expect(element).toBeTruthy();
      expect(element.querySelector('time')).toBeTruthy();
    });
    
    test('sets datetime attribute', () => {
      const block = createBlock({ datetime: '2026-01-16' });
      const view = createTimeBlockView({ block });
      const element = view.render();
      
      const time = element.querySelector('time');
      expect(time?.dateTime).toBe('2026-01-16');
    });
    
    test('applies correct CSS classes', () => {
      const block = createBlock();
      const view = createTimeBlockView({ block });
      const element = view.render();
      
      expect(element.classList.contains('artoon-block')).toBe(true);
      expect(element.classList.contains('artoon-block--time-block')).toBe(true);
    });
  });
  
  describe('display text', () => {
    test('uses custom display text when provided', () => {
      const block = createBlock({ 
        datetime: '2026-01-16',
        displayText: 'السادس عشر من يناير'
      });
      const view = createTimeBlockView({ block });
      const element = view.render();
      
      const time = element.querySelector('time');
      expect(time?.textContent).toBe('السادس عشر من يناير');
    });
    
    test('formats date when no display text', () => {
      const block = createBlock({ 
        datetime: '2026-01-16',
        displayText: ''
      });
      const view = createTimeBlockView({ block, locale: 'ar' });
      const element = view.render();
      
      const time = element.querySelector('time');
      expect(time?.textContent).toBeTruthy();
      expect(time?.textContent).not.toBe('');
    });
    
    test('getDisplayText returns correct value', () => {
      const block = createBlock({ displayText: 'نص مخصص' });
      const view = createTimeBlockView({ block });
      view.render();
      
      expect(view.getDisplayText()).toBe('نص مخصص');
    });
  });
  
  describe('editing', () => {
    test('shows date picker when not readonly', () => {
      const block = createBlock();
      const view = createTimeBlockView({ block, readOnly: false });
      const element = view.render();
      
      const input = element.querySelector('input[type="date"]');
      expect(input).toBeTruthy();
    });
    
    test('hides date picker in readonly mode', () => {
      const block = createBlock();
      const view = createTimeBlockView({ block, readOnly: true });
      const element = view.render();
      
      const input = element.querySelector('input[type="date"]');
      expect(input).toBeFalsy();
    });
    
    test('makes display text editable when not readonly', () => {
      const block = createBlock();
      const view = createTimeBlockView({ block, readOnly: false });
      const element = view.render();
      
      const time = element.querySelector('time');
      expect(time?.contentEditable).toBe('true');
    });
  });
  
  describe('getters', () => {
    test('getDatetime returns datetime value', () => {
      const block = createBlock({ datetime: '2026-01-16' });
      const view = createTimeBlockView({ block });
      view.render();
      
      expect(view.getDatetime()).toBe('2026-01-16');
    });
  });
});
