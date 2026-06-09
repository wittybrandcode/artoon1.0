import * as vscode from 'vscode';

const COMPONENT_LINE = /^\s*[><]\.-*([a-z0-9:_-]+)::\s*(.*)$/i;
const META_FIELD = /^\s*[><]\.-:([a-z0-9_-]+):\s*(.*)$/i;
const BLOCK_OPEN = /^\s*<([a-z0-9:_-]+)>\./i;
const HEADING_COMPONENT = /^t[1-6]$/i;

export function registerDocumentSymbolProvider(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerDocumentSymbolProvider('artoon', {
    provideDocumentSymbols(document) {
      const symbols: vscode.DocumentSymbol[] = [];

      for (let i = 0; i < document.lineCount; i++) {
        const text = document.lineAt(i).text;

        const blockMatch = text.match(BLOCK_OPEN);
        if (blockMatch) {
          const range = new vscode.Range(i, 0, i, text.length);
          symbols.push(new vscode.DocumentSymbol(
            `<${blockMatch[1]}>`,
            'Block',
            vscode.SymbolKind.Module,
            range,
            range
          ));
          continue;
        }

        const metaMatch = text.match(META_FIELD);
        if (metaMatch) {
          const range = new vscode.Range(i, 0, i, text.length);
          symbols.push(new vscode.DocumentSymbol(
            `meta.${metaMatch[1]}`,
            metaMatch[2] || 'Metadata field',
            vscode.SymbolKind.Property,
            range,
            range
          ));
          continue;
        }

        const componentMatch = text.match(COMPONENT_LINE);
        if (componentMatch) {
          const name = componentMatch[1];
          const value = componentMatch[2].trim();
          const label = HEADING_COMPONENT.test(name) && value ? `${name}: ${value}` : name;
          const range = new vscode.Range(i, 0, i, text.length);
          symbols.push(new vscode.DocumentSymbol(
            label,
            'Component',
            HEADING_COMPONENT.test(name) ? vscode.SymbolKind.String : vscode.SymbolKind.Field,
            range,
            range
          ));
        }
      }

      return symbols;
    }
  });

  context.subscriptions.push(provider);
}
