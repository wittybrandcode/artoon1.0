import * as vscode from 'vscode';
import { registerCompletionProvider } from './providers/completion';
import { registerDiagnosticsProvider, validateDocument } from './providers/diagnostics';
import { registerHoverProvider } from './providers/hover';
import { registerFoldingProvider } from './providers/folding';
import { registerDocumentSymbolProvider } from './providers/symbols';
import { registerFormattingProvider } from './providers/format';

export function activate(context: vscode.ExtensionContext) {
  registerCompletionProvider(context);
  registerDiagnosticsProvider(context);
  registerHoverProvider(context);
  registerFoldingProvider(context);
  registerDocumentSymbolProvider(context);
  registerFormattingProvider(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('artoon.validateDocument', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'artoon') {
        vscode.window.showInformationMessage('Open an ARTOON document first.');
        return;
      }

      const summary = validateDocument(editor.document);
      const message = summary.total === 0
        ? 'ARTOON document is valid.'
        : `ARTOON validation: ${summary.errors} errors, ${summary.warnings} warnings.`;
      vscode.window.showInformationMessage(message);
    }),
    vscode.commands.registerCommand('artoon.showDocumentStats', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'artoon') {
        vscode.window.showInformationMessage('Open an ARTOON document first.');
        return;
      }

      const text = editor.document.getText();
      const lines = editor.document.lineCount;
      const blocks = (text.match(/^\s*<[a-z0-9:_-]+>\./gim) || []).length;
      const components = (text.match(/^\s*[><]\.-*[a-z0-9:_-]+::/gim) || []).length;
      const metaFields = (text.match(/^\s*[><]\.-:[a-z0-9_-]+:/gim) || []).length;
      vscode.window.showInformationMessage(
        `ARTOON stats: ${lines} lines, ${blocks} blocks, ${components} components, ${metaFields} meta fields.`
      );
    }),
    vscode.commands.registerCommand('artoon.newSample', async () => {
      const doc = await vscode.workspace.openTextDocument({
        language: 'artoon',
        content: [
          '<meta>.',
          '>.-:title: Sample ARTOON Document',
          '>.-:lang: en',
          '>.-:dir: ltr',
          '.<meta>',
          '',
          '<.t1:: Sample ARTOON Document',
          '',
          '<.p:: Start writing structured content here with [s:: semantic emphasis].',
          '',
          '<code:typescript>.',
          'const message = "Hello ARTOON";',
          'console.log(message);',
          '.<code>'
        ].join('\n')
      });
      await vscode.window.showTextDocument(doc);
    })
  );
}

export function deactivate() {}
