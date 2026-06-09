import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { EditorStateImpl } from '@artoon/state';
import { validate } from '@artoon/validator';
import { readFile } from '../utils/file.js';
import { 
  printSuccess, 
  printError, 
  printWarning,
  printDivider,
  formatIssue,
  formatSummary,
  ValidationIssue 
} from '../utils/output.js';
import { ExitCodes } from '../utils/exit-codes.js';

interface ValidateOptions {
  strict?: boolean;
  quiet?: boolean;
  json?: boolean;
}

export function validateCommand(file: string, options: ValidateOptions): void {
  // Read file
  const fileResult = readFile(file);
  if (!fileResult.success) {
    if (options.json) {
      console.log(JSON.stringify({ valid: false, error: fileResult.error }));
    } else {
      printError(fileResult.error!);
    }
    process.exit(ExitCodes.FILE_NOT_FOUND);
  }

  const source = fileResult.content!;

  // Parse
  const parseResult = parse(source);
  
  // Collect issues
  const issues: ValidationIssue[] = [];
  
  // Parse errors
  if (parseResult.errors && parseResult.errors.length > 0) {
    for (const error of parseResult.errors) {
      issues.push({
        code: 'PARSE',
        message: error.message,
        line: error.line,
        severity: 'error',
      });
    }
  }

  // Transform and validate
  let validationResult: any = null;
  if (parseResult.ast) {
    try {
      const ast = transform(parseResult);
      const state = EditorStateImpl.create({ doc: ast });
      const stateDoc = state.doc.toAST();
      validationResult = validate(stateDoc, source, { strict: options.strict });
      
      // Add validation errors
      if (validationResult.errors) {
        for (const error of validationResult.errors) {
          issues.push({
            code: error.code || 'VAL',
            message: error.what || error.message || 'Validation error',
            line: error.line,
            severity: 'error',
          });
        }
      }
      
      // Add warnings
      if (validationResult.warnings) {
        for (const warning of validationResult.warnings) {
          issues.push({
            code: warning.code || 'WARN',
            message: warning.what || warning.message || 'Warning',
            line: warning.line,
            severity: options.strict ? 'error' : 'warning',
          });
        }
      }
      
      // Add philosophy breaches
      if (validationResult.philosophyBreaches) {
        for (const breach of validationResult.philosophyBreaches) {
          issues.push({
            code: breach.code || 'PHI',
            message: breach.what || breach.message || 'Philosophy breach',
            line: breach.line,
            severity: 'warning',
          });
        }
      }
    } catch (err) {
      issues.push({
        code: 'INTERNAL',
        message: err instanceof Error ? err.message : 'Unknown error',
        severity: 'error',
      });
    }
  }

  // Count issues
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const hasPhilosophyBreach = issues.some(i => i.code.startsWith('PHI'));

  // JSON output
  if (options.json) {
    const output = {
      valid: errorCount === 0,
      file,
      errors: errorCount,
      warnings: warningCount,
      issues: issues.map(i => ({
        severity: i.severity,
        code: i.code,
        message: i.message,
        line: i.line,
      })),
    };
    console.log(JSON.stringify(output, null, 2));
  } else {
    // Human-readable output
    if (issues.length > 0) {
      for (const issue of issues) {
        console.log(formatIssue(issue));
      }
      
      if (!options.quiet) {
        printDivider();
        console.log(formatSummary(errorCount, warningCount));
      }
    } else if (!options.quiet) {
      printSuccess(`${file} is valid`);
    }
  }

  // Exit code
  if (errorCount > 0) {
    process.exit(ExitCodes.VALIDATION_ERROR);
  } else if (hasPhilosophyBreach && options.strict) {
    process.exit(ExitCodes.PHILOSOPHY_BREACH);
  } else {
    process.exit(ExitCodes.SUCCESS);
  }
}
