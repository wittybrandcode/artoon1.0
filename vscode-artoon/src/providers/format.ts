import * as vscode from 'vscode';
import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { serialize } from '@artoon/serializer';

export function registerFormattingProvider(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerDocumentFormattingEditProvider('artoon', {
    provideDocumentFormattingEdits(document) {
      try {
        const source = document.getText();
        const parseResult = parse(source);

        if (parseResult.errors && parseResult.errors.length > 0) {
          vscode.window.showWarningMessage('ARTOON format skipped: fix parser errors first.');
          return [];
        }

        const ast = transform(parseResult);
        const formatted = serialize(ast);

        if (formatted === source) return [];

        const lastLine = Math.max(0, document.lineCount - 1);
        const endCharacter = document.lineAt(lastLine).text.length;
        const fullRange = new vscode.Range(0, 0, lastLine, endCharacter);

        return [vscode.TextEdit.replace(fullRange, formatted)];
      } catch (error) {
        vscode.window.showWarningMessage(`ARTOON format failed: ${String(error)}`);
        return [];
      }
    }
  });

  context.subscriptions.push(provider);
}
