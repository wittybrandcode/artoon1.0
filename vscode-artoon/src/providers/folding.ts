import * as vscode from 'vscode';

const BLOCK_OPEN = /^\s*<([a-z0-9:_-]+)>\./i;
const BLOCK_CLOSE = /^\s*\.<([a-z0-9:_-]+)>\s*$/i;

function normalizeBlockName(name: string): string {
  return name.split(':')[0].toLowerCase();
}

export function registerFoldingProvider(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerFoldingRangeProvider('artoon', {
    provideFoldingRanges(document) {
      const ranges: vscode.FoldingRange[] = [];
      const stack: Array<{ name: string; line: number }> = [];

      for (let i = 0; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text;

        const openMatch = lineText.match(BLOCK_OPEN);
        if (openMatch) {
          stack.push({ name: normalizeBlockName(openMatch[1]), line: i });
          continue;
        }

        const closeMatch = lineText.match(BLOCK_CLOSE);
        if (closeMatch) {
          const name = normalizeBlockName(closeMatch[1]);
          let openIndex = -1;
          for (let j = stack.length - 1; j >= 0; j--) {
            if (stack[j].name === name) {
              openIndex = j;
              break;
            }
          }

          if (openIndex >= 0) {
            const open = stack.splice(openIndex, 1)[0];
            if (i > open.line) {
              ranges.push(new vscode.FoldingRange(open.line, i, vscode.FoldingRangeKind.Region));
            }
          }
        }
      }

      return ranges;
    }
  });

  context.subscriptions.push(provider);
}
