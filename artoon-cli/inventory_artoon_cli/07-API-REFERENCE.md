# 07 — API REFERENCE

```yaml
FILE: 07-API-REFERENCE.md
SYSTEM: @artoon/cli
AI_PRIORITY: HIGH
LAST_UPDATED: 2026-01-12
```

<!-- AI_INSTRUCTION: Internal API reference. Use for extending CLI. -->

---

## 📋 MODULE STRUCTURE

```
src/
├── index.ts          # Main entry point
├── version.ts        # Version constant
├── commands/
│   ├── parse.ts      # parse command
│   ├── render.ts     # render command
│   └── validate.ts   # validate command
└── utils/
    ├── exit-codes.ts # Exit code constants
    ├── file.ts       # File I/O utilities
    └── output.ts     # Console output formatting
```

---

## 🔧 COMMANDS

### parseCommand

```typescript
// src/commands/parse.ts
function parseCommand(file: string, options: ParseOptions): void;

interface ParseOptions {
  output?: string;      // Output file path
  compact?: boolean;    // Compact JSON
  transformed?: boolean; // Canonical AST
}
```

### renderCommand

```typescript
// src/commands/render.ts
function renderCommand(file: string, options: RenderOptions): void;

interface RenderOptions {
  output?: string;    // Output file path
  full?: boolean;     // Full HTML document
  direction?: boolean; // Include direction attributes
}
```

### validateCommand

```typescript
// src/commands/validate.ts
function validateCommand(file: string, options: ValidateOptions): void;

interface ValidateOptions {
  strict?: boolean;  // Treat warnings as errors
  quiet?: boolean;   // Only show errors
  json?: boolean;    // JSON output
}
```

---

## 🔧 UTILITIES

### Exit Codes

```typescript
// src/utils/exit-codes.ts
export const ExitCodes = {
  SUCCESS: 0,
  SYNTAX_ERROR: 1,
  VALIDATION_ERROR: 2,
  PHILOSOPHY_BREACH: 3,
  FILE_NOT_FOUND: 4,
  IO_ERROR: 5,
  UNKNOWN_ERROR: 99,
} as const;

export type ExitCode = typeof ExitCodes[keyof typeof ExitCodes];
```

### File Utilities

```typescript
// src/utils/file.ts
interface FileResult {
  success: boolean;
  content?: string;
  error?: string;
}

function readFile(filePath: string): FileResult;
function writeFile(filePath: string, content: string): FileResult;
function isArtoonFile(filePath: string): boolean;
function getOutputPath(inputPath: string, extension: string): string;
```

### Output Utilities

```typescript
// src/utils/output.ts
const colors: {
  success: ChalkFunction;
  error: ChalkFunction;
  warning: ChalkFunction;
  info: ChalkFunction;
  dim: ChalkFunction;
  bold: ChalkFunction;
};

function printSuccess(message: string): void;
function printError(message: string): void;
function printWarning(message: string): void;
function printInfo(message: string): void;
function printDivider(): void;

interface ValidationIssue {
  code: string;
  message: string;
  line?: number;
  severity: 'error' | 'warning' | 'info';
}

function formatIssue(issue: ValidationIssue): string;
function formatSummary(errors: number, warnings: number): string;
```

---

## 🔧 VERSION

```typescript
// src/version.ts
export const version = '1.0.0';
```

---

## 📊 DEPENDENCIES

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@artoon/parser` | ^1.0.0 | Parse ARTOON text |
| `@artoon/ast` | ^1.0.0 | Transform AST |
| `@artoon/validator` | ^1.0.0 | Validate AST |
| `@artoon/renderer-html` | ^1.0.0 | Render to HTML |
| `commander` | ^11.1.0 | CLI framework |
| `chalk` | ^4.1.2 | Terminal colors |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.3.0 | TypeScript compiler |
| `jest` | ^29.7.0 | Testing |
| `ts-jest` | ^29.1.0 | Jest TypeScript support |
| `@types/node` | ^20.10.0 | Node.js types |
| `@types/jest` | ^29.5.0 | Jest types |

---

## 🔧 MAIN ENTRY POINT

```typescript
// src/index.ts
#!/usr/bin/env node

import { Command } from 'commander';
import { parseCommand } from './commands/parse';
import { renderCommand } from './commands/render';
import { validateCommand } from './commands/validate';
import { version } from './version';

const program = new Command();

program
  .name('artoon')
  .description('ARTOON - Semantic Content Format CLI')
  .version(version, '-v, --version', 'Show version number');

// Commands registered here...

program.parse();
```

---

## 📊 COMMAND REGISTRATION

```typescript
// parse command
program
  .command('parse <file>')
  .description('Parse ARTOON file to AST (JSON)')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option('-c, --compact', 'Compact JSON output')
  .option('-t, --transformed', 'Output canonical AST (transformed)')
  .action(parseCommand);

// render command
program
  .command('render <file>')
  .description('Render ARTOON file to HTML')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option('-f, --full', 'Generate full HTML document')
  .option('--no-direction', 'Disable direction attributes')
  .action(renderCommand);

// validate command
program
  .command('validate <file>')
  .description('Validate ARTOON file')
  .option('-s, --strict', 'Strict mode (warnings as errors)')
  .option('-q, --quiet', 'Only show errors, no summary')
  .option('--json', 'Output as JSON')
  .action(validateCommand);

// lint alias
program
  .command('lint <file>')
  .description('Alias for validate')
  .option('-s, --strict', 'Strict mode')
  .option('-q, --quiet', 'Only show errors')
  .option('--json', 'Output as JSON')
  .action(validateCommand);
```

---

## 💡 EXTENDING CLI

```typescript
// Add new command
program
  .command('inspect <file>')
  .description('Inspect ARTOON file structure')
  .option('-d, --depth <n>', 'Max depth', '3')
  .action((file, options) => {
    // Implementation
  });

// Add global option
program
  .option('--verbose', 'Verbose output');

// Access global options in command
function myCommand(file: string, options: any) {
  const verbose = program.opts().verbose;
}
```
