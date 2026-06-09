# 05 — EXIT CODES

```yaml
FILE: 05-EXIT-CODES.md
SYSTEM: @artoon/cli
AI_PRIORITY: CRITICAL
LAST_UPDATED: 2026-01-12
```

<!-- AI_INSTRUCTION: Exit code contracts. Use for scripting and CI/CD integration. -->

---

## 📋 EXIT CODE TABLE

| Code | Name | Description | Commands |
|------|------|-------------|----------|
| 0 | SUCCESS | Operation completed successfully | All |
| 1 | SYNTAX_ERROR | Parse error in input file | All |
| 2 | VALIDATION_ERROR | Validation error found | validate, lint |
| 3 | PHILOSOPHY_BREACH | Philosophy breach (strict mode) | validate, lint |
| 4 | FILE_NOT_FOUND | Input file not found | All |
| 5 | IO_ERROR | File read/write error | All |
| 99 | UNKNOWN_ERROR | Unexpected error | All |

---

## 🔧 EXIT CODE DEFINITIONS

```typescript
export const ExitCodes = {
  SUCCESS: 0,
  SYNTAX_ERROR: 1,
  VALIDATION_ERROR: 2,
  PHILOSOPHY_BREACH: 3,
  FILE_NOT_FOUND: 4,
  IO_ERROR: 5,
  UNKNOWN_ERROR: 99,
} as const;
```

---

## 📊 EXIT CODE BY COMMAND

### parse

| Code | When |
|------|------|
| 0 | Parse successful |
| 1 | Parse error (invalid syntax) |
| 4 | Input file not found |
| 5 | Output file write error |

### render

| Code | When |
|------|------|
| 0 | Render successful |
| 1 | Parse error (invalid syntax) |
| 4 | Input file not found |
| 5 | Output file write error |

### validate / lint

| Code | When |
|------|------|
| 0 | Valid (no errors) |
| 1 | Parse error (invalid syntax) |
| 2 | Validation error |
| 3 | Philosophy breach (strict mode only) |
| 4 | Input file not found |

---

## 🔧 EXIT CODE DECISION FLOW

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXIT CODE DECISION TREE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   START                                                                 │
│     │                                                                   │
│     ▼                                                                   │
│   File exists?                                                          │
│     │                                                                   │
│     ├── NO ──────────────────────────────────► exit(4) FILE_NOT_FOUND  │
│     │                                                                   │
│     └── YES                                                             │
│           │                                                             │
│           ▼                                                             │
│         Read file OK?                                                   │
│           │                                                             │
│           ├── NO ────────────────────────────► exit(5) IO_ERROR        │
│           │                                                             │
│           └── YES                                                       │
│                 │                                                       │
│                 ▼                                                       │
│               Parse OK?                                                 │
│                 │                                                       │
│                 ├── NO ──────────────────────► exit(1) SYNTAX_ERROR    │
│                 │                                                       │
│                 └── YES                                                 │
│                       │                                                 │
│                       ▼                                                 │
│                     [validate command only]                             │
│                       │                                                 │
│                       ▼                                                 │
│                     Validation errors?                                  │
│                       │                                                 │
│                       ├── YES ───────────────► exit(2) VALIDATION_ERROR│
│                       │                                                 │
│                       └── NO                                            │
│                             │                                           │
│                             ▼                                           │
│                           Philosophy breach + strict?                   │
│                             │                                           │
│                             ├── YES ─────────► exit(3) PHILOSOPHY_BREACH│
│                             │                                           │
│                             └── NO                                      │
│                                   │                                     │
│                                   ▼                                     │
│                                 Write output OK?                        │
│                                   │                                     │
│                                   ├── NO ────► exit(5) IO_ERROR        │
│                                   │                                     │
│                                   └── YES                               │
│                                         │                               │
│                                         ▼                               │
│                                       exit(0) SUCCESS                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💡 SCRIPTING EXAMPLES

### Bash

```bash
# Check if valid
artoon validate document.artoon
if [ $? -eq 0 ]; then
  echo "Document is valid"
else
  echo "Document has issues"
fi

# Handle specific exit codes
artoon validate document.artoon
case $? in
  0) echo "Valid" ;;
  1) echo "Syntax error" ;;
  2) echo "Validation error" ;;
  3) echo "Philosophy breach" ;;
  4) echo "File not found" ;;
  *) echo "Unknown error" ;;
esac

# Conditional execution
artoon validate doc.artoon && artoon render doc.artoon -o out.html
```

### PowerShell

```powershell
# Check exit code
artoon validate document.artoon
if ($LASTEXITCODE -eq 0) {
    Write-Host "Document is valid"
} else {
    Write-Host "Document has issues"
}

# Handle specific codes
artoon validate document.artoon
switch ($LASTEXITCODE) {
    0 { "Valid" }
    1 { "Syntax error" }
    2 { "Validation error" }
    3 { "Philosophy breach" }
    4 { "File not found" }
    default { "Unknown error" }
}
```

### CI/CD (GitHub Actions)

```yaml
- name: Validate ARTOON files
  run: |
    for file in docs/*.artoon; do
      artoon validate "$file" --strict
    done
  # Job fails if any file has exit code != 0
```

### Node.js

```javascript
const { execSync } = require('child_process');

try {
  execSync('artoon validate document.artoon', { stdio: 'inherit' });
  console.log('Valid');
} catch (error) {
  switch (error.status) {
    case 1: console.log('Syntax error'); break;
    case 2: console.log('Validation error'); break;
    case 3: console.log('Philosophy breach'); break;
    case 4: console.log('File not found'); break;
    default: console.log('Unknown error');
  }
}
```

---

## 📊 EXIT CODE CONTRACTS

```yaml
CONTRACT:
  - Exit code 0 ALWAYS means success
  - Exit code 1 ALWAYS means parse/syntax error
  - Exit code 2 ALWAYS means validation error
  - Exit code 3 ONLY in strict mode for philosophy breach
  - Exit code 4 ALWAYS means file not found
  - Exit code 5 ALWAYS means I/O error
  - Exit code 99 means unexpected/internal error

GUARANTEES:
  - Exit codes are stable across versions
  - Exit codes are documented
  - Exit codes are testable
  - Exit codes work with all shells
```
