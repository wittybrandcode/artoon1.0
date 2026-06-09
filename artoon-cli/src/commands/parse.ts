import { parse } from '@artoon/parser';
import { transform, toJSON, toCompactJSON } from '@artoon/ast';
import { EditorStateImpl } from '@artoon/state';
import { readFile, writeFile } from '../utils/file.js';
import { printSuccess, printError } from '../utils/output.js';
import { ExitCodes } from '../utils/exit-codes.js';

interface ParseOptions {
  output?: string;
  compact?: boolean;
  transformed?: boolean;
  state?: boolean;
}

export function parseCommand(file: string, options: ParseOptions): void {
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

  // Transform if requested
  let outputData: any;
  if (options.state) {
    const ast = transform(parseResult);
    const state = EditorStateImpl.create({ doc: ast });
    outputData = state.toJSON();
  } else if (options.transformed) {
    outputData = transform(parseResult);
  } else {
    outputData = parseResult.ast;
  }

  // Format JSON
  let jsonOutput: string;
  if (options.compact) {
    jsonOutput = options.transformed && !options.state
      ? toCompactJSON(outputData)
      : JSON.stringify(outputData);
  } else {
    jsonOutput = options.transformed && !options.state
      ? toJSON(outputData)
      : JSON.stringify(outputData, null, 2);
  }

  // Output
  if (options.output) {
    const writeResult = writeFile(options.output, jsonOutput);
    if (!writeResult.success) {
      printError(writeResult.error!);
      process.exit(ExitCodes.IO_ERROR);
    }
    printSuccess(`AST written to ${options.output}`);
  } else {
    console.log(jsonOutput);
  }

  process.exit(ExitCodes.SUCCESS);
}
