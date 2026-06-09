import * as vscode from 'vscode';

const COMPONENTS = [
  { label: 'p', detail: 'Paragraph' },
  { label: 't1', detail: 'Heading 1' },
  { label: 't2', detail: 'Heading 2' },
  { label: 't3', detail: 'Heading 3' },
  { label: 't4', detail: 'Heading 4' },
  { label: 't5', detail: 'Heading 5' },
  { label: 't6', detail: 'Heading 6' },
  { label: 'q', detail: 'Blockquote' },
  { label: 'pre', detail: 'Preformatted text' },
  { label: 'ul', detail: 'Unordered list' },
  { label: 'ol', detail: 'Ordered list' },
  { label: 'dl', detail: 'Definition list' },
  { label: 'li', detail: 'List item' },
  { label: 'dt', detail: 'Definition term' },
  { label: 'dd', detail: 'Definition description' },
  { label: 'table', detail: 'Table' },
  { label: 'th', detail: 'Table header' },
  { label: 'tr', detail: 'Table row' },
  { label: 'figure', detail: 'Figure' },
  { label: 'caption', detail: 'Caption child' },
  { label: 'figcaption', detail: 'Figure caption child' },
  { label: 'details', detail: 'Collapsible details' },
  { label: 'summary', detail: 'Details summary child' },
  { label: 'a', detail: 'Link (url; text)' },
  { label: 'img', detail: 'Image (src; alt)' },
  { label: 'video', detail: 'Video (src; title)' },
  { label: 'audio', detail: 'Audio (src; title)' },
  { label: 'file', detail: 'File (src; label)' },
  { label: 'time', detail: 'Time (datetime; display)' },
  { label: 'abbr', detail: 'Abbreviation (short; full)' },
  { label: 'br', detail: 'Line break' },
  { label: 'hr', detail: 'Horizontal rule' },
  { label: 'wbr', detail: 'Word break opportunity' }
];

const MODIFIERS = [
  { label: 's::', detail: 'Strong', insertText: 's:: ${1:text}' },
  { label: 'e::', detail: 'Emphasis', insertText: 'e:: ${1:text}' },
  { label: 'u::', detail: 'Underline', insertText: 'u:: ${1:text}' },
  { label: 'd::', detail: 'Deleted text', insertText: 'd:: ${1:text}' },
  { label: 'mark::', detail: 'Marked text', insertText: 'mark:: ${1:text}' },
  { label: 'sub::', detail: 'Subscript', insertText: 'sub:: ${1:text}' },
  { label: 'sup::', detail: 'Superscript', insertText: 'sup:: ${1:text}' },
  { label: 'a::', detail: 'Link', insertText: 'a:: ${1:url}; ${2:text}' },
  { label: 'img::', detail: 'Image', insertText: 'img:: ${1:src}; ${2:alt}' },
  { label: 'c::', detail: 'Code', insertText: 'c:: ${1:code}' },
  { label: 'abbr::', detail: 'Abbreviation', insertText: 'abbr:: ${1:short}; ${2:full}' },
  { label: 'time::', detail: 'Time', insertText: 'time:: ${1:datetime}; ${2:display}' }
];

const BLOCKS = [
  { label: 'meta', detail: 'Metadata block', insertText: 'meta>.\n>.-:title: ${1:Title}\n>.-:lang: ${2:en}\n.<meta>' },
  { label: 'code', detail: 'Code block', insertText: 'code>.\n${1:code}\n.<code>' },
  { label: 'code:javascript', detail: 'JavaScript code block', insertText: 'code:javascript>.\n${1:// code}\n.<code>' },
  { label: 'code:typescript', detail: 'TypeScript code block', insertText: 'code:typescript>.\n${1:// code}\n.<code>' },
  { label: 'code:python', detail: 'Python code block', insertText: 'code:python>.\n${1:# code}\n.<code>' },
  { label: 'code:html', detail: 'HTML code block', insertText: 'code:html>.\n${1:<!-- code -->}\n.<code>' },
  { label: 'code:css', detail: 'CSS code block', insertText: 'code:css>.\n${1:/* code */}\n.<code>' },
  { label: 'code:json', detail: 'JSON code block', insertText: 'code:json>.\n${1:{}}\n.<code>' },
  { label: 'code:bash', detail: 'Bash code block', insertText: 'code:bash>.\n${1:# command}\n.<code>' }
];

const META_FIELDS = [
  { label: 'title:', detail: 'Title' },
  { label: 'description:', detail: 'Description' },
  { label: 'author:', detail: 'Author' },
  { label: 'date:', detail: 'Date' },
  { label: 'lang:', detail: 'Language' },
  { label: 'dir:', detail: 'Direction (rtl/ltr)' },
  { label: 'tags:', detail: 'Tags' },
  { label: 'version:', detail: 'Version' },
  { label: 'category:', detail: 'Category' }
];

export function registerCompletionProvider(context: vscode.ExtensionContext) {
  const componentProvider = vscode.languages.registerCompletionItemProvider(
    'artoon',
    {
      provideCompletionItems(document, position) {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        if (/^\s*[><]\.-*$/.test(linePrefix)) {
          return COMPONENTS.map(c => {
            const item = new vscode.CompletionItem(c.label, vscode.CompletionItemKind.Keyword);
            item.detail = c.detail;
            item.insertText = new vscode.SnippetString(`${c.label}:: $0`);
            return item;
          });
        }
        return undefined;
      }
    },
    '.'
  );

  const inlineProvider = vscode.languages.registerCompletionItemProvider(
    'artoon',
    {
      provideCompletionItems(document, position) {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        if (linePrefix.endsWith('[')) {
          return MODIFIERS.map(m => {
            const item = new vscode.CompletionItem(m.label, vscode.CompletionItemKind.Function);
            item.detail = m.detail;
            item.insertText = new vscode.SnippetString(m.insertText);
            return item;
          });
        }
        return undefined;
      }
    },
    '['
  );

  const blockProvider = vscode.languages.registerCompletionItemProvider(
    'artoon',
    {
      provideCompletionItems(document, position) {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        if (/^\s*<$/.test(linePrefix)) {
          return BLOCKS.map(b => {
            const item = new vscode.CompletionItem(b.label, vscode.CompletionItemKind.Module);
            item.detail = b.detail;
            item.insertText = new vscode.SnippetString(b.insertText);
            return item;
          });
        }
        return undefined;
      }
    },
    '<'
  );

  const metaFieldProvider = vscode.languages.registerCompletionItemProvider(
    'artoon',
    {
      provideCompletionItems(document, position) {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        if (/^\s*[><]\.-:$/.test(linePrefix)) {
          return META_FIELDS.map(f => {
            const item = new vscode.CompletionItem(f.label, vscode.CompletionItemKind.Property);
            item.detail = f.detail;
            item.insertText = f.label + ' ';
            return item;
          });
        }
        return undefined;
      }
    },
    ':'
  );

  context.subscriptions.push(componentProvider, inlineProvider, blockProvider, metaFieldProvider);
}
