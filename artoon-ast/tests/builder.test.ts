import { ARTOONBuilder } from '../src/builder/ARTOONBuilder';

describe('ARTOONBuilder', () => {
    it('should create an empty document', () => {
        const builder = new ARTOONBuilder();
        const doc = builder.build();

        expect(doc.version).toBe('2.0');
        expect(doc.content).toEqual([]);
        expect(doc.meta).toBeUndefined();
    });

    it('should support changing direction', () => {
        const builder = new ARTOONBuilder('rtl');

        builder.paragraph('First text');
        builder.ltr().paragraph('عربي text in ltr? why not');

        const doc = builder.build();
        expect(doc.content[0].direction).toBe('rtl');
        expect(doc.content[1].direction).toBe('ltr');
    });

    it('should accurately track line counts', () => {
        const builder = new ARTOONBuilder();

        builder
            .paragraph('Line 1')
            .heading(1, 'Line 2')
            .separator('hr');

        const doc = builder.build();
        expect(doc.content[0].line).toBe(1);
        expect(doc.content[1].line).toBe(2);
        expect(doc.content[2].line).toBe(3);
    });

    it('should correctly format a small actual document', () => {
        const builder = new ARTOONBuilder();

        builder.meta({
            title: 'Test Doc',
            author: 'Tester'
        });

        builder
            .heading(1, 'Welcome')
            .paragraph('This is a test paragraph.')
            .list('ul', ['Item 1', 'Item 2'])
            .separator('br');

        const doc = builder.build();

        expect(doc.meta?.title).toBe('Test Doc');
        expect(doc.content).toHaveLength(4);

        // Check heading
        const h1 = doc.content[0] as any;
        expect(h1.type).toBe('text');
        expect(h1.textType).toBe('t1');
        expect(h1.content[0].value).toBe('Welcome');

        // Check list
        const list = doc.content[2] as any;
        expect(list.type).toBe('list');
        expect(list.listType).toBe('ul');
        expect(list.items).toHaveLength(2);
        expect(list.items[1].content[0].value).toBe('Item 2');
    });
});
