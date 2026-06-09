/**
 * MetaBlockView Tests
 */

import { MetaBlockView, createMetaBlockView } from '../../src/blocks/views/MetaBlockView';
import type { MetaBlock, MetaField } from '../../src/types';

describe('MetaBlockView', () => {
  const createField = (name: string, value: string): MetaField => ({
    id: `field-${Math.random().toString(36).substr(2, 9)}`,
    name,
    value,
  });
  
  const createBlock = (fields?: MetaField[]): MetaBlock => ({
    id: 'test-meta-1',
    type: 'meta',
    direction: 'rtl',
    fields: fields || [createField('title', 'عنوان المستند')],
  });
  
  describe('render', () => {
    test('renders meta block', () => {
      const block = createBlock();
      const view = createMetaBlockView({ block });
      const element = view.render();
      
      expect(element).toBeTruthy();
      expect(element.classList.contains('artoon-block--meta')).toBe(true);
    });
    
    test('renders header', () => {
      const block = createBlock();
      const view = createMetaBlockView({ block });
      const element = view.render();
      
      const header = element.querySelector('.artoon-meta-header');
      expect(header).toBeTruthy();
    });
    
    test('renders fields container', () => {
      const block = createBlock();
      const view = createMetaBlockView({ block });
      const element = view.render();
      
      const fields = element.querySelector('.artoon-meta-fields');
      expect(fields).toBeTruthy();
    });
  });
  
  describe('fields rendering', () => {
    test('renders all fields', () => {
      const fields = [
        createField('title', 'عنوان'),
        createField('author', 'أحمد'),
        createField('date', '2026-01-16'),
      ];
      const block = createBlock(fields);
      const view = createMetaBlockView({ block });
      const element = view.render();
      
      const fieldElements = element.querySelectorAll('.artoon-meta-field');
      expect(fieldElements.length).toBe(3);
    });
    
    test('displays field name and value', () => {
      const block = createBlock([createField('title', 'عنوان المستند')]);
      const view = createMetaBlockView({ block });
      const element = view.render();
      
      const nameInput = element.querySelector('.artoon-meta-field-name') as HTMLInputElement;
      const valueInput = element.querySelector('.artoon-meta-field-value') as HTMLInputElement;
      
      expect(nameInput?.value).toBe('title');
      expect(valueInput?.value).toBe('عنوان المستند');
    });
  });
  
  describe('editing', () => {
    test('shows add button when not readonly', () => {
      const block = createBlock();
      const view = createMetaBlockView({ block, readOnly: false });
      const element = view.render();
      
      const addBtn = element.querySelector('.artoon-meta-add-btn');
      expect(addBtn).toBeTruthy();
    });
    
    test('hides add button in readonly mode', () => {
      const block = createBlock();
      const view = createMetaBlockView({ block, readOnly: true });
      const element = view.render();
      
      const addBtn = element.querySelector('.artoon-meta-add-btn');
      expect(addBtn).toBeFalsy();
    });
    
    test('fields are editable when not readonly', () => {
      const block = createBlock();
      const view = createMetaBlockView({ block, readOnly: false });
      const element = view.render();
      
      const nameInput = element.querySelector('.artoon-meta-field-name') as HTMLInputElement;
      expect(nameInput?.readOnly).toBe(false);
    });
    
    test('fields are readonly in readonly mode', () => {
      const block = createBlock();
      const view = createMetaBlockView({ block, readOnly: true });
      const element = view.render();
      
      const nameInput = element.querySelector('.artoon-meta-field-name') as HTMLInputElement;
      expect(nameInput?.readOnly).toBe(true);
    });
  });
  
  describe('field management', () => {
    test('addField adds new field', () => {
      const block = createBlock([createField('title', 'test')]);
      let updatedFields: MetaField[] = [];
      
      const view = createMetaBlockView({ 
        block,
        onBlockChange: (updates) => { 
          if (updates.fields) updatedFields = updates.fields; 
        }
      });
      view.render();
      view.addField();
      
      expect(updatedFields.length).toBe(2);
    });
    
    test('deleteField removes field', () => {
      const fields = [
        createField('title', 'test'),
        createField('author', 'test2'),
      ];
      const block = createBlock(fields);
      let updatedFields: MetaField[] = [];
      
      const view = createMetaBlockView({ 
        block,
        onBlockChange: (updates) => { 
          if (updates.fields) updatedFields = updates.fields; 
        }
      });
      view.render();
      view.deleteField(0);
      
      expect(updatedFields.length).toBe(1);
    });
    
    test('cannot delete last field', () => {
      const block = createBlock([createField('title', 'test')]);
      let deleteCalled = false;
      
      const view = createMetaBlockView({ 
        block,
        onBlockChange: () => { deleteCalled = true; }
      });
      view.render();
      view.deleteField(0);
      
      expect(deleteCalled).toBe(false);
    });
    
    test('getFields returns all fields', () => {
      const fields = [
        createField('title', 'test'),
        createField('author', 'test2'),
      ];
      const block = createBlock(fields);
      const view = createMetaBlockView({ block });
      view.render();
      
      expect(view.getFields().length).toBe(2);
    });
    
    test('getFieldByName finds field', () => {
      const fields = [
        createField('title', 'عنوان'),
        createField('author', 'أحمد'),
      ];
      const block = createBlock(fields);
      const view = createMetaBlockView({ block });
      view.render();
      
      const field = view.getFieldByName('author');
      expect(field?.value).toBe('أحمد');
    });
  });
  
  describe('JSON-LD export', () => {
    test('toJSONLD exports fields as object', () => {
      const fields = [
        createField('title', 'عنوان المستند'),
        createField('author', 'أحمد'),
      ];
      const block = createBlock(fields);
      const view = createMetaBlockView({ block });
      view.render();
      
      const jsonld = view.toJSONLD();
      expect(jsonld.title).toBe('عنوان المستند');
      expect(jsonld.author).toBe('أحمد');
    });
    
    test('toJSONLD skips empty fields', () => {
      const fields = [
        createField('title', 'عنوان'),
        createField('', 'قيمة بدون اسم'),
        createField('empty', ''),
      ];
      const block = createBlock(fields);
      const view = createMetaBlockView({ block });
      view.render();
      
      const jsonld = view.toJSONLD();
      expect(Object.keys(jsonld).length).toBe(1);
      expect(jsonld.title).toBe('عنوان');
    });
  });
});
