/**
 * FileBlockView Tests
 */

import { FileBlockView, createFileBlockView } from '../../src/blocks/views/FileBlockView';
import type { FileBlock } from '../../src/types';

describe('FileBlockView', () => {
  const createBlock = (overrides?: Partial<FileBlock>): FileBlock => ({
    id: 'test-file-1',
    type: 'file',
    direction: 'rtl',
    src: '',
    label: '',
    ...overrides,
  });
  
  describe('render', () => {
    test('renders file block', () => {
      const block = createBlock();
      const view = createFileBlockView({ block });
      const element = view.render();
      
      expect(element).toBeTruthy();
      expect(element.classList.contains('artoon-block--file')).toBe(true);
    });
    
    test('shows upload area when no src', () => {
      const block = createBlock({ src: '' });
      const view = createFileBlockView({ block, readOnly: false });
      const element = view.render();
      
      const uploadArea = element.querySelector('.artoon-file-upload');
      expect(uploadArea).toBeTruthy();
    });
    
    test('shows file info when src exists', () => {
      const block = createBlock({ 
        src: 'document.pdf', 
        label: 'مستند PDF',
        size: 1024 * 1024, // 1 MB
        mimeType: 'application/pdf'
      });
      const view = createFileBlockView({ block });
      const element = view.render();
      
      const label = element.querySelector('.artoon-file-label');
      expect(label?.textContent).toBe('مستند PDF');
    });
  });
  
  describe('file info display', () => {
    test('displays file label', () => {
      const block = createBlock({ 
        src: 'test.pdf', 
        label: 'ملف اختبار' 
      });
      const view = createFileBlockView({ block });
      const element = view.render();
      
      const label = element.querySelector('.artoon-file-label');
      expect(label?.textContent).toBe('ملف اختبار');
    });
    
    test('displays file size', () => {
      const block = createBlock({ 
        src: 'test.pdf', 
        label: 'test',
        size: 1536 // 1.5 KB
      });
      const view = createFileBlockView({ block });
      const element = view.render();
      
      const size = element.querySelector('.artoon-file-size');
      expect(size?.textContent).toContain('KB');
    });
    
    test('formats size in MB for large files', () => {
      const block = createBlock({ 
        src: 'test.pdf', 
        label: 'test',
        size: 2 * 1024 * 1024 // 2 MB
      });
      const view = createFileBlockView({ block });
      const element = view.render();
      
      const size = element.querySelector('.artoon-file-size');
      expect(size?.textContent).toContain('MB');
    });
  });
  
  describe('file icons', () => {
    test('shows PDF icon for PDF files', () => {
      const block = createBlock({ 
        src: 'test.pdf', 
        label: 'test',
        mimeType: 'application/pdf'
      });
      const view = createFileBlockView({ block });
      const element = view.render();
      
      const icon = element.querySelector('.artoon-file-icon');
      expect(icon?.textContent).toBe('📄');
    });
    
    test('shows image icon for image files', () => {
      const block = createBlock({ 
        src: 'test.jpg', 
        label: 'test',
        mimeType: 'image/jpeg'
      });
      const view = createFileBlockView({ block });
      const element = view.render();
      
      const icon = element.querySelector('.artoon-file-icon');
      expect(icon?.textContent).toBe('🖼️');
    });
    
    test('shows default icon for unknown types', () => {
      const block = createBlock({ 
        src: 'test.xyz', 
        label: 'test',
        mimeType: 'application/octet-stream'
      });
      const view = createFileBlockView({ block });
      const element = view.render();
      
      const icon = element.querySelector('.artoon-file-icon');
      expect(icon?.textContent).toBe('📎');
    });
  });
  
  describe('download button', () => {
    test('shows download button when src exists', () => {
      const block = createBlock({ 
        src: 'test.pdf', 
        label: 'test' 
      });
      const view = createFileBlockView({ block });
      const element = view.render();
      
      const downloadBtn = element.querySelector('.artoon-file-download');
      expect(downloadBtn).toBeTruthy();
    });
    
    test('download button has correct href', () => {
      const block = createBlock({ 
        src: 'https://example.com/test.pdf', 
        label: 'test' 
      });
      const view = createFileBlockView({ block });
      const element = view.render();
      
      const downloadBtn = element.querySelector('.artoon-file-download') as HTMLAnchorElement;
      expect(downloadBtn?.href).toBe('https://example.com/test.pdf');
    });
    
    test('download button has download attribute', () => {
      const block = createBlock({ 
        src: 'test.pdf', 
        label: 'test' 
      });
      const view = createFileBlockView({ block });
      const element = view.render();
      
      const downloadBtn = element.querySelector('.artoon-file-download') as HTMLAnchorElement;
      expect(downloadBtn?.hasAttribute('download')).toBe(true);
    });
  });
  
  describe('editing', () => {
    test('shows change button when not readonly', () => {
      const block = createBlock({ 
        src: 'test.pdf', 
        label: 'test' 
      });
      const view = createFileBlockView({ block, readOnly: false });
      const element = view.render();
      
      const changeBtn = element.querySelector('.artoon-file-change');
      expect(changeBtn).toBeTruthy();
    });
    
    test('hides change button in readonly mode', () => {
      const block = createBlock({ 
        src: 'test.pdf', 
        label: 'test' 
      });
      const view = createFileBlockView({ block, readOnly: true });
      const element = view.render();
      
      const changeBtn = element.querySelector('.artoon-file-change');
      expect(changeBtn).toBeFalsy();
    });
  });
});
