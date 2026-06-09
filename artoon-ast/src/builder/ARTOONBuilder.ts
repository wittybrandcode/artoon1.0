import {
    ContentNode,
    DocumentMeta,
    Direction,
    ARTOONDocument,
    ListNode,
    TableNode,
    TableRow,
    TableCell,
    BlockNode,
    CompoundNode,
    CompoundChild,
    MediaNode,
    LinkNode,
    CodeNode,
    CommentNode,
    InlineContent,
    Modifier
} from '../types';

import {
    createTextNode,
    createPlainText,
    createSeparatorNode,
    createListNode,
    createInlineComponent
} from '../nodes';

import { createCompatNode } from '../compat';

/**
 * Fluent Builder API for creating ARTOON Documents
 */
export class ARTOONBuilder {
    private content: ContentNode[] = [];
    private metaInfo?: DocumentMeta;
    private currentDir: Direction;
    private lineCounter = 1;

    constructor(defaultDirection: Direction = 'rtl') {
        this.currentDir = defaultDirection;
    }

    /**
     * Set direction to Left-to-Right
     */
    public ltr(): this {
        this.currentDir = 'ltr';
        return this;
    }

    /**
     * Set direction to Right-to-Left
     */
    public rtl(): this {
        this.currentDir = 'rtl';
        return this;
    }

    /**
     * Add Document Meta Info
     */
    public meta(meta: DocumentMeta): this {
        this.metaInfo = meta;
        return this;
    }

    /**
     * Add a paragraph
     */
    public paragraph(text: string | InlineContent[]): this {
        const inlineContent = typeof text === 'string' ? [createPlainText(text)] : text;
        const node = createTextNode('p', inlineContent, this.currentDir, this.lineCounter++);
        this.content.push(node);
        return this;
    }

    /**
     * Add a heading
     */
    public heading(level: 1 | 2 | 3 | 4 | 5 | 6, text: string | InlineContent[]): this {
        const inlineContent = typeof text === 'string' ? [createPlainText(text)] : text;
        const node = createTextNode(`t${level}` as any, inlineContent, this.currentDir, this.lineCounter++);
        this.content.push(node);
        return this;
    }

    /**
     * Add a separator (hr, br, wbr)
     */
    public separator(type: 'hr' | 'br' | 'wbr' = 'hr'): this {
        const node = createSeparatorNode([type], this.currentDir, this.lineCounter++);
        this.content.push(node);
        return this;
    }

    /**
     * Add a list (ul, ol)
     */
    public list(type: 'ul' | 'ol', items: (string | InlineContent[])[]): this {
        const node = createListNode(type, this.currentDir, this.lineCounter++);
        const listItems = items.map(item => {
            const inlineContent = typeof item === 'string' ? [createPlainText(item)] : item;
            return {
                itemType: 'li' as const,
                content: inlineContent
            };
        });

        const finalNode: ListNode = {
            ...node,
            items: listItems
        };

        this.content.push(finalNode);
        return this;
    }

    /**
     * Start building a custom block
     */
    public block(blockName: string, content: string | ContentNode[], isCode: boolean = false, lang?: string): this {
        const node = createCompatNode<BlockNode>({
            type: 'block',
            line: this.lineCounter++,
            direction: this.currentDir,
            blockName,
            isCode,
            content,
            ...(lang ? { language: lang } : {})
        });
        this.content.push(node);
        return this;
    }

    /**
     * Export the final document
     */
    public build(): ARTOONDocument {
        return {
            version: '2.0',
            ...(this.metaInfo ? { meta: this.metaInfo } : {}),
            content: this.content
        };
    }
}
