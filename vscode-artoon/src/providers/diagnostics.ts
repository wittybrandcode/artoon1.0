import * as vscode from 'vscode';
import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { validate } from '@artoon/validator';
import type { ValidationError } from '@artoon/validator';

let diagnosticCollection: vscode.DiagnosticCollection;
let debounceTimer: NodeJS.Timeout | undefined;
const DEBOUNCE_DELAY = 300;

export interface ValidationSummary {
  errors: number;
  warnings: number;
  philosophyBreaches: number;
  total: number;
}

export function registerDiagnosticsProvider(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('artoon');
  context.subscriptions.push(diagnosticCollection);

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => {
      if (doc.languageId === 'artoon') validateDocument(doc);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.document.languageId === 'artoon') debouncedValidate(event.document);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(doc => {
      if (doc.languageId === 'artoon') validateDocument(doc);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('artoon.validation')) validateOpenDocuments();
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument(doc => {
      diagnosticCollection.delete(doc.uri);
    })
  );

  context.subscriptions.push({
    dispose: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    }
  });

  validateOpenDocuments();
}

function validateOpenDocuments() {
  vscode.workspace.textDocuments.forEach(doc => {
    if (doc.languageId === 'artoon') validateDocument(doc);
  });
}

function debouncedValidate(document: vscode.TextDocument) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => validateDocument(document), DEBOUNCE_DELAY);
}

export function validateDocument(document: vscode.TextDocument): ValidationSummary {
  const config = vscode.workspace.getConfiguration('artoon');
  if (!config.get('validation.enabled', true)) {
    diagnosticCollection.delete(document.uri);
    return { errors: 0, warnings: 0, philosophyBreaches: 0, total: 0 };
  }

  const source = document.getText();
  const diagnostics: vscode.Diagnostic[] = [];

  try {
    const parseResult = parse(source);

    for (const error of parseResult.errors || []) {
      const diagnostic = new vscode.Diagnostic(
        getLineRange(document, error.line),
        error.message || 'Syntax error',
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.source = 'artoon';
      diagnostic.code = 'PARSE';
      diagnostics.push(diagnostic);
    }

    if (parseResult.ast) {
      try {
        const ast = transform(parseResult);
        const strict = config.get('validation.strict', false);
        const validationResult = validate(ast, source, { strict });

        for (const error of validationResult.errors || []) {
          diagnostics.push(createDiagnostic(document, error, vscode.DiagnosticSeverity.Error, 'artoon'));
        }

        for (const warning of validationResult.warnings || []) {
          diagnostics.push(createDiagnostic(document, warning, vscode.DiagnosticSeverity.Warning, 'artoon'));
        }

        for (const breach of validationResult.philosophyBreaches || []) {
          diagnostics.push(createDiagnostic(document, breach, vscode.DiagnosticSeverity.Warning, 'artoon-philosophy'));
        }
      } catch (error) {
        diagnostics.push(new vscode.Diagnostic(
          new vscode.Range(0, 0, 0, 0),
          `Transform/validation error: ${String(error)}`,
          vscode.DiagnosticSeverity.Error
        ));
      }
    }
  } catch (error) {
    diagnostics.push(new vscode.Diagnostic(
      new vscode.Range(0, 0, 0, 0),
      `Unexpected ARTOON error: ${String(error)}`,
      vscode.DiagnosticSeverity.Error
    ));
  }

  diagnosticCollection.set(document.uri, diagnostics);

  const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;
  const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning).length;
  const philosophyBreaches = diagnostics.filter(d => d.source === 'artoon-philosophy').length;
  return { errors, warnings, philosophyBreaches, total: diagnostics.length };
}

function createDiagnostic(
  document: vscode.TextDocument,
  issue: ValidationError,
  severity: vscode.DiagnosticSeverity,
  source: string
): vscode.Diagnostic {
  const diagnostic = new vscode.Diagnostic(
    getLineRange(document, issue.line),
    formatIssueMessage(issue, severity === vscode.DiagnosticSeverity.Error ? 'Validation error' : 'Warning'),
    severity
  );
  diagnostic.source = source;
  diagnostic.code = issue.code || 'ARTOON';
  return diagnostic;
}

function getLineRange(document: vscode.TextDocument, oneBasedLine?: number): vscode.Range {
  const maxLine = Math.max(0, document.lineCount - 1);
  const line = Math.min(Math.max(0, (oneBasedLine || 1) - 1), maxLine);
  const lineText = line < document.lineCount ? document.lineAt(line).text : '';
  return new vscode.Range(line, 0, line, lineText.length);
}

function formatIssueMessage(issue: ValidationError, fallback: string): string {
  const parts = [issue.what || fallback];
  if (issue.why) parts.push(`Why: ${issue.why}`);
  if (issue.suggestion) parts.push(`Fix: ${issue.suggestion}`);
  return parts.join('\n');
}
