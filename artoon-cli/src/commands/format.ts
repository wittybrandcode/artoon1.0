import { parse } from '@artoon/parser';
import { serialize } from '@artoon/serializer';
import { transform } from '@artoon/ast';
import { readFile, writeFile } from '../utils/file.js';
import { printSuccess, printError } from '../utils/output.js';
import { ExitCodes } from '../utils/exit-codes.js';

interface FormatOptions {
  write?: boolean;
}

/**
 * Format command - Pretty-print ARTOON files
 * Usage: artoon format <file>
 *        artoon format --write <file>
 */
export function formatCommand(file: string, options: FormatOptions): void {
  // Read file
  const fileResult = readFile(file);
  if (!fileResult.success) {
    printError(fileResult.error!);
    process.exit(ExitCodes.FILE_NOT_FOUND);
  }

  const content = fileResult.content!;

  // Parse ARTOON content
  const parseResult = parse(content);

  // Check for parse errors
  if (parseResult.errors && parseResult.errors.length > 0) {
    for (const error of parseResult.errors) {
      printError(`line ${error.line}: ${error.message}`);
    }
    process.exit(ExitCodes.SYNTAX_ERROR);
  }

  // Transform to canonical AST and serialize with consistent formatting
  const ast = transform(parseResult);
  const formatted = serialize(ast, {
    blankLinesBetween: true,
    preserveComments: true,
  });

  // Output or write
  if (options.write) {
    const writeResult = writeFile(file, formatted);
    if (!writeResult.success) {
      printError(writeResult.error!);
      process.exit(ExitCodes.IO_ERROR);
    }
    printSuccess(`Formatted ${file}`);
  } else {
    console.log(formatted);
  }

  process.exit(ExitCodes.SUCCESS);
}
