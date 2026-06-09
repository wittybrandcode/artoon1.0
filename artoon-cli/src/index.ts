#!/usr/bin/env node

import { Command } from 'commander';
import { parseCommand } from './commands/parse.js';
import { renderCommand } from './commands/render.js';
import { validateCommand } from './commands/validate.js';
import { migrateCommand } from './commands/migrate.js';
import { convertCommand } from './commands/convert.js';
import { formatCommand } from './commands/format.js';
import { version } from './version.js';

const program = new Command();

program
  .name('artoon')
  .description('ARTOON - Semantic Content Format CLI')
  .version(version, '-v, --version', 'Show version number');

// Parse command
program
  .command('parse <file>')
  .description('Parse ARTOON file to AST (JSON)')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option('-c, --compact', 'Compact JSON output')
  .option('-t, --transformed', 'Output canonical AST (transformed)')
  .option('--state', 'Output EditorState JSON (unified state kernel)')
  .action(parseCommand);

// Render command
program
  .command('render <file>')
  .description('Render ARTOON file to HTML')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option('-f, --full', 'Generate full HTML document')
  .option('--no-direction', 'Disable direction attributes')
  .action(renderCommand);

// Validate command
program
  .command('validate <file>')
  .description('Validate ARTOON file')
  .option('-s, --strict', 'Strict mode (warnings as errors)')
  .option('-q, --quiet', 'Only show errors, no summary')
  .option('--json', 'Output as JSON')
  .action(validateCommand);

// Lint alias
program
  .command('lint <file>')
  .description('Alias for validate')
  .option('-s, --strict', 'Strict mode')
  .option('-q, --quiet', 'Only show errors')
  .option('--json', 'Output as JSON')
  .action(validateCommand);

// Migrate command
program
  .command('migrate <directory_or_file>')
  .description('Upgrade old ARTOON format documents to Version 2.0')
  .option('--dry-run', 'Preview changes without overwriting files')
  .action(migrateCommand);

// Convert command
program
  .command('convert <format> <file>')
  .description('Convert ARTOON to other formats (html, md, artoon)')
  .option('-o, --output <file>', 'Output file (default: auto-generated)')
  .action(convertCommand);

// Format command
program
  .command('format <file>')
  .description('Format/pretty-print ARTOON file')
  .option('--write', 'Overwrite file in place')
  .action(formatCommand);

program.parse();
