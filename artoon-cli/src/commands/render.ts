import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { render, renderFull } from '@artoon/renderer-html';
import { readFile, writeFile } from '../utils/file.js';
import { printSuccess, printError } from '../utils/output.js';
import { ExitCodes } from '../utils/exit-codes.js';

interface RenderOptions {
  output?: string;
  full?: boolean;
  direction?: boolean;
}

export function renderCommand(file: string, options: RenderOptions): void {
  // Read file
  const fileResult = readFile(file);
  if (!fileResult.success) {
    printError(fileResult.error!);
    process.exit(ExitCodes.FILE_NOT_FOUND);
  }

  // Parse
  const parseResult = parse(fileResult.content!);
  
  // Check for parse errors
  if (parseResult.errors && parseResult.errors.length > 0) {
    for (const error of parseResult.errors) {
      printError(`line ${error.line}: ${error.message}`);
    }
    process.exit(ExitCodes.SYNTAX_ERROR);
  }

  // Transform to canonical AST
  const ast = transform(parseResult);

  // Render options
  const renderOptions = {
    includeDirection: options.direction !== false,
  };

  // Render
  let html: string;
  if (options.full) {
    html = renderFull(ast, renderOptions);
  } else {
    html = render(ast, renderOptions);
  }

  // Output
  if (options.output) {
    const writeResult = writeFile(options.output, html);
    if (!writeResult.success) {
      printError(writeResult.error!);
      process.exit(ExitCodes.IO_ERROR);
    }
    printSuccess(`HTML written to ${options.output}`);
  } else {
    console.log(html);
  }

  process.exit(ExitCodes.SUCCESS);
}
