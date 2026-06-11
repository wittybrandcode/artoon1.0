import type {
    BaseNode,
    Direction,
    InlineContent,
    Modifier,
    SeparatorType,
    ListType,
    TextType,
    CompoundType
} from '../types';

export interface ParserTextNode extends BaseNode {
    type: 'text';
    textType: TextType | 'summary';
    content: InlineContent[];
}

export interface ParserSeparatorNode extends BaseNode {
    type: 'separator';
    separatorType: SeparatorType;
    separators?: SeparatorType[];
}

export interface ParserListNode extends BaseNode {
    type: 'list';
    listType: ListType;
    items: ParserListItem[];
    children?: ParserListItem[];
}

export interface ParserListItem {
    itemType: string;
    content: any;
    items?: ParserListItem[];
    children?: ParserListItem[];
}

export interface ParserTableNode extends BaseNode {
    type: 'table';
    headers: string[];
    rows: string[][];
}

export interface ParserCompoundNode extends BaseNode {
    type: 'compound';
    compoundType: CompoundType;
    children: ParserNode[];
}

export interface ParserBlockNode extends BaseNode {
    type: 'block';
    blockName: string;
    isCode?: boolean;
    lang?: string;
    content: ParserNode[] | string;
    fields?: ParserBlockField[];
}

export interface ParserBlockField {
    name: string;
    direction: Direction;
    value: string;
}

export interface ParserCommentNode extends BaseNode {
    type: 'comment';
    content: string;
}

export interface ParserMediaNode extends BaseNode {
    type: 'media';
    mediaType: 'img' | 'video' | 'audio' | 'file';
    src: string;
    alt?: string;
    title?: string;
    label?: string;
}

export interface ParserLinkNode extends BaseNode {
    type: 'link';
    url: string;
    text?: string;
    modifiers: Modifier[];
}

export interface ParserCodeNode extends BaseNode {
    type: 'code';
    code: string;
    lang?: string;
}

export type ParserNode =
    | ParserTextNode
    | ParserSeparatorNode
    | ParserListNode
    | ParserTableNode
    | ParserCompoundNode
    | ParserBlockNode
    | ParserCommentNode
    | ParserMediaNode
    | ParserLinkNode
    | ParserCodeNode;

export interface ParserInlineToken {
    index: number;
    modifiers: Modifier[];
    componentType: string | null;
    attributes: string[];
    raw: string;
}

export interface ParsedContent {
    text: string;
    inlines: ParserInlineToken[];
}

export interface ParserDocumentNode {
    type: 'document';
    meta?: ParserBlockNode;
    children: ParserNode[];
}

export interface ParserParseResult {
    ast: ParserDocumentNode;
    errors: any[];
}
