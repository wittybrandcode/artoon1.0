# 02 — RESPONSIBILITIES

```yaml
FILE: 02-RESPONSIBILITIES.md
SYSTEM: @artoon/cli
AI_PRIORITY: CRITICAL
LAST_UPDATED: 2026-01-12
```

<!-- AI_INSTRUCTION: This file defines EXACTLY what CLI does. Use for understanding scope. -->

---

## 📋 RESPONSIBILITY MATRIX

| ID | Responsibility | Priority | Description |
|----|----------------|----------|-------------|
| R1 | Command orchestration | CRITICAL | Route commands to appropriate systems |
| R2 | File I/O | CRITICAL | Read input files, write output files |
| R3 | Exit code management | CRITICAL | Return correct exit codes |
| R4 | Output formatting | HIGH | Format JSON, HTML output |
| R5 | Error reporting | HIGH | Report errors to stderr |
| R6 | Option parsing | HIGH | Parse command-line options |
| R7 | Help/version display | MEDIUM | Show help and version info |

---

## 🔧 R1: COMMAND ORCHESTRATION

```typescript
// CLI orchestrates the pipeline
artoon parse file.artoon
  → readFile()
  → parse()
  → [transform()]
  → formatJSON()
  → output()

artoon validate file.artoon
  → readFile()
  → parse()
  → transform()
  → validate()
  → formatIssues()
  → output()

artoon render file.artoon
  → readFile()
  → parse()
  → transform()
  → render()
  → output()
```

---

## 🔧 R2: FILE I/O

```typescript
// Read input file
const fileResult = readFile(filePath);
if (!fileResult.success) {
  printError(fileResult.error);
  process.exit(ExitCodes.FILE_NOT_FOUND);
}

// Write output file
const writeResult = writeFile(outputPath, content);
if (!writeResult.success) {
  printError(writeResult.error);
  process.exit(ExitCodes.IO_ERROR);
}
```

### File Operations

| Operation | Description |
|-----------|-------------|
| `readFile(path)` | Read file content as UTF-8 |
| `writeFile(path, content)` | Write content to file |
| `isArtoonFile(path)` | Check if file is .artoon or .toon |
| `getOutputPath(input, ext)` | Generate output path |

---

## 🔧 R3: EXIT CODE MANAGEMENT

```typescript
// Exit codes are contracts
export const ExitCodes = {
  SUCCESS: 0,           // Everything OK
  SYNTAX_ERROR: 1,      // Parse error
  VALIDATION_ERROR: 2,  // Validation error
  PHILOSOPHY_BREACH: 3, // Philosophy breach (strict mode)
  FILE_NOT_FOUND: 4,    // Input file not found
  IO_ERROR: 5,          // File read/write error
  UNKNOWN_ERROR: 99,    // Unexpected error
} as const;
```

### Exit Code Decision Tree

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXIT CODE DECISION                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   File exists?                                                          │
│   ├── NO  → exit(4) FILE_NOT_FOUND                                     │
│   └── YES → Parse file                                                  │
│             ├── Parse errors? → exit(1) SYNTAX_ERROR                   │
│             └── Parse OK → Validate                                     │
│                           ├── Validation errors? → exit(2)             │
│                           ├── Philosophy breach + strict? → exit(3)    │
│                           └── All OK → exit(0) SUCCESS                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 R4: OUTPUT FORMATTING

```typescript
// JSON output (parse command)
if (options.compact) {
  jsonOutput = JSON.stringify(data);
} else {
  jsonOutput = JSON.stringify(data, null, 2);
}

// HTML output (render command)
if (options.full) {
  html = renderFull(ast, renderOptions);
} else {
  html = render(ast, renderOptions);
}

// Validation output
if (options.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  // Human-readable format
  for (const issue of issues) {
    console.log(formatIssue(issue));
  }
}
```

---

## 🔧 R5: ERROR REPORTING

```typescript
// Errors go to stderr
function printError(message: string): void {
  console.error(colors.error('✗'), message);
}

// Warnings go to stderr
function printWarning(message: string): void {
  console.log(colors.warning('⚠'), message);
}

// Success messages
function printSuccess(message: string): void {
  console.log(colors.success('✓'), message);
}
```

### Error Format

```
✗ File not found: document.artoon
✗ line 5: Invalid direction marker
⚠ line 10: [WARN] Empty paragraph
```

---

## 🔧 R6: OPTION PARSING

```typescript
// Using commander.js
program
  .command('parse <file>')
  .option('-o, --output <file>', 'Output file')
  .option('-c, --compact', 'Compact JSON')
  .option('-t, --transformed', 'Canonical AST')
  .action(parseCommand);
```

### Options by Command

| Command | Options |
|---------|---------|
| `parse` | `-o`, `-c`, `-t` |
| `render` | `-o`, `-f`, `--no-direction` |
| `validate` | `-s`, `-q`, `--json` |

---

## 🔧 R7: HELP/VERSION DISPLAY

```bash
# Version
artoon --version
# 1.0.0

# Help
artoon --help
# Usage: artoon [options] [command]
# 
# ARTOON - Semantic Content Format CLI
# 
# Options:
#   -v, --version   Show version number
#   -h, --help      display help for command
# 
# Commands:
#   parse <file>    Parse ARTOON file to AST (JSON)
#   render <file>   Render ARTOON file to HTML
#   validate <file> Validate ARTOON file
#   lint <file>     Alias for validate
```

---

## 📊 RESPONSIBILITY BOUNDARIES

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLI RESPONSIBILITIES                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ✅ DOES:                                                              │
│   ├── Parse command-line arguments                                      │
│   ├── Read/write files                                                  │
│   ├── Call core systems (parser, ast, validator, renderer)             │
│   ├── Format output (JSON, HTML, human-readable)                       │
│   ├── Report errors to stderr                                          │
│   ├── Return appropriate exit codes                                    │
│   └── Display help and version                                         │
│                                                                         │
│   ❌ DOES NOT:                                                          │
│   ├── Implement parsing logic                                          │
│   ├── Implement validation rules                                       │
│   ├── Implement rendering logic                                        │
│   ├── Make semantic decisions                                          │
│   └── Transform AST structure                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
