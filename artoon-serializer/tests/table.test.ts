// ARTOON Serializer - Table Node Tests

import { serializeTable } from '../src/nodes/table';
import { TableNode } from '@artoon/ast';

describe('serializeTable', () => {
  it('should serialize simple table', () => {
    const node: TableNode = {
      type: 'table',

      nodeType: 'table',
      direction: 'rtl',
      line: 1,
      headers: {
        rowType: 'th',
        cells: [
          { content: [{ type: 'plain', value: 'العمود 1' }] },
          { content: [{ type: 'plain', value: 'العمود 2' }] }
        ]
      },
      rows: [
        {
          rowType: 'tr',
          cells: [
            { content: [{ type: 'plain', value: 'قيمة 1' }] },
            { content: [{ type: 'plain', value: 'قيمة 2' }] }
          ]
        }
      ]
    };
    
    expect(serializeTable(node)).toBe(
      '>.table::\n' +
      'th:: العمود 1; العمود 2\n' +
      'tr:: قيمة 1; قيمة 2'
    );
  });
  
  it('should serialize table without headers', () => {
    const node: TableNode = {
      type: 'table',

      nodeType: 'table',
      direction: 'ltr',
      line: 1,
      rows: [
        {
          rowType: 'tr',
          cells: [
            { content: [{ type: 'plain', value: 'A' }] },
            { content: [{ type: 'plain', value: 'B' }] }
          ]
        },
        {
          rowType: 'tr',
          cells: [
            { content: [{ type: 'plain', value: 'C' }] },
            { content: [{ type: 'plain', value: 'D' }] }
          ]
        }
      ]
    };
    
    expect(serializeTable(node)).toBe(
      '<.table::\n' +
      'tr:: A; B\n' +
      'tr:: C; D'
    );
  });
  
  it('should serialize table with inline content in cells', () => {
    const node: TableNode = {
      type: 'table',

      nodeType: 'table',
      direction: 'rtl',
      line: 1,
      headers: {
        rowType: 'th',
        cells: [
          { content: [{ type: 'plain', value: 'الاسم' }] },
          { content: [{ type: 'plain', value: 'الرابط' }] }
        ]
      },
      rows: [
        {
          rowType: 'tr',
          cells: [
            { content: [
              { type: 'inline', modifiers: ['s'], attributes: {}, value: 'أحمد' }
            ]},
            { content: [
              { type: 'inline', component: 'a', attributes: { url: 'https://example.com', text: 'موقع' } }
            ]}
          ]
        }
      ]
    };
    
    expect(serializeTable(node)).toBe(
      '>.table::\n' +
      'th:: الاسم; الرابط\n' +
      'tr:: [s:: أحمد]; [a:: https://example.com; موقع]'
    );
  });
});
