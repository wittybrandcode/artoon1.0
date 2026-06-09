/**
 * MetaBlockView
 * 
 * View for document metadata blocks.
 * Displays key-value pairs for document metadata.
 */

import type { MetaBlock, MetaField } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';
import { generateId } from '../../core/utils';

/**
 * Meta block view options
 */
export interface MetaBlockViewOptions extends BlockViewOptions {
  block: MetaBlock;
  /** On block change */
  onBlockChange?: (updates: Partial<MetaBlock>) => void;
  /** Predefined field suggestions */
  fieldSuggestions?: string[];
}

/**
 * Default field suggestions
 */
const DEFAULT_FIELD_SUGGESTIONS = [
  'title',
  'author',
  'date',
  'description',
  'keywords',
  'language',
  'version',
  'license',
];

/**
 * MetaBlockView - handles document metadata blocks
 */
export class MetaBlockView extends BaseBlockView {
  protected block: MetaBlock;
  protected options: MetaBlockViewOptions;
  protected fieldsContainer: HTMLElement | null = null;
  
  constructor(options: MetaBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;
  }
  
  /**
   * Get fields
   */
  getFields(): MetaField[] {
    return this.block.fields;
  }
  
  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');
    
    const container = document.createElement('div');
    container.className = 'artoon-block__content artoon-block__meta';
    
    // Header
    const header = document.createElement('div');
    header.className = 'artoon-meta-header';
    header.innerHTML = '<span class="artoon-meta-icon">📋</span><span class="artoon-meta-title">بيانات وصفية</span>';
    container.appendChild(header);
    
    // Fields container
    this.fieldsContainer = document.createElement('div');
    this.fieldsContainer.className = 'artoon-meta-fields';
    this.renderFields();
    container.appendChild(this.fieldsContainer);
    
    // Add field button
    if (!this.options.readOnly) {
      const addBtn = this.createAddButton();
      container.appendChild(addBtn);
    }
    
    // Apply styles
    this.applyStyles(this.element);
    
    this.element.appendChild(container);
    return this.element;
  }
  
  /**
   * Update the element
   */
  protected updateElement(): void {
    if (this.element) {
      this.element.className = this.getClassName();
      this.element.dir = this.block.direction;
    }
    this.renderFields();
  }
  
  /**
   * Render all fields
   */
  private renderFields(): void {
    if (!this.fieldsContainer) return;
    
    this.fieldsContainer.innerHTML = '';
    
    this.block.fields.forEach((field, index) => {
      const fieldEl = this.renderField(field, index);
      this.fieldsContainer!.appendChild(fieldEl);
    });
  }
  
  /**
   * Render a single field
   */
  private renderField(field: MetaField, index: number): HTMLElement {
    const row = document.createElement('div');
    row.className = 'artoon-meta-field';
    row.setAttribute('data-field-id', field.id);
    
    // Field name
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'artoon-meta-field-name';
    nameInput.value = field.name;
    nameInput.placeholder = 'اسم الحقل';
    nameInput.setAttribute('list', 'artoon-meta-suggestions');
    
    if (!this.options.readOnly) {
      nameInput.addEventListener('input', () => {
        this.updateField(index, { name: nameInput.value });
      });
    } else {
      nameInput.readOnly = true;
    }
    
    // Separator
    const separator = document.createElement('span');
    separator.className = 'artoon-meta-separator';
    separator.textContent = ':';
    
    // Field value
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'artoon-meta-field-value';
    valueInput.value = field.value;
    valueInput.placeholder = 'القيمة';
    
    if (!this.options.readOnly) {
      valueInput.addEventListener('input', () => {
        this.updateField(index, { value: valueInput.value });
      });
    } else {
      valueInput.readOnly = true;
    }
    
    row.appendChild(nameInput);
    row.appendChild(separator);
    row.appendChild(valueInput);
    
    // Delete button
    if (!this.options.readOnly && this.block.fields.length > 1) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'artoon-meta-delete-btn';
      deleteBtn.textContent = '×';
      deleteBtn.title = 'حذف الحقل';
      deleteBtn.onclick = () => this.deleteField(index);
      row.appendChild(deleteBtn);
    }
    
    return row;
  }
  
  /**
   * Create add button
   */
  private createAddButton(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'artoon-meta-add-container';
    
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'artoon-meta-add-btn';
    btn.textContent = '+ إضافة حقل';
    btn.onclick = () => this.addField();
    
    // Datalist for suggestions
    const datalist = document.createElement('datalist');
    datalist.id = 'artoon-meta-suggestions';
    const suggestions = this.options.fieldSuggestions || DEFAULT_FIELD_SUGGESTIONS;
    suggestions.forEach(s => {
      const option = document.createElement('option');
      option.value = s;
      datalist.appendChild(option);
    });
    
    container.appendChild(btn);
    container.appendChild(datalist);
    
    return container;
  }
  
  /**
   * Add a new field
   */
  addField(): void {
    const newField: MetaField = {
      id: generateId('field'),
      name: '',
      value: '',
    };
    
    const fields = [...this.block.fields, newField];
    this.notifyChange({ fields });
  }
  
  /**
   * Delete a field
   */
  deleteField(index: number): void {
    if (this.block.fields.length <= 1) return;
    
    const fields = this.block.fields.filter((_, i) => i !== index);
    this.notifyChange({ fields });
  }
  
  /**
   * Update a field
   */
  updateField(index: number, updates: Partial<MetaField>): void {
    const fields = [...this.block.fields];
    fields[index] = { ...fields[index], ...updates };
    this.notifyChange({ fields });
  }
  
  /**
   * Get field by name
   */
  getFieldByName(name: string): MetaField | undefined {
    return this.block.fields.find(f => f.name === name);
  }
  
  /**
   * Export as JSON-LD
   */
  toJSONLD(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const field of this.block.fields) {
      if (field.name && field.value) {
        result[field.name] = field.value;
      }
    }
    return result;
  }
  
  /**
   * Notify block change
   */
  private notifyChange(updates: Partial<MetaBlock>): void {
    if (this.options.onBlockChange) {
      this.options.onBlockChange(updates);
    }
    
    this.emit({
      type: 'update',
      blockId: this.block.id,
      block: { ...this.block, ...updates },
    });
  }
  
  protected onFocus(): void {
    // Focus first field name input
    if (this.fieldsContainer) {
      const firstInput = this.fieldsContainer.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }
}

/**
 * Create a meta block view
 */
export function createMetaBlockView(options: MetaBlockViewOptions): MetaBlockView {
  return new MetaBlockView(options);
}
