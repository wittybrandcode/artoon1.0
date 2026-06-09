import * as vscode from 'vscode';

const COMPONENT_DOCS: Record<string, string> = {
  p: 'Paragraph block.',
  t1: 'Heading level 1.',
  t2: 'Heading level 2.',
  t3: 'Heading level 3.',
  t4: 'Heading level 4.',
  t5: 'Heading level 5.',
  t6: 'Heading level 6.',
  q: 'Blockquote paragraph.',
  pre: 'Preformatted text block.',
  ul: 'Unordered list container.',
  ol: 'Ordered list container.',
  dl: 'Definition list container.',
  li: 'List item.',
  dt: 'Definition term item.',
  dd: 'Definition description item.',
  table: 'Table container.',
  tr: 'Table row.',
  th: 'Table header row/cell.',
  figure: 'Figure compound block.',
  caption: 'Caption child for figure-like blocks.',
  figcaption: 'Figure caption child.',
  details: 'Details compound block.',
  summary: 'Summary child for details blocks.',
  img: 'Image inline/media component.',
  audio: 'Audio media component.',
  video: 'Video media component.',
  file: 'Downloadable file component.',
  a: 'Hyperlink component.',
  c: 'Inline code component.',
  time: 'Time component (datetime; display).',
  abbr: 'Abbreviation component (short; full).',
  br: 'Line break separator.',
  hr: 'Horizontal rule separator.',
  wbr: 'Word-break opportunity separator.'
};

const MODIFIER_DOCS: Record<string, string> = {
  s: 'Strong emphasis.',
  e: 'Emphasis.',
  u: 'Underline.',
  d: 'Deleted text.',
  mark: 'Marked text.',
  sub: 'Subscript.',
  sup: 'Superscript.'
};

export function registerHoverProvider(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerHoverProvider('artoon', {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position, /[a-z][a-z0-9:]*/i);
      if (!range) return undefined;

      const word = document.getText(range);
      const componentDoc = COMPONENT_DOCS[word];
      if (componentDoc) {
        return new vscode.Hover(
          new vscode.MarkdownString(`**${word}**\n\n${componentDoc}\n\nSyntax: \`>.${word}:: ...\``),
          range
        );
      }

      const modifierDoc = MODIFIER_DOCS[word];
      if (modifierDoc) {
        return new vscode.Hover(
          new vscode.MarkdownString(`**${word}::**\n\n${modifierDoc}\n\nSyntax: \`[${word}:: text]\``),
          range
        );
      }

      return undefined;
    }
  });

  context.subscriptions.push(provider);
}
